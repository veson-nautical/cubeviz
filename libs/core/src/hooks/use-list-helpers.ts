import React, { useCallback } from 'react';

function immutableAdd<T>(lst: T[], item: T) {
  return [...lst, item];
}

function immutableRemove<T>(
  lst: T[],
  item: T,
  matchFunc?: (a: T, b: T) => boolean
) {
  const idx = lst.findIndex((oldItem) =>
    matchFunc ? matchFunc(oldItem, item) : oldItem === item
  );
  return immutableRemoveByIndex(lst, idx);
}

function immutableRemoveByIndex<T>(lst: T[], idx: number) {
  if (idx >= 0) {
    return [...lst.slice(0, idx), ...lst.slice(idx + 1)];
  } else {
    return lst;
  }
}

export function useListHelpers<T>(
  currentState: T[],
  setter: React.Dispatch<T[]>
) {
  const insert = useCallback(
    (item?: T) => {
      if (!item) return;
      setter(immutableAdd(currentState, item));
    },
    [currentState, setter]
  );

  const remove = useCallback(
    (item?: T, matchFunc?: (a: T, b: T) => boolean) => {
      if (!item) return;
      setter(immutableRemove(currentState, item, matchFunc));
    },
    [currentState, setter]
  );

  const removeByIndex = useCallback(
    (index: number) => {
      setter(immutableRemoveByIndex(currentState, index));
    },
    [currentState, setter]
  );

  const toggleValue = useCallback(
    (item?: T, matchFunc?: (a: T, b: T) => boolean) => {
      if (!item) return;
      const maybeRemovedList = immutableRemove(currentState, item, matchFunc);
      // if the remove did something then stop
      if (maybeRemovedList !== currentState) {
        setter(maybeRemovedList);
        return;
      }
      // otherwise add
      setter(immutableAdd(currentState, item));
    },
    [currentState, setter]
  );

  return {
    insert,
    remove,
    removeByIndex,
    toggleValue,
  };
}
