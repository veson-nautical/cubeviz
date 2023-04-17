import { Table } from 'typed-data-table';

export function sortChartAxis<T extends Record<string, any>>(
  table: Table<T>,
  sortAxisCol: string,
  valueCols: string[]
): Table<T> {
  return table
    .withColumn('total', (row) => {
      let total = 0;
      for (const col of valueCols) {
        total += row[col] ?? 0;
      }
      return total;
    })
    .withColumn('isNotOther', (row) => (row[sortAxisCol] === 'Other' ? 0 : 1))
    .sortValues(['isNotOther', 'total'], false);
}
