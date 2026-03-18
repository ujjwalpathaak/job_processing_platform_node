import { config } from "../config/config";
import { RAGFilters, RetrievedChunk } from "../dto/rag-dtos";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getPgVectorStore } from "./langchain-pgvector-service";

const KNOWN_SOURCES = ["HANDLER", "SYSTEM"];
const KNOWN_STREAMS = ["APPLICATION", "ERROR", "HANDLER_APPLICATION", "HANDLER_ERROR", "MIXED"];

const toRetrieverFilter = (filters: RAGFilters): Record<string, string> | undefined => {
  const normalized: Record<string, string> = {};

  if (filters.handler) {
    normalized.handler = filters.handler;
  }

  if (filters.log_level) {
    normalized.log_level = filters.log_level.toUpperCase();
  }

  if (filters.log_source) {
    normalized.log_source = filters.log_source.toUpperCase();
  }

  if (filters.log_stream) {
    normalized.log_stream = filters.log_stream.toUpperCase();
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

const toRetrievedChunk = (doc: {
  id?: string;
  pageContent: string;
  metadata?: Record<string, unknown>;
}): RetrievedChunk => {
  const metadata = doc.metadata ?? {};
  const parsedId = Number.parseInt(String(doc.id ?? metadata.id ?? "0"), 10);

  return {
    id: Number.isNaN(parsedId) ? 0 : parsedId,
    job_id: String(metadata.job_id ?? ""),
    handler: String(metadata.handler ?? "unknown"),
    log_level: String(metadata.log_level ?? "INFO"),
    log_source: String(metadata.log_source ?? "SYSTEM"),
    log_stream: String(metadata.log_stream ?? "APPLICATION"),
    content: doc.pageContent,
    created_at: String(metadata.created_at ?? new Date().toISOString()),
    similarity: 0,
  };
};

const getChatModel = (temperature: number): ChatGoogleGenerativeAI => {
  if (!config.gemini.apiKey) {
    throw new Error("Google API key is not configured.");
  }

  if (!config.gemini.chatModel) {
    throw new Error("Gemini model is not configured.");
  }

  return new ChatGoogleGenerativeAI({
    apiKey: config.gemini.apiKey,
    model: config.gemini.chatModel,
    temperature,
    ...(config.gemini.baseUrl && { baseUrl: config.gemini.baseUrl }),
  });
};

const extractFiltersWithLLM = async (queryText: string): Promise<RAGFilters> => {
  const filterPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Extract filters for log retrieval. Return only JSON with optional keys: handler, log_level, log_source, log_stream. Use uppercase values for log_level, log_source, log_stream.",
    ],
    ["human", "{queryText}"],
  ]);

  const raw = await filterPrompt
    .pipe(getChatModel(0))
    .pipe(new StringOutputParser())
    .invoke({ queryText });

  try {
    const parsed = await new JsonOutputParser<RAGFilters>().parse(raw);
    return {
      handler: parsed.handler,
      log_level: parsed.log_level?.toUpperCase(),
      log_source:
        parsed.log_source && KNOWN_SOURCES.includes(parsed.log_source.toUpperCase())
          ? parsed.log_source.toUpperCase()
          : undefined,
      log_stream:
        parsed.log_stream && KNOWN_STREAMS.includes(parsed.log_stream.toUpperCase())
          ? parsed.log_stream.toUpperCase()
          : undefined,
    };
  } catch (_error) {
    throw new Error("Failed to parse LLM response");
  }
};

const synthesizeWithLLM = async (queryText: string, chunks: RetrievedChunk[]): Promise<string> => {
  if (chunks.length === 0) {
    return "No relevant information found in the logs for this query.";
  }

  const context = chunks
    .map((chunk, index) => `Chunk ${index + 1}:\n${chunk.content}`)
    .join("\n\n");

  if (!config.gemini.apiKey) {
    throw new Error("Google API key is not configured.");
  }

  const synthesisPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a log analysis assistant. Summarize root cause from retrieved chunks and keep answer concise and factual.",
    ],
    ["human", "User query:\n{queryText}\n\nRetrieved chunks:\n{context}"],
  ]);

  const answer = await synthesisPrompt
    .pipe(getChatModel(0.1))
    .pipe(new StringOutputParser())
    .invoke({ queryText, context });

  return answer || chunks[0].content;
};

const retrieveChunksWithRetriever = async (
  queryText: string,
  filters: RAGFilters,
  topK: number,
): Promise<RetrievedChunk[]> => {
  const vectorStore = await getPgVectorStore();
  const retriever = vectorStore.asRetriever({
    k: topK,
    filter: toRetrieverFilter(filters),
  });

  const docs = await retriever.invoke(queryText);
  return docs.map((doc) =>
    toRetrievedChunk({
      id: doc.id,
      pageContent: doc.pageContent,
      metadata: (doc.metadata ?? {}) as Record<string, unknown>,
    }),
  );
};

export const runRagQuery = async (
  userQuery: string,
  topK: number = config.rag.topK,
): Promise<{ filters: RAGFilters; chunks: RetrievedChunk[]; answer: string }> => {
  const chain = RunnableSequence.from([
    RunnableLambda.from(async (input: { queryText: string; k: number }) => {
      const filters = await extractFiltersWithLLM(input.queryText);
      return { ...input, filters };
    }),
    RunnableLambda.from(async (input: { queryText: string; k: number; filters: RAGFilters }) => {
      const chunks = await retrieveChunksWithRetriever(input.queryText, input.filters, input.k);
      return { ...input, chunks };
    }),
    RunnableLambda.from(
      async (input: { queryText: string; filters: RAGFilters; chunks: RetrievedChunk[] }) => {
        const answer = await synthesizeWithLLM(input.queryText, input.chunks);
        return {
          filters: input.filters,
          chunks: input.chunks,
          answer,
        };
      },
    ),
  ]);

  return chain.invoke({ queryText: userQuery, k: topK });
};
