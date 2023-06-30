import { Button, ButtonProps, MenuItem, Spinner } from '@blueprintjs/core';
import { Select2, Select2Props } from '@blueprintjs/select';
import { CubevizComponent, useMeta } from '@cubeviz/core';
import { useMemo } from 'react';
import { useDebouncedQuerySideEffect } from '../hooks/use-debounced-query-side-effect';
import { useSelectItemsQuery } from '../hooks/use-select-items-query';
import { BlueprintSelectItem } from '../types/blueprint-select-item';
import { BaseInputItem } from './base-input-item';
import { CubeInputFormGroup } from './cube-input-form-group';

export interface CubeSelectParams {
  labelBinding: string;
  valueBinding?: string;
  title?: string;
  selectProps?: Partial<Select2Props<BlueprintSelectItem>>;
  buttonProps?: Partial<ButtonProps>;
  selectedItem?: string;
  setSelectedItem: (value: string | undefined) => void;
}

export const CubeSelect: CubevizComponent<CubeSelectParams> = ({
  labelBinding,
  valueBinding,
  selectedItem,
  setSelectedItem,
  baseQuery,
  selectProps,
  buttonProps,
  title,
}) => {
  const meta = useMeta();
  const { items, error, isLoading } = useSelectItemsQuery(
    labelBinding,
    valueBinding,
    baseQuery
  );

  const {
    inputValue,
    setInputValue,
    notEnoughChars,
    isRunning: loadingMoreResults,
  } = useDebouncedQuerySideEffect();

  const selectedBPItem = useMemo(
    () => items?.find((it) => it.value === selectedItem),
    [items, selectedItem]
  );

  const dimensionTitle =
    title ?? meta.dimensions[labelBinding].shortTitle.trim();

  return (
    <CubeInputFormGroup title={dimensionTitle} errorMessage={error?.message}>
      <Select2<BlueprintSelectItem>
        fill
        className="minimal"
        items={items}
        query={inputValue}
        noResults={
          <MenuItem
            disabled={true}
            text={
              isLoading || loadingMoreResults
                ? 'Loading results...'
                : !inputValue
                ? 'Type to search'
                : notEnoughChars
                ? `Enter more characters to search`
                : 'No results.'
            }
          />
        }
        itemPredicate={(query, item) => {
          return (
            !query || item.text?.toLowerCase().includes(query.toLowerCase())
          );
        }}
        itemRenderer={(item, itemProps) => (
          <BaseInputItem
            key={itemProps.index}
            item={item}
            itemProps={itemProps}
            highlightResults
            isSelected={itemProps.modifiers.active}
          />
        )}
        onItemSelect={(item) => {
          setSelectedItem(item.value);
          setInputValue('');
        }}
        {...selectProps}
      >
        <Button
          fill
          minimal
          alignText="left"
          icon={selectedBPItem ? selectedBPItem.icon : undefined}
          text={
            selectedBPItem
              ? selectedBPItem.text
              : dimensionTitle ?? 'Select a value'
          }
          rightIcon={isLoading ? <Spinner size={18} /> : 'caret-down'}
          {...buttonProps}
        />
      </Select2>
    </CubeInputFormGroup>
  );
};
