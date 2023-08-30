import { useObjectValue } from '@cubeviz/core';
import { RelativeDateRange } from '../types/relative-date';
import {
  RelativeDateOptions,
  RelativeDatePicker,
} from './relative-date-picker';

export interface RelativeDateRangePickerProps {
  value: RelativeDateRange;
  setValue: React.Dispatch<React.SetStateAction<RelativeDateRange>>;
  options?: RelativeDateOptions;
}

export const RelativeDateRangePicker: React.FC<
  RelativeDateRangePickerProps
> = ({ value, setValue, options }) => {
  const [start, setStart] = useObjectValue('start', value, setValue);
  const [end, setEnd] = useObjectValue('end', value, setValue);
  return (
    <div style={{ padding: options?.nonEditable ? '0.25rem' : '' }}>
      <RelativeDatePicker value={start} setValue={setStart} options={options} />
      <span style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>to</span>
      <RelativeDatePicker value={end} setValue={setEnd} options={options} />
    </div>
  );
};
