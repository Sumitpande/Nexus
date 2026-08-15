import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost/api", // Use nginx gateway (port 80)
  withCredentials: true, // REQUIRED for httpOnly refresh cookie
});
