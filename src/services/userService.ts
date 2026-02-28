import { query } from "../database/connection";
import { User, CreateUserRequest, UpdateUserRequest } from "../models/User";

export const getAllUsers = async (): Promise<User[]> => {
  const result = await query("SELECT * FROM users ORDER BY created_at DESC");
  return result.rows as User[];
};

export const getUserById = async (id: number): Promise<User | null> => {
  const result = await query("SELECT * FROM users WHERE id = $1", [id]);
  return (result.rows[0] as User) || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);
  return (result.rows[0] as User) || null;
};

export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const { email, name } = data;
  const result = await query(
    "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *",
    [email, name],
  );
  return result.rows[0] as User;
};

export const updateUser = async (
  id: number,
  data: UpdateUserRequest,
): Promise<User | null> => {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  let paramIndex = 1;

  if (data.email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    values.push(data.email);
  }
  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }

  if (fields.length === 0) return getUserById(id);

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values,
  );

  return (result.rows[0] as User) || null;
};

export const deleteUser = async (id: number): Promise<boolean> => {
  const result = await query("DELETE FROM users WHERE id = $1", [id]);
  return result.rowCount! > 0;
};
