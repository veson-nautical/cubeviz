import {
  Button,
  ControlGroup,
  NumericInput,
  Tab,
  Tabs,
} from '@blueprintjs/core';
import { DatePicker } from '@blueprintjs/datetime';
import { Popover2 } from '@blueprintjs/popover2';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RelativeDate } from '../types/relative-date';
import { capitalize } from '../utils/capitalize';
import {
  relativeDateToString,
  stringToRelativeDate,
} from '../utils/string-to-relative-date';
import { SimpleSelect } from './simple-select';

const defaultRelativeDate: RelativeDate = {
  type: 'relative',
  number: 0,
  unit: 'day',
  direction: 'last',
};

const defaultDateDisplayFormat = 'DD';

export interface RelativeDateOptions {
  allowFuture?: boolean;
  dateDisplayFormat?: string;
  nonEditable?: boolean;
}

export interface RelativeDatePickerProps {
  value?: RelativeDate | string;
  setValue: React.Dispatch<React.SetStateAction<RelativeDate | undefined>>;
  options?: RelativeDateOptions;
}

export const RelativeDatePicker: React.FC<RelativeDatePickerProps> = ({
  value: rawValue,
  setValue: setRawValue,
  options,
}) => {
  const [value, setValue] = useState(rawValue);
  useEffect(() => {
    setValue(rawValue);
  }, [setValue, rawValue]);
  const parsedValue = useMemo(
    () =>
      (typeof value === 'string' ? stringToRelativeDate(value) : value) ??
      defaultRelativeDate,
    [value]
  );
  const setType = useCallback(
    (type: 'today' | 'exact' | 'relative') => {
      if (type === parsedValue.type) return;
      if (type === 'today') {
        setValue({ type });
      } else if (type === 'exact') {
        setValue({ type, date: new Date() });
      } else if (type === 'relative') {
        setValue({
          type,
          number: 30,
          unit: 'day',
          direction: 'last',
        });
      }
    },
    [parsedValue, setValue]
  );
  if (options?.nonEditable) {
    return (
      <>
        {capitalize(
          relativeDateToString(
            parsedValue,
            options?.dateDisplayFormat ?? defaultDateDisplayFormat
          )
        )}
      </>
    );
  }
  return (
    <Popover2
      placement="bottom"
      onClose={() => {
        setRawValue(parsedValue);
      }}
      content={
        <div style={{ padding: '0.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Tabs selectedTabId={parsedValue.type} onChange={setType}>
              <Tab id="today" title="Today" />
              <Tab id="relative" title="Relative" />
              <Tab id="exact" title="Exact" />
            </Tabs>
          </div>
          <div style={{ width: '15rem' }}>
            {parsedValue.type === 'exact' && (
              <DatePicker
                highlightCurrentDay
                value={parsedValue?.date}
                onChange={(dt) => {
                  setValue({ type: 'exact', date: dt ?? new Date() });
                }}
              />
            )}
            {parsedValue.type === 'relative' && (
              <ControlGroup>
                <NumericInput
                  style={{ width: '4rem' }}
                  value={parsedValue.number}
                  onValueChange={(number) =>
                    setValue({ ...parsedValue, number })
                  }
                />
                <SimpleSelect
                  value={parsedValue.unit}
                  setValue={(unit) =>
                    setValue({
                      ...parsedValue,
                      number:
                        unit === 'day'
                          ? 30
                          : unit === 'week'
                          ? 4
                          : unit === 'month'
                          ? 3
                          : unit === 'year'
                          ? 1
                          : 1,
                      unit: unit as 'day' | 'week' | 'month' | 'year',
                    })
                  }
                  items={['day', 'week', 'month', 'year'].map((unit, i) => ({
                    text:
                      capitalize(unit) + (parsedValue.number != 1 ? 's' : ''),
                    value: unit,
                  }))}
                />
                <SimpleSelect
                  disabled={!options?.allowFuture}
                  value={parsedValue.direction}
                  setValue={(direction) =>
                    setValue({
                      ...parsedValue,
                      direction: direction as 'last' | 'next',
                    })
                  }
                  items={[
                    { text: 'Ago', value: 'last' },
                    { text: 'From now', value: 'next' },
                  ]}
                />
              </ControlGroup>
            )}
          </div>
        </div>
      }
      renderTarget={({ isOpen, ref, ...targetProps }) => (
        <Button
          {...targetProps}
          elementRef={ref as any}
          minimal
          rightIcon="caret-down"
        >
          {capitalize(
            relativeDateToString(
              parsedValue,
              options?.dateDisplayFormat ?? defaultDateDisplayFormat
            )
          )}
        </Button>
      )}
    />
  );
};
