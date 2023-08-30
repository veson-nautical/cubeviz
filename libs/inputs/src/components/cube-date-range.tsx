import { FormGroup, NonIdealState } from '@blueprintjs/core';
import { CubevizComponent, isSetStateFunction, useMeta } from '@cubeviz/core';
import {
  relativeDateToString,
  stringToRelativeDate,
} from '../utils/string-to-relative-date';
import { RelativeDateRange } from '../types/relative-date';
import { RelativeDateRangePicker } from './relative-date-range-picker';
import { RelativeDateOptions } from './relative-date-picker';

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
  setValue: React.Dispatch<React.SetStateAction<string[]>>;
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
  const meta = useMeta();
  const dimensionTitle = cubeBinding
    ? meta.dimensions[cubeBinding].shortTitle
    : '';
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
        value={parseDateRange(value)}
        setValue={(value: React.SetStateAction<RelativeDateRange>) =>
          setValue((oldVal) => {
            const newVal = isSetStateFunction(value)
              ? value(parseDateRange(oldVal))
              : value;
            return [
              relativeDateToString(newVal.start),
              relativeDateToString(newVal.end),
            ];
          })
        }
        options={{ allowFuture: false, nonEditable: disabled, ...options }}
      />
    </FormGroup>
  );
};
