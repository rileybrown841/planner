/**
 * Zips the repeated `break-*` form fields (from <BreaksEditor>) into raw row
 * objects for zod to validate. Mirrors `src/lib/meetings.ts`.
 */
export function readBreaks(formData: FormData) {
  const names = formData.getAll("break-name");
  const starts = formData.getAll("break-start");
  const ends = formData.getAll("break-end");

  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < names.length; i++) {
    if (!names[i] && !starts[i] && !ends[i]) continue;
    rows.push({ name: names[i], start: starts[i], end: ends[i] });
  }
  return rows;
}
