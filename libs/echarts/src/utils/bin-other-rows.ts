import { Table, sum } from 'typed-data-table';

/**
 * Bins the other rows into a single row with the binKey field set to 'Other'.
 * Binning keeps the top categories based on their sum total over the valueKey.
 * @param table
 * @param binKey
 * @param valueKey
 * @param binAfter  Start binning after this many unique values of binKey
 * @returns
 */
export function binOtherRows<T extends Record<string, any>>(
  table: Table<T>,
  binKey: keyof T,
  valueKey: keyof T,
  binAfter: number
): [Table<T>, string[]] {
  const result = new Table([] as any[]);
  if (table.size() === 0) return [table, []];

  const totals = table
    .groupBy((r) => r[binKey])
    .aggregate((rows) => ({
      total: sum(rows.map((r) => parseFloat(r[valueKey]))),
    }))
    .sortValues(['total'], false);

  const binValues = totals.data.slice(binAfter).map((r) => r.id);

  // we group by all other columns except the binKey and valueKey
  const groupingKeys = Object.keys(table.first()).filter(
    (k) => k !== binKey && k !== valueKey
  );
  const grouping = table.groupBy((r) =>
    groupingKeys.map((k) => r[k]).join('::')
  );
  for (const groupedRows of Array.from(grouping.data.values())) {
    const otherRow: any = {};
    for (const groupKey of groupingKeys) {
      otherRow[groupKey] = groupedRows[0][groupKey];
    }
    otherRow[binKey] = 'Other';
    otherRow[valueKey] = 0;
    for (const row of groupedRows) {
      if (binValues.includes(row[binKey])) {
        otherRow[valueKey] += parseFloat(row[valueKey]);
      } else {
        result.appendInPlace(row);
      }
    }
    if (otherRow[valueKey] > 0) {
      result.appendInPlace(otherRow);
    }
  }
  return [result, binValues];
}
