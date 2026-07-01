export function toDateTimeLocalValue(value?: string) {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return date;
}

export function fromDateTimeLocalValue(date?: Date) {
  if (!date) return "";

  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
