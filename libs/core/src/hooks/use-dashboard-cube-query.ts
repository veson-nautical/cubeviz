import { Query } from '@cubejs-client/core';
import { useCachingCubeQuery } from './use-caching-cube-query';
import { useLastValue } from './use-last-value';

export function useDashboardCubeQuery(query: Query) {
  const results = useCachingCubeQuery(query);
  const lastResults = useLastValue(results.resultSet);
  // not needed unless you really care about caching in every possible scenario
  // proper handling of list key attributes should mostly be good enough
  // const lastResults = useGlobalLastValue(results.resultSet, key);
  return { ...results, lastResults };
}
