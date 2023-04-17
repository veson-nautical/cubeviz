import { TCubeMemberType } from '@cubejs-client/core';

/**
 * Converts a cubejs type to an echarts axis type
 */
export function axisType(
  columnType?: TCubeMemberType
): 'time' | 'category' | 'value' {
  if (columnType === 'time') {
    return 'time';
  } else if (columnType === 'number') {
    return 'value';
  } else {
    return 'category';
  }
}
