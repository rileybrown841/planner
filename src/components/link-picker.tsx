import type { ClassPickerGroup } from "@/lib/data/classes";
import type { Extracurricular } from "@/lib/types";
import { controlClass } from "@/components/ui/form-field";

/**
 * `<select name="link">` for attaching a task to a class or an activity.
 * Value is `""` | `class:<id>` | `activity:<id>` — parsed by `taskSchema`.
 * Server Component; no state needed.
 */
export function LinkPicker({
  classGroups,
  activities,
  defaultValue = "",
  id = "link",
}: {
  classGroups: ClassPickerGroup[];
  activities: Pick<Extracurricular, "id" | "name">[];
  defaultValue?: string;
  id?: string;
}) {
  return (
    <select id={id} name="link" defaultValue={defaultValue} className={controlClass}>
      <option value="">Not linked</option>

      {classGroups.map((group) => (
        <optgroup
          key={group.semesterId}
          label={group.isActive ? `${group.semesterName} (active)` : group.semesterName}
        >
          {group.classes.map((c) => (
            <option key={c.id} value={`class:${c.id}`}>
              {c.name}
            </option>
          ))}
        </optgroup>
      ))}

      {activities.length > 0 && (
        <optgroup label="Activities">
          {activities.map((a) => (
            <option key={a.id} value={`activity:${a.id}`}>
              {a.name}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
