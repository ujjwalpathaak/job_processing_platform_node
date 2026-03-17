import { config } from "../config/config";
import { RAGFilters, RetrievedChunk } from "../dto/rag-dtos";
import { searchChunksHybrid } from "../repositories/job-chunk-repository";
import { embedText } from "./embedding-service";

const KNOWN_SOURCES = ["HANDLER", "SYSTEM"];
const KNOWN_STREAMS = ["APPLICATION", "ERROR", "HANDLER_APPLICATION", "HANDLER_ERROR", "MIXED"];

const extractFiltersWithLLM = async (queryText: string): Promise<RAGFilters> => {
  const response = await fetch(`${config.openai.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openai.apiKey}`,
    },
    body: JSON.stringify({
      model: config.openai.chatModel,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Extract filters for log retrieval. Return JSON with optional keys: handler, log_level, log_source, log_stream. Use uppercase values for log_level, log_source, log_stream.",
        },
        {
          role: "user",
          content: queryText,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const raw = payload.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("LLM response missing content");
  }

  try {
    const parsed = JSON.parse(raw) as RAGFilters;
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
    throw new Error("No relevant chunk found for this query in the current retention window.");
  }

  const context = chunks
    .map((chunk, index) => `Chunk ${index + 1}:\n${chunk.content}`)
    .join("\n\n");

  if (!config.openai.apiKey) {
    throw new Error("OpenAI API key is not configured.");
  }

  const response = await fetch(`${config.openai.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openai.apiKey}`,
    },
    body: JSON.stringify({
      model: config.openai.chatModel,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You are a log analysis assistant. Summarize root cause from retrieved chunks and keep answer concise and factual.",
        },
        {
          role: "user",
          content: `User query:\n${queryText}\n\nRetrieved chunks:\n${context}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return payload.choices?.[0]?.message?.content || chunks[0].content;
};

export const runRagQuery = async (
  userQuery: string,
  topK: number = config.rag.topK,
): Promise<{ filters: RAGFilters; chunks: RetrievedChunk[]; answer: string }> => {
  const filters = await extractFiltersWithLLM(userQuery);
  const queryEmbedding = await embedText(userQuery);
  const chunks = await searchChunksHybrid(queryEmbedding, filters, topK);
  const answer = await synthesizeWithLLM(userQuery, chunks);

  return {
    filters,
    chunks,
    answer,
  };
};
