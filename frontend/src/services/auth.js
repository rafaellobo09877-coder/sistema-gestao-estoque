import { api } from "./api";

export async function login(email, password) {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  const token = response.data.token;

  if (token) {
    localStorage.setItem("token", token);
  }

  return response.data;
}