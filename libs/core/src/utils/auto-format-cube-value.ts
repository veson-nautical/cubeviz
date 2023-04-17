import { CubeMeta } from '../cube-meta';
import { getCubeColumn } from './get-cube-column';
import { DateTime } from 'luxon';
import { autoFormatNumber } from './auto-format-number';

function formatDate(value: string) {
  return DateTime.fromISO(value).toFormat('D');
}

export function cubeAutoFormatter(
  meta: CubeMeta,
  field: string,
  formatDates?: boolean
): ((val: any) => any) | undefined {
  const column = getCubeColumn(meta, field);
  if (!column) return undefined;
  if (column.type === 'time') return formatDates ? formatDate : undefined;
  else if (column.type === 'number') return autoFormatNumber;
  else return undefined;
}
