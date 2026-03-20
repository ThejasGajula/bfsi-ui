import axios from "axios";
import { demoApiAdapter } from "./demoApi";
import { isDemoMode } from "../config/env";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
  ...(isDemoMode ? { adapter: demoApiAdapter } : {}),
});

export default apiClient;
