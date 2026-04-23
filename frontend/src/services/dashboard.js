import { api } from "./api";

export const getDashboard = (month, year) => {
  return api.get(`/dashboard?month=${month}&year=${year}`);
};