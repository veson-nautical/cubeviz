import React, { useCallback } from 'react';

export type StateAndSetter<T> = [T, React.Dispatch<React.SetStateAction<T>>];

export function useSetObjectValue<T>(
  setObject: React.Dispatch<React.SetStateAction<T>>
) {
  return useCallback(
    (key: keyof T, value: any) => {
      setObject((prev) => ({ ...prev, [key]: value }));
    },
    [setObject]
  );
}

export function isSetStateFunction<T>(
  value: T | ((prev: T) => void)
): value is (prev: T) => void {
  return typeof value === 'function';
}

export function useObjectValue<T, K extends keyof T>(
  key: K,
  obj: T | undefined,
  setObject: React.Dispatch<React.SetStateAction<T>>
) {
  const setValue = useCallback(
    (value: React.SetStateAction<T[K] | undefined>) => {
      setObject((prevObj) => ({
        ...prevObj,
        [key]: isSetStateFunction(value)
          ? value(prevObj ? prevObj[key] : undefined)
          : value,
      }));
    },
    [key, setObject]
  );

  return [obj ? obj[key] : undefined, setValue] as StateAndSetter<T[K]>;
}
