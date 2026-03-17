import { config } from "../config/config";

const buildFallbackEmbedding = (input: string): number[] => {
  const dimensions = config.rag.embeddingDimensions;
  const vector = new Array<number>(dimensions).fill(0);

  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    vector[index % dimensions] += (code % 31) / 31;
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / magnitude);
};

export const embedText = async (input: string): Promise<number[]> => {
  if (!config.openai.apiKey) {
    return buildFallbackEmbedding(input);
  }

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
    return buildFallbackEmbedding(input);
  }

  const payload = (await response.json()) as {
    data?: Array<{ embedding?: number[] }>;
  };
  const embedding = payload.data?.[0]?.embedding;

  if (!embedding || embedding.length !== config.rag.embeddingDimensions) {
    return buildFallbackEmbedding(input);
  }

  return embedding;
};
