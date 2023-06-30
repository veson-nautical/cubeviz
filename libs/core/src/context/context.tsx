import { CubejsApi } from '@cubejs-client/core';
import { CubeProvider, useCubeMeta } from '@cubejs-client/react';
import React, { useMemo } from 'react';
import { CubeMeta } from '../cube-meta';
import { LastValueContextProvider } from '../hooks/use-last-value';

export interface CubeConfigContextType {
  cubes: string[];
  meta: Record<string, CubeMeta>;
  theme: 'light' | 'dark';
}

export const CubeConfigContext = React.createContext<CubeConfigContextType>({
  cubes: [],
  meta: {},
  theme: 'light',
});
export const useCubeConfig = () => React.useContext(CubeConfigContext);

export function useCubeTheme() {
  const { theme } = useCubeConfig();
  return theme;
}

export const useMeta = () => {
  const { meta } = useCubeConfig();
  // combine the individual cube meta into a single object
  const combinedMeta = useMemo(() => {
    const result: CubeMeta = {
      measures: {} as any,
      dimensions: {} as any,
      segments: {} as any,
    };
    for (const cube of Object.values(meta)) {
      result.measures = { ...result.measures, ...cube.measures };
      result.dimensions = { ...result.dimensions, ...cube.dimensions };
      result.segments = { ...result.segments, ...cube.segments };
    }
    return result;
  }, [meta]);
  return combinedMeta;
};

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
    () => response?.cubesMap as any as Record<string, CubeMeta>,
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
