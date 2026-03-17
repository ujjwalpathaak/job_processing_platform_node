import { Request, Response } from "express";
import ApiResponse from "../dto/api-dtos";
import { RAGQueryRequest } from "../dto/rag-dtos";
import { runRagQuery } from "../services/rag-query-service";

export const ragQuery = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Partial<RAGQueryRequest>;
  if (!payload.query || !payload.query.trim()) {
    return res.status(400).json(ApiResponse.failure("query is required"));
  }

  const result = await runRagQuery(payload.query, payload.topK);
  return res.status(200).json(ApiResponse.success(result, "RAG query completed"));
};
