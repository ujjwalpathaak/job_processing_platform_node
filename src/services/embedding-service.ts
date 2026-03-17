import { config } from "../config/config";

export const embedText = async (input: string): Promise<number[]> => {
  const response = await fetch(`${config.openai.baseUrl}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openai.apiKey}`,
    },
    body: JSON.stringify({
      model: config.rag.embeddingModel,
      input,
      dimensions: config.rag.embeddingDimensions,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: Array<{ embedding?: number[] }>;
  };
  const embedding = payload.data?.[0]?.embedding;

  if (!embedding || embedding.length !== config.rag.embeddingDimensions) {
    throw new Error("Invalid embedding response from LLM");
  }

  return embedding;
};
