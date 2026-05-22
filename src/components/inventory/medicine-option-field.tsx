"use client";

import { Label, Select, Input } from "@/components/ui/input";
import { MEDICINE_OPTION_OTHER } from "@/config/medicine-options";

type Props = {
  label: string;
  name: string;
  options: string[];
  value: string;
  otherValue: string;
  onValueChange: (v: string) => void;
  onOtherChange: (v: string) => void;
  placeholder?: string;
};

export function MedicineOptionField({
  label,
  name,
  options,
  value,
  otherValue,
  onValueChange,
  onOtherChange,
  placeholder = "Type custom value…",
}: Props) {
  const isOther = value === MEDICINE_OPTION_OTHER;

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      >
        <option value="">Select {label.toLowerCase()}…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value={MEDICINE_OPTION_OTHER}>Other (custom)…</option>
      </Select>
      {isOther && (
        <Input
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder={placeholder}
          required
          aria-label={`Custom ${label.toLowerCase()}`}
        />
      )}
    </div>
  );
}

export function resolveMedicineOption(
  selected: string,
  otherText: string
): string | undefined {
  if (!selected) return undefined;
  if (selected === MEDICINE_OPTION_OTHER) {
    const t = otherText.trim();
    return t || undefined;
  }
  return selected;
}
