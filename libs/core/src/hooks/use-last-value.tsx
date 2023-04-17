import React, { useEffect, useState } from 'react';
import { useSetObjectValue } from './use-set-object-value';

/**
 * This is a hook for remembering the last defined value of a variable, useful
 * when you are fetching data and want to keep the last response around until
 * the new results come in
 * @param value  The target value
 */
export function useLastValue<T>(value: T) {
  const [lastValue, setLastValue] = useState<T | undefined>(value);
  useEffect(() => {
    if (value !== null && value !== undefined) {
      setLastValue(value);
    }
  }, [value, setLastValue]);
  return lastValue;
}

export interface LastValueContextCacheType {
  cache: Record<string, any>;
  updateCache: (key: string, value: any) => void;
}
export const LastValueContext = React.createContext<LastValueContextCacheType>(
  null!
);

export function useGlobalLastValue<T>(
  value: T | undefined,
  key?: string
): T | undefined {
  const [lastValue, setLastValue] = useState<T | undefined>(value);
  const { cache, updateCache } = React.useContext(LastValueContext);
  useEffect(() => {
    if (value !== null && value !== undefined) {
      if (key) {
        updateCache(key, value);
      } else {
        setLastValue(value);
      }
    }
  }, [setLastValue, updateCache, value, key]);
  if (value === null || value === undefined) {
    return key ? cache[key] : lastValue;
  } else {
    return value;
  }
}

export const LastValueContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [cache, setCache] = useState({} as Record<string, any>);
  const setCacheValue = useSetObjectValue(setCache);
  return (
    <LastValueContext.Provider
      value={{
        cache,
        updateCache: setCacheValue,
      }}
    >
      {children}
    </LastValueContext.Provider>
  );
};
