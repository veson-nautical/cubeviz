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
  labelBinding: string,
  valueBinding?: string,
  baseQuery?: Query
) {
  const meta = useMeta();
  const valueBindingPresent =
    valueBinding && valueBinding in meta.measures ? valueBinding : undefined;
  const bindings = useMemo(
    () => filterNulls([labelBinding, valueBindingPresent]),
    [labelBinding, valueBindingPresent]
  );
  const query = usePrepareDimensionCubeQuery(bindings, undefined, baseQuery);
  const { lastResults, error, isLoading } = useDashboardCubeQuery(query);

  const items = useMemo(() => {
    if (lastResults) {
      return lastResults.rawData().map((row) => {
        const valueBinding = valueBindingPresent
          ? parseInt(row[valueBindingPresent]).toLocaleString(undefined, {
              minimumFractionDigits: 0,
            }) + ` ${meta.measures[valueBindingPresent].shortTitle}`
          : undefined;
        return {
          label: row[labelBinding],
          value: valueBinding,
          text: valueBinding,
          row,
        } as BlueprintSelectItem;
      });
    }
    return [];
  }, [lastResults, labelBinding, valueBindingPresent, meta]);

  return { items, error, isLoading };
}
