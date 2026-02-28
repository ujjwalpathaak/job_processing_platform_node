import * as userRepository from "../repositories/userRepository";
import { User, CreateUserRequest, UpdateUserRequest } from "../models/User";

export const getAllUsers = async (): Promise<User[]> => {
  return userRepository.findAll();
};

export const getUserById = async (id: number): Promise<User | null> => {
  return userRepository.findById(id);
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return userRepository.findByEmail(email);
};

export const createUser = async (data: CreateUserRequest): Promise<User> => {
  return userRepository.create(data);
};

export const updateUser = async (id: number, data: UpdateUserRequest): Promise<User | null> => {
  return userRepository.update(id, data);
};

export const deleteUser = async (id: number): Promise<boolean> => {
  return userRepository.delete_(id);
};
