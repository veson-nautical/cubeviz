import { Query } from '@cubejs-client/core';
import {
  filterNulls,
  useDashboardCubeQuery,
  useMeta,
  usePrepareDimensionCubeQuery,
} from '@cubeviz/core';
import { useMemo } from 'react';
import { BlueprintSelectItem } from 'src/types/blueprint-select-item';

export function useSelectItemsQuery(
  valueBinding: string,
  labelBinding?: string,
  baseQuery?: Query
) {
  const meta = useMeta();
  const labelMeasure = useMemo(() => {
    const resolved = meta.resolveMember(labelBinding ?? '', 'measures');
    return 'error' in resolved ? undefined : resolved;
  }, [meta, labelBinding]);
  const labelMeasureName = labelMeasure?.name;
  const bindings = useMemo(
    () => filterNulls([valueBinding, labelMeasureName]),
    [valueBinding, labelMeasureName]
  );
  const query = usePrepareDimensionCubeQuery(bindings, undefined, baseQuery);
  const { lastResults, error, isLoading } = useDashboardCubeQuery(query);

  const items = useMemo(() => {
    if (lastResults) {
      return lastResults.rawData().map((row) => {
        const labelBinding = labelMeasure
          ? parseInt(row[labelMeasure.name]).toLocaleString(undefined, {
              minimumFractionDigits: 0,
            }) + ` ${labelMeasure.shortTitle}`
          : undefined;
        return {
          label: labelBinding,
          value: row[valueBinding],
          text: row[valueBinding],
          row,
        } as BlueprintSelectItem;
      });
    }
    return [];
  }, [lastResults, valueBinding, labelMeasure]);

  return { items, error, isLoading };
}
