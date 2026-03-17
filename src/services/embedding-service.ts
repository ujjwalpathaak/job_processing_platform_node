import { config } from "../config/config";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

let embeddingsClient: GoogleGenerativeAIEmbeddings | null = null;

export const getEmbeddingsClient = (): GoogleGenerativeAIEmbeddings => {
  if (!config.gemini.apiKey) {
    throw new Error("Google API key is not configured.");
  }

  if (!embeddingsClient) {
    embeddingsClient = new GoogleGenerativeAIEmbeddings({
      apiKey: config.gemini.apiKey,
      model: config.gemini.embeddingModel,
      baseUrl: config.gemini.baseUrl,
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
