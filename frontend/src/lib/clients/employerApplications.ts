import { apiRequest } from "@/lib/api";
import type { Application } from "@/lib/types";

export async function updateStatus(applicationId: number, status: string, token: string) {
  return apiRequest<{ data: Application }>(`employer/applications/${applicationId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}

