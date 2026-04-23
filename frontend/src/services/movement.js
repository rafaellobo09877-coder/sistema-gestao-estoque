import { api } from "./api";

export async function getMovements(month, year) {
  const response = await api.get(`/movements?month=${month}&year=${year}`);
  return response.data;
}

export async function createMovement(data) {
  const response = await api.post("/movements", data);
  return response.data;
}