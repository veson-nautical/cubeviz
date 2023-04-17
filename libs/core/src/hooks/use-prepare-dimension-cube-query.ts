import { Query, TimeDimensionGranularity } from '@cubejs-client/core';
import { useMemo } from 'react';
import { useMeta } from '../context/context';

export function usePrepareDimensionCubeQuery(
  dimensionsMetrics: (string | undefined)[],
  timeDimensionGranularity: TimeDimensionGranularity = 'day',
  baseQuery?: Query
) {
  const meta = useMeta();
  return useMemo<Query>(() => {
    const timeDimensions: string[] = [];
    const dimensions: string[] = [];
    const measures: string[] = [];
    for (const dim of dimensionsMetrics ?? []) {
      if (!dim) continue;
      if (dim in meta.dimensions) {
        if (meta.dimensions[dim].type == 'time') {
          timeDimensions.push(dim);
        } else {
          dimensions.push(dim);
        }
      } else {
        measures.push(dim);
      }
    }
    const result: Query = {
      ...baseQuery,
    };
    if (dimensions.length > 0) {
      result.dimensions = [...(result.dimensions ?? []), ...dimensions];
    }
    if (measures.length > 0) {
      result.measures = [...(result.measures ?? []), ...measures];
      if (timeDimensions.length === 0) {
        result.order = { [result.measures[0]]: 'desc' };
      }
    }
    if (timeDimensions.length > 0) {
      result.timeDimensions = [
        ...(result.timeDimensions ?? []),
        ...timeDimensions.map((d) => ({
          dimension: d,
          granularity: timeDimensionGranularity,
        })),
      ];
      result.order = { [result.timeDimensions[0].dimension]: 'asc' };
    }
    return result;
  }, [timeDimensionGranularity, dimensionsMetrics, meta, baseQuery]);
}
