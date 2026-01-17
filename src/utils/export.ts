type CsvRow = Record<string, string | number | boolean | null | undefined>;
type XlsxRow = Record<string, string | number | boolean | null | undefined>;

const escapeCsvValue = (value: string | number | boolean | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const exportToCsv = (fileName: string, rows: CsvRow[]): void => {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escapeCsvValue(row[h])).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportToXlsx = async (fileName: string, rows: XlsxRow[]): Promise<void> => {
  if (!rows || rows.length === 0) return;
  const { utils, writeFile } = await import('xlsx');
  const worksheet = utils.json_to_sheet(rows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const safeName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  writeFile(workbook, safeName);
};
