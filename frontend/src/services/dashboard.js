import { api } from "./api";

export async function getDashboard(month, year) {
  const response = await api.get(`/dashboard?month=${month}&year=${year}`);
  return response.data;
}