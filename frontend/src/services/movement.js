import { api } from "./api";

export const getMovements = (month, year) => {
  return api.get(`/movements?month=${month}&year=${year}`);
};