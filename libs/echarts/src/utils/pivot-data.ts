import { Table } from 'typed-data-table';

/**
 * Pivots the pivotKey field into its own column per unique pivotKey value with values from the valueKey field
 * @param table
 * @param pivotKey
 * @param valueKey
 * @returns
 */
export function pivotData<T extends Record<string, any>>(
  table: Table<T>,
  pivotKey: keyof T,
  valueKey: keyof T | (keyof T)[],
  groupingKeys?: (keyof T)[]
): [Table<any>, string[]] {
  let result = new Table([] as any[]);
  const valueKeys = Array.isArray(valueKey) ? valueKey : [valueKey];
  const pivotValues = new Set<string>();
  if (table.size() === 0) return [result, Array.from(pivotValues)];

  const useGroupingKeys =
    groupingKeys ??
    Object.keys(table.first()).filter(
      (k) => k !== pivotKey && !valueKeys.includes(k)
    );
  const grouping = table.groupBy((r) =>
    useGroupingKeys.map((k) => r[k]).join('::')
  );

  for (const groupedRows of Array.from(grouping.data.values())) {
    if (groupedRows.length > 0) {
      const newRow: any = {};
      for (const groupKey of useGroupingKeys) {
        newRow[groupKey] = groupedRows[0][groupKey];
      }
      for (const row of groupedRows) {
        for (const valueKey of valueKeys) {
          const key = `${row[pivotKey]},${valueKey.toString()}`;
          newRow[key] = row[valueKey];
        }
        pivotValues.add(row[pivotKey]);
      }
      result.appendInPlace(newRow);
    }
  }

  // fill missing values with 0
  result = result.transform((row) => {
    for (const pivotValue of Array.from(pivotValues)) {
      for (const valueKey of valueKeys) {
        const key = `${pivotValue},${valueKey.toString()}`;
        if (row[key] === undefined) {
          row[key] = 0;
        }
      }
    }
    return row;
  });

  return [result, Array.from(pivotValues.values())];
}
