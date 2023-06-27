import { MenuItem } from '@blueprintjs/core';
import { ItemRendererProps } from '@blueprintjs/select';
import { BlueprintSelectItem } from '../types/blueprint-select-item';
import Highlighter from 'react-highlight-words';

export interface BaseInputItemProps {
  item: BlueprintSelectItem;
  itemProps: ItemRendererProps;
  isSelected?: boolean;
  highlightResults?: boolean;
}

export const BaseInputItem: React.FC<BaseInputItemProps> = ({
  item,
  isSelected,
  itemProps,
  highlightResults,
}) => {
  return (
    <MenuItem
      data-testid={
        item.label
          ? `menu-item-${item.text}-${item.label}`
          : `menu-item-${item.text}`
      }
      active={isSelected}
      disabled={!!item.disabled}
      label={item.label}
      onClick={itemProps.handleClick}
      onFocus={itemProps.handleFocus}
      shouldDismissPopover={false}
      text={
        highlightResults && itemProps.query ? (
          <Highlighter
            highlightClassName="search-highlight"
            searchWords={[itemProps.query]}
            caseSensitive={false}
            autoEscape={true}
            textToHighlight={item.text}
          />
        ) : (
          item.text
        )
      }
      icon={item.icon}
      title={item.tooltip}
    />
  );
};
