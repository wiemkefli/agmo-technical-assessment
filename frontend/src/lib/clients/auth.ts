import { apiRequest } from "@/lib/api";
import type { Role, User } from "@/lib/types";

export async function login(params: { email: string; password: string }) {
  return apiRequest<{ data: User; token: string }>("auth/login", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function register(params: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: Role;
}) {
  return apiRequest<{ data: User; token: string }>("auth/register", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function logout(token: string) {
  return apiRequest("auth/logout", {
    method: "POST",
    token,
  });
}

export async function me(token: string) {
  return apiRequest<{ data: User }>("auth/me", { token });
}

