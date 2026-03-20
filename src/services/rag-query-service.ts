import { config } from "../config/config";
import { RAGFilters, RetrievedChunk } from "../dto/rag-dtos";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JobHandlerTypes } from "../enums/job-enums";
import { embedText } from "./embedding-service";
import { searchJobChunksByColumnsWithEmbedding } from "../repositories/job-chunk-repository";

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
      `Extract filters for log retrieval.

      Output format:
      {{
        "job_id": "<UUID, optional>",
        "handler": "<LOWERCASE value from: ${Object.keys(JobHandlerTypes).join(", ")}, optional>"
      }}

      Rules:
      - Return ONLY valid JSON.
      - Do NOT include extra keys.
      - Do NOT include null values; omit missing fields.
      - Do NOT include any explanation or text outside the JSON.`,
    ],
    ["human", "{queryText}"],
  ]);

  const raw = await filterPrompt
    .pipe(getChatModel(0))
    .pipe(new StringOutputParser())
    .invoke({ queryText });

  try {
    const parsed = await new JsonOutputParser<RAGFilters>().parse(raw);
    const obj: RAGFilters = {};
    if (parsed.job_id) {
      obj.job_id = parsed.job_id;
    }
    if (parsed.handler) {
      obj.handler = parsed.handler.toLowerCase();
    }
    return obj;
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
      `You are a log analysis assistant.
      Your task is to answer the user's query using the provided log chunks.

      Guidelines:
      - Base your answer ONLY on the retrieved logs.
      - Assume the user is a developer or operator familiar with log analysis, but do NOT assume they have seen these specific logs before.
      - Do NOT assume missing information.
      - Show all timestamps in Indian Standard Time (IST).
      - If the logs do not contain enough information, say "Insufficient data".
      - Be concise, factual, and directly relevant to the query.
      - Use chronological reasoning when helpful.
      - Highlight relevant events (info, errors) based on the query—not just errors.

      Output format:
      - Answer: <concise response>
      - Evidence: <1–3 short bullet points from logs>`,
    ],
    [
      "human",
      `User query:
      {queryText}

      Retrieved logs:
      {context}`,
    ],
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
  const embedding = await embedText(queryText);
  return searchJobChunksByColumnsWithEmbedding(embedding, filters, topK);
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
