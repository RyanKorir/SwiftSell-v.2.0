import Papa from 'papaparse';

/**
 * Triggers a browser download of `rows` as a CSV file. `rows` should
 * already be plain objects with the exact column names you want as headers.
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface CSVParseResult {
  rows: Record<string, string>[];
  errors: string[];
}

/**
 * Parses an uploaded CSV File into an array of plain objects keyed by
 * header name. Header matching is case-insensitive and trims whitespace.
 */
export function parseCSVFile(file: File): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        resolve({
          rows: results.data as Record<string, string>[],
          errors: results.errors.map((e) => `Row ${e.row}: ${e.message}`)
        });
      },
      error: (err) => reject(err)
    });
  });
}
