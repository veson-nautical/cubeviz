import cubejs from '@cubejs-client/core';
import { useMemo } from 'react';

const CUBEJS_API_URL = `${process.env.NEXT_PUBLIC_CUBE_URL}/cubejs-api/v1`;

export function useCubeApi() {
  return useMemo(() => {
    return cubejs('', {
      apiUrl: CUBEJS_API_URL,
    });
  }, []);
}
