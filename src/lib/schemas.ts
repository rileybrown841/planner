import { z } from "zod";
import { DAY_KEYS } from "@/lib/days";
import { CLASS_COLOR_HEXES } from "@/lib/colors";

export const classMeetingSchema = z
  .object({
    day: z.enum(DAY_KEYS),
    start: z.iso.time({ precision: -1 }),
    end: z.iso.time({ precision: -1 }),
  })
  .refine((m) => m.end > m.start, {
    error: "End time must be after the start time.",
    path: ["end"],
  });

export const semesterSchema = z
  .object({
    name: z.string().trim().min(1, "Give the semester a name.").max(100),
    start_date: z.union([z.iso.date(), z.literal("")]).transform((v) => v || null),
    end_date: z.union([z.iso.date(), z.literal("")]).transform((v) => v || null),
  })
  .refine(
    (s) => !s.start_date || !s.end_date || s.end_date >= s.start_date,
    { error: "End date can't be before the start date.", path: ["end_date"] },
  );

export const classSchema = z.object({
  name: z.string().trim().min(1, "Give the class a name.").max(120),
  code: z.string().trim().max(40).optional().transform((v) => v ?? null),
  instructor: z.string().trim().max(120).optional().transform((v) => v ?? null),
  location: z.string().trim().max(120).optional().transform((v) => v ?? null),
  color: z
    .string()
    .optional()
    .transform((v) => v ?? null)
    .refine((v) => v === null || CLASS_COLOR_HEXES.includes(v), {
      error: "Pick a colour from the palette.",
    }),
  schedule: z.array(classMeetingSchema).max(14),
});

export type SemesterValues = z.infer<typeof semesterSchema>;
export type ClassValues = z.infer<typeof classSchema>;
