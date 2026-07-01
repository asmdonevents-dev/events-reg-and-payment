import * as XLSX from "xlsx";

export function formatExportDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function exportToExcel<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
  sheetName = "Sheet1"
) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
