export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export function validatePdfResume(file: File, maxBytes = MAX_RESUME_BYTES): string | null {
  const name = file.name?.toLowerCase() ?? "";
  const isPdfByName = name.endsWith(".pdf");
  const isPdfByType = file.type === "application/pdf";
  if (!isPdfByName && !isPdfByType) return "Resume must be a PDF file.";
  if (file.size > maxBytes) return "Resume file is too large (max 5MB).";
  return null;
}

