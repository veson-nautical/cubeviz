import { FormGroup, NonIdealState } from '@blueprintjs/core';
import {
  CubevizComponent,
  isSetStateFunction,
  useDimensionTitle,
} from '@cubeviz/core';
import {
  relativeDateToString,
  stringToRelativeDate,
} from '../utils/string-to-relative-date';
import { RelativeDateRange } from '../types/relative-date';
import { RelativeDateRangePicker } from './relative-date-range-picker';
import { RelativeDateOptions } from './relative-date-picker';
import { useMemo } from 'react';

function parseDateRange(value: string[] | undefined): RelativeDateRange {
  if (!value)
    return {
      start: stringToRelativeDate('1 year ago'),
      end: stringToRelativeDate('today'),
    };
  return {
    start: stringToRelativeDate(value[0]),
    end: stringToRelativeDate(value[1]),
  };
}

export interface CubeDateRangeProps {
  cubeBinding: string;
  value: string[];
  setValue: (value: string[]) => void;
  options?: RelativeDateOptions;
  disabled?: boolean;
}

export const CubeDateRange: CubevizComponent<CubeDateRangeProps> = ({
  cubeBinding,
  disabled,
  value,
  options,
  setValue,
}) => {
  const dimensionTitle = useDimensionTitle(cubeBinding);
  const parsedValue = useMemo(() => parseDateRange(value), [value]);
  const binding = cubeBinding ?? '';
  if (!binding) {
    return (
      <div style={{ height: '2rem' }}>
        <NonIdealState title="Select a dimension" />
      </div>
    );
  }

  return (
    <FormGroup label={dimensionTitle} inline>
      <RelativeDateRangePicker
        value={parsedValue}
        setValue={(value: React.SetStateAction<RelativeDateRange>) => {
          const newVal = isSetStateFunction(value) ? value(parsedValue) : value;
          setValue([
            relativeDateToString(newVal.start),
            relativeDateToString(newVal.end),
          ]);
        }}
        options={{ allowFuture: false, nonEditable: disabled, ...options }}
      />
    </FormGroup>
  );
};
