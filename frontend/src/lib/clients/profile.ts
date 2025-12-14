import { apiRequest } from "@/lib/api";
import type { Role, User } from "@/lib/types";

export async function updateProfile(
  params: { role: Role; company?: string | null; website?: string | null; phone?: string | null; location?: string | null },
  token: string,
) {
  const payload =
    params.role === "employer"
      ? { company: params.company ?? null, website: params.website ?? null }
      : { phone: params.phone ?? null, location: params.location ?? null };

  return apiRequest("profile", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function uploadResume(file: File, token: string) {
  const form = new FormData();
  form.append("resume", file);

  return apiRequest("profile/resume", {
    method: "POST",
    token,
    body: form,
    isFormData: true,
  });
}

export async function deleteResume(token: string) {
  return apiRequest("profile/resume", { method: "DELETE", token });
}

export async function fetchMe(token: string) {
  return apiRequest<{ data: User }>("auth/me", { token });
}

