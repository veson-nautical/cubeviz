import {
  CubejsApi,
  Meta,
  Query,
  TCubeDimension,
  TCubeMeasure,
  TCubeSegment,
} from '@cubejs-client/core';
import { CubeProvider, useCubeMeta } from '@cubejs-client/react';
import React, { useMemo } from 'react';
import { CubeMeta } from '../cube-meta';
import { LastValueContextProvider } from '../hooks/use-last-value';

export interface CubeConfigContextType {
  cubes: string[];
  meta: Meta;
  theme: 'light' | 'dark';
}

export const CubeConfigContext = React.createContext<CubeConfigContextType>({
  cubes: [],
  meta: null!,
  theme: 'light',
});
export const useCubeConfig = () => React.useContext(CubeConfigContext);

export function useCubeTheme() {
  const { theme } = useCubeConfig();
  return theme;
}

function reduceByName<T extends { name: string }>(
  data: T[]
): Record<string, T> {
  return data.reduce((obj, e) => {
    obj[e.name] = e;
    return obj;
  }, {} as Record<string, T>);
}

export function useMeta() {
  const { meta } = useCubeConfig();
  return meta;
}

export function useMetaForQuery(query: Query): CubeMeta {
  const meta = useMeta();
  return useMemo<CubeMeta>(
    () => ({
      dimensions: reduceByName(
        meta.membersForQuery(query, 'dimensions')
      ) as Record<string, TCubeDimension>,
      measures: reduceByName(meta.membersForQuery(query, 'measures')) as Record<
        string,
        TCubeMeasure
      >,
      segments: reduceByName(meta.membersForQuery(query, 'segments')) as Record<
        string,
        TCubeSegment
      >,
    }),
    [meta, query]
  );
}

export interface CubeVizContextProviderProps {
  theme?: 'light' | 'dark';
  cubejsApi?: CubejsApi;
  renderError?: (err: Error) => React.ReactNode;
  loadingDisplay?: React.ReactNode;
}

export const CubeVizContextProvider: React.FC<
  React.PropsWithChildren<CubeVizContextProviderProps>
> = ({ cubejsApi, renderError, theme, loadingDisplay, children }) => {
  const { response, isLoading, error } = useCubeMeta({ cubejsApi });
  const cubeMeta = useMemo(
    // the cube type is wrong, so we recast it to the actual type
    () => response,
    [response]
  );
  if (error) {
    return renderError ? (
      <>{renderError(error)}</>
    ) : (
      <>
        Error {error.name}: {error.message}
      </>
    );
  }
  if (!cubejsApi || isLoading || !cubeMeta) {
    return loadingDisplay ? (
      <>{loadingDisplay}</>
    ) : (
      <>Fetching cube metadata...</>
    );
  }
  return (
    <LastValueContextProvider>
      <CubeProvider cubejsApi={cubejsApi}>
        <CubeConfigContext.Provider
          value={{
            meta: cubeMeta,
            cubes: Object.keys(cubeMeta),
            theme: theme ?? 'light',
          }}
        >
          {children}
        </CubeConfigContext.Provider>
      </CubeProvider>
    </LastValueContextProvider>
  );
};
