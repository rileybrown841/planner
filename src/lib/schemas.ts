import { z } from "zod";
import { DAY_KEYS } from "@/lib/days";
import { CLASS_COLOR_HEXES } from "@/lib/colors";
import { PRIORITIES, STATUSES } from "@/lib/priority";

const colorField = z
  .string()
  .optional()
  .transform((v) => v ?? null)
  .refine((v) => v === null || CLASS_COLOR_HEXES.includes(v), {
    error: "Pick a colour from the palette.",
  });

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => v || null);

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
  code: optionalText(40),
  instructor: optionalText(120),
  location: optionalText(120),
  color: colorField,
  schedule: z.array(classMeetingSchema).max(14),
});

export const extracurricularSchema = z.object({
  name: z.string().trim().min(1, "Give the activity a name.").max(120),
  type: z.enum(["club", "job", "sport", "volunteer", "other"]),
  color: colorField,
  schedule: z.array(classMeetingSchema).max(14),
});

/** `link` field: "class:<uuid>" | "activity:<uuid>" | "" → class_id / extracurricular_id */
const linkField = z
  .string()
  .optional()
  .transform((v) => {
    if (!v) return { class_id: null, extracurricular_id: null };
    const [kind, id] = v.split(":");
    if (kind === "class" && id) return { class_id: id, extracurricular_id: null };
    if (kind === "activity" && id) return { class_id: null, extracurricular_id: id };
    return { class_id: null, extracurricular_id: null };
  });

export const taskSchema = z.object({
  title: z.string().trim().min(1, "A task needs a title.").max(200),
  description: optionalText(2000),
  due_at: z
    .union([z.iso.datetime({ offset: true }), z.literal("")])
    .transform((v) => v || null),
  priority: z.enum(PRIORITIES).default("medium"),
  status: z.enum(STATUSES).default("todo"),
  link: linkField,
});

/** Quick-add: just a title, plus whatever optional bits the mini form offers. */
export const quickTaskSchema = z.object({
  title: z.string().trim().min(1, "A task needs a title.").max(200),
  due_at: z
    .union([z.iso.datetime({ offset: true }), z.literal("")])
    .transform((v) => v || null),
  priority: z.enum(PRIORITIES).default("medium"),
  link: linkField,
});

export type SemesterValues = z.infer<typeof semesterSchema>;
export type ClassValues = z.infer<typeof classSchema>;
export type TaskValues = z.infer<typeof taskSchema>;
export type ExtracurricularValues = z.infer<typeof extracurricularSchema>;
