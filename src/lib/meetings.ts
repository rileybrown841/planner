/**
 * Zips the repeated `meeting-*` form fields (from <MeetingsEditor>) into raw row
 * objects for zod to validate. Shared by the class and extracurricular actions.
 */
export function readMeetings(formData: FormData) {
  const days = formData.getAll("meeting-day");
  const starts = formData.getAll("meeting-start");
  const ends = formData.getAll("meeting-end");
  const freqs = formData.getAll("meeting-freq");
  const anchors = formData.getAll("meeting-anchor");

  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < days.length; i++) {
    if (!days[i] && !starts[i] && !ends[i]) continue;
    const row: Record<string, unknown> = {
      day: days[i],
      start: starts[i],
      end: ends[i],
    };
    if (freqs[i]) row.freq = freqs[i];
    if (anchors[i]) row.anchor = anchors[i];
    rows.push(row);
  }
  return rows;
}
