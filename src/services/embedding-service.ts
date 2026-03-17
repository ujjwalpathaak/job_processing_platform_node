import { config } from "../config/config";
import { OpenAIEmbeddings } from "@langchain/openai";

let embeddingsClient: OpenAIEmbeddings | null = null;

export const getEmbeddingsClient = (): OpenAIEmbeddings => {
  if (!config.openai.apiKey) {
    throw new Error("OpenAI API key is not configured.");
  }

  if (!embeddingsClient) {
    embeddingsClient = new OpenAIEmbeddings({
      apiKey: config.openai.apiKey,
      model: config.rag.embeddingModel,
      dimensions: config.rag.embeddingDimensions,
      configuration: {
        baseURL: config.openai.baseUrl,
      },
    });
  }

  return embeddingsClient;
};

export const embedText = async (input: string): Promise<number[]> => {
  const embedding = await getEmbeddingsClient().embedQuery(input);

  if (!embedding || embedding.length !== config.rag.embeddingDimensions) {
    throw new Error("Invalid embedding response from LLM");
  }

  return embedding;
};
