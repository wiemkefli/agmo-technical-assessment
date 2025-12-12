import type { Job } from "./types";

const numberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

export function formatSalary(
  job: Pick<Job, "salary_min" | "salary_max" | "salary_currency" | "salary_period">,
): string | null {
  const min = job.salary_min ?? null;
  const max = job.salary_max ?? null;
  const currency = job.salary_currency ?? null;
  const period = job.salary_period ?? null;

  if (min === null && max === null) return null;
  if (!currency || !period) return null;

  const range =
    min !== null && max !== null
      ? `${numberFormatter.format(min)} – ${numberFormatter.format(max)}`
      : min !== null
        ? `From ${numberFormatter.format(min)}`
        : `Up to ${numberFormatter.format(max ?? 0)}`;

  return `${currency} ${range} / ${period}`;
}

