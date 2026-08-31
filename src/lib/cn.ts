type ClassValue = string | number | false | null | undefined;

/** Tiny classnames joiner. No conflict resolution — keep class lists tidy. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
