export function isMissingRelationError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const candidate = error as { code?: string; message?: string };

  return (
    candidate.code === "42P01" ||
    Boolean(candidate.message?.toLowerCase().includes("does not exist"))
  );
}
