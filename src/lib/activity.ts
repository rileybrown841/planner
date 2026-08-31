import type { ActivityType } from "@/lib/types";

export const ACTIVITY_TYPES = [
  "club",
  "job",
  "sport",
  "volunteer",
  "other",
] as const satisfies readonly ActivityType[];

export const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  club: "Club",
  job: "Job",
  sport: "Sport",
  volunteer: "Volunteering",
  other: "Other",
};
