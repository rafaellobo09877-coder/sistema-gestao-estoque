import axios from "axios";

export const api = axios.create({
  baseURL: "https://estoque-backend-lc2x.onrender.com",
});

// 🔥 AQUI ESTÁ A CORREÇÃO
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});