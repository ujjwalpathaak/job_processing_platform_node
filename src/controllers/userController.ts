import { Request, Response } from "express";
import * as userService from "../services/userService";
import { CreateUserRequest, UpdateUserRequest } from "../models/User";
import * as ApiResponse from "../dto/ApiResponse";

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    res.json(ApiResponse.success(users));
  } catch (error) {
    res.status(500).json(ApiResponse.failure("Failed to fetch users"));
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(Number(id));

    if (!user) {
      res.status(404).json(ApiResponse.failure("User not found"));
      return;
    }

    res.json(ApiResponse.success(user));
  } catch (error) {
    res.status(500).json(ApiResponse.failure("Failed to fetch user"));
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const body: CreateUserRequest = req.body;

    if (!body.email || !body.name) {
      res.status(400).json(ApiResponse.failure("Email and name are required"));
      return;
    }

    const existingUser = await userService.getUserByEmail(body.email);
    if (existingUser) {
      res.status(409).json(ApiResponse.failure("User with this email already exists"));
      return;
    }

    const user = await userService.createUser(body);
    res.status(201).json(ApiResponse.success(user, "User created successfully"));
  } catch (error) {
    res.status(500).json(ApiResponse.failure("Failed to create user"));
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const body: UpdateUserRequest = req.body;

    if (body.email) {
      const existingUser = await userService.getUserByEmail(body.email);
      if (existingUser && existingUser.id !== Number(id)) {
        res.status(409).json(ApiResponse.failure("Email already in use"));
        return;
      }
    }

    const user = await userService.updateUser(Number(id), body);

    if (!user) {
      res.status(404).json(ApiResponse.failure("User not found"));
      return;
    }

    res.json(ApiResponse.success(user, "User updated successfully"));
  } catch (error) {
    res.status(500).json(ApiResponse.failure("Failed to update user"));
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await userService.deleteUser(Number(id));

    if (!deleted) {
      res.status(404).json(ApiResponse.failure("User not found"));
      return;
    }

    res.json(ApiResponse.success(undefined, "User deleted successfully"));
  } catch (error) {
    res.status(500).json(ApiResponse.failure("Failed to delete user"));
  }
};
