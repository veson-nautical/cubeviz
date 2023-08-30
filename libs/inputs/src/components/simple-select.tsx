import { Button, Menu, MenuItem, MenuItemProps } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

export interface SimpleSelectProps {
  items: ({ value: string } & MenuItemProps)[];
  value: string;
  setValue: React.Dispatch<string>;
  disabled?: boolean;
}

// a basic select component that works correctly inside a popover
export const SimpleSelect: React.FC<SimpleSelectProps> = ({
  items,
  value,
  setValue,
  disabled,
}) => {
  return (
    <Popover2
      disabled={disabled}
      content={
        <Menu>
          {items.map(({ value, ...menuItemProps }, i) => (
            <MenuItem
              key={i}
              {...menuItemProps}
              onClick={() => {
                setValue(value);
              }}
            />
          ))}
        </Menu>
      }
      captureDismiss={true}
      renderTarget={({ isOpen, ref, ...targetProps }) => (
        <Button
          {...targetProps}
          elementRef={ref as any}
          minimal
          rightIcon={disabled ? undefined : 'caret-down'}
        >
          {items.find((it) => it.value === value)?.text ?? 'Select...'}
        </Button>
      )}
    />
  );
};
