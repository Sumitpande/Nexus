import { api } from "@/api/axios";

export async function searchUsers(q: string) {
  const res = await api.get("/users/search", {
    params: { q },
    headers: { "Cache-Control": "no-cache" },
  });
  return res.data;
}
