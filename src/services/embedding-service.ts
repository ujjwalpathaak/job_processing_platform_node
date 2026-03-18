import { config } from "../config/config";
import { EmbeddingsInterface } from "@langchain/core/embeddings";

type GeminiTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

interface GeminiEmbedContentResponse {
  embedding?: {
    values?: number[];
  };
}

class GeminiCustomEmbeddings implements EmbeddingsInterface {
  private readonly apiKey: string;
  private readonly modelPath: string;
  private readonly endpointBaseUrl: string;
  private readonly outputDimensions: number;

  constructor(options: {
    apiKey: string;
    model: string;
    baseUrl?: string;
    outputDimensions: number;
  }) {
    this.apiKey = options.apiKey;
    this.modelPath = options.model.startsWith("models/")
      ? options.model
      : `models/${options.model}`;
    this.endpointBaseUrl = this.normalizeBaseUrl(options.baseUrl);
    this.outputDimensions = options.outputDimensions;
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return Promise.all(
      documents.map((document) => this.embedSingleText(document, "RETRIEVAL_DOCUMENT")),
    );
  }

  async embedQuery(document: string): Promise<number[]> {
    return this.embedSingleText(document, "RETRIEVAL_QUERY");
  }

  private normalizeBaseUrl(baseUrl?: string): string {
    const trimmedBaseUrl = (baseUrl || "https://generativelanguage.googleapis.com").replace(
      /\/+$/,
      "",
    );

    if (/\/v\d+(beta)?$/.test(trimmedBaseUrl)) {
      return trimmedBaseUrl;
    }

    return `${trimmedBaseUrl}/v1beta`;
  }

  private async embedSingleText(input: string, taskType: GeminiTaskType): Promise<number[]> {
    const response = await fetch(`${this.endpointBaseUrl}/${this.modelPath}:embedContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey,
      },
      body: JSON.stringify({
        model: this.modelPath,
        content: {
          parts: [{ text: input }],
        },
        taskType,
        outputDimensionality: this.outputDimensions,
      }),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(`Gemini embedding request failed (${response.status}): ${responseBody}`);
    }

    const data = (await response.json()) as GeminiEmbedContentResponse;
    const values = data.embedding?.values;

    if (!values || values.length !== this.outputDimensions) {
      throw new Error("Invalid embedding response from Gemini API");
    }

    return values;
  }
}

let embeddingsClient: EmbeddingsInterface | null = null;

export const getEmbeddingsClient = (): EmbeddingsInterface => {
  if (!config.gemini.apiKey) {
    throw new Error("Google API key is not configured.");
  }

  if (!config.gemini.embeddingModel) {
    throw new Error("Gemini embedding model is not configured.");
  }

  if (!embeddingsClient) {
    embeddingsClient = new GeminiCustomEmbeddings({
      apiKey: config.gemini.apiKey,
      model: config.gemini.embeddingModel,
      baseUrl: config.gemini.baseUrl,
      outputDimensions: config.rag.embeddingDimensions,
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
