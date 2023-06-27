import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

export function useDebouncedQuerySideEffect(args?: {
  onQueryChanged?: (value: string) => void;
  queryChangeDelay?: number;
  queryChangeMinChars?: number;
}) {
  const [inputValue, setInputValue] = useState('');
  const [debouncedValue] = useDebounce(
    inputValue,
    args?.queryChangeDelay ?? 300
  );
  useEffect(() => {
    if (args?.onQueryChanged) {
      if (args.queryChangeMinChars) {
        args.onQueryChanged(
          debouncedValue.length >= args.queryChangeMinChars
            ? debouncedValue
            : ''
        );
      } else {
        args.onQueryChanged(debouncedValue);
      }
    }
  }, [args, debouncedValue]);
  return {
    inputValue,
    setInputValue,
    notEnoughChars:
      args?.queryChangeMinChars &&
      debouncedValue.length < args.queryChangeMinChars,
    isRunning: args?.onQueryChanged && debouncedValue !== inputValue,
  };
}
