import { Suspense } from "react";
import { JobsClient } from "./JobsClient";

export default function JobsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-600">Loading…</p>}>
      <JobsClient />
    </Suspense>
  );
}
