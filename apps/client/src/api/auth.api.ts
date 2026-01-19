import { api } from "@/api/axios";
import { authResponseSchema } from "@/schema/auth.schema";
import { useAuthStore } from "@/store/auth.store";

export async function signup(email: string, password: string, name: string) {
  const res = await api.post("/auth/signup", { email, password, name });
  const parsed = authResponseSchema.parse(res.data);
  useAuthStore.getState().login(parsed);
}

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  const parsed = authResponseSchema.parse(res.data);
  useAuthStore.getState().login(parsed);
}

export async function logout() {
  await api.post("/auth/logout");
  useAuthStore.getState().logout();
}
