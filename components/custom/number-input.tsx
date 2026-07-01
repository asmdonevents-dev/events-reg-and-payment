"use client";

import { Input } from "@/components/ui/input";

interface NumberInputProps extends Omit<React.ComponentProps<typeof Input>, "type" | "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
}

export default function NumberInput({ value, onChange, ...props }: NumberInputProps) {
  return (
    <Input
      {...props}
      type="number"
      value={Number.isNaN(value) ? "" : value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  );
}
