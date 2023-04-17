import { Query } from '@cubejs-client/core';
import { useCubeQuery, UseCubeQueryResult } from '@cubejs-client/react';
import { useContext, useEffect, useMemo } from 'react';
import { useDeepMemo } from './use-deep-memo';
import { LastValueContext } from './use-last-value';

export function useCachingCubeQuery(query: Query): UseCubeQueryResult<any> {
  const deepQuery = useDeepMemo(() => query, [query]);
  const key = useMemo(() => JSON.stringify(deepQuery), [deepQuery]);
  const { cache, updateCache } = useContext(LastValueContext);
  const cubeOptions = useMemo(
    () => ({
      skip: !!cache[key],
    }),
    [cache, key]
  );
  const results = useCubeQuery(deepQuery, cubeOptions);
  useEffect(() => {
    const resultsKey = JSON.stringify(results.resultSet?.query());
    if (results && results.resultSet && !cache[resultsKey]) {
      updateCache(resultsKey, results);
    }
  }, [results, cache, updateCache]);
  if (cache[key]) {
    return cache[key];
  } else {
    return results;
  }
}
