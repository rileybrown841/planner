/**
 * Hand-written shapes for the rows we read from Supabase. The Supabase client
 * isn't generic-typed yet (no `supabase gen types`), so query helpers cast their
 * results to these via `.returns<T>()`.
 */

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface ClassMeeting {
  day: DayKey;
  /** 24h "HH:MM" */
  start: string;
  /** 24h "HH:MM" */
  end: string;
}

export interface Semester {
  id: string;
  user_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  user_id: string;
  semester_id: string;
  name: string;
  code: string | null;
  instructor: string | null;
  location: string | null;
  color: string | null;
  schedule: ClassMeeting[];
  created_at: string;
  updated_at: string;
}

/** A class row joined with the parent semester (for the archived/read-only check). */
export interface ClassWithSemester extends Class {
  semester: Semester;
}
