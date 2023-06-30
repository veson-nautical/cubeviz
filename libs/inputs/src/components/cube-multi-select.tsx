import {
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  Spinner,
} from '@blueprintjs/core';
import {
  ItemListRenderer,
  MultiSelect2,
  MultiSelect2Props,
} from '@blueprintjs/select';
import { CubevizComponent, useListHelpers, useMeta } from '@cubeviz/core';
import { useCallback, useMemo } from 'react';
import { useDebouncedQuerySideEffect } from '../hooks/use-debounced-query-side-effect';
import { useSelectItemsQuery } from '../hooks/use-select-items-query';
import { BlueprintSelectItem } from '../types/blueprint-select-item';
import { BaseInputItem } from './base-input-item';
import { CubeInputFormGroup } from './cube-input-form-group';

export interface CubeMultiSelectParams {
  labelBinding: string;
  valueBinding?: string;
  title?: string;
  multiSelectProps?: Partial<MultiSelect2Props<BlueprintSelectItem>>;
  selectedItems?: string[];
  setSelectedItems: (selectedItems: string[]) => void;
}

export const CubeMultiSelect: CubevizComponent<CubeMultiSelectParams> = ({
  labelBinding,
  valueBinding,
  selectedItems,
  setSelectedItems,
  baseQuery,
  multiSelectProps,
  title,
}) => {
  const meta = useMeta();
  const { items, error, isLoading } = useSelectItemsQuery(
    labelBinding,
    valueBinding,
    baseQuery
  );

  const renderMenu: ItemListRenderer<BlueprintSelectItem> = useCallback(
    ({
      items,
      itemsParentRef,
      query,
      renderItem,
      filteredItems,
      menuProps,
    }) => {
      const renderedItems = filteredItems
        .map(renderItem)
        .filter((item) => item != null);
      if (renderedItems.length === 0) {
        return (
          <Menu
            role="listbox"
            ulRef={itemsParentRef ?? undefined}
            {...menuProps}
          >
            <MenuItem
              disabled={true}
              text={isLoading ? 'Loading results...' : 'No results'}
            />
          </Menu>
        );
      }
      return (
        <>
          <ButtonGroup fill>
            <Button
              text="Select All"
              intent="primary"
              onClick={() => setSelectedItems(items.map((i) => i.value))}
            />
            <Button text="Select None" onClick={() => setSelectedItems([])} />
          </ButtonGroup>
          <Menu
            role="listbox"
            ulRef={itemsParentRef ?? undefined}
            {...menuProps}
          >
            {renderedItems}
          </Menu>
        </>
      );
    },
    [setSelectedItems, isLoading]
  );

  const availableSelectedItems = useMemo(
    () =>
      selectedItems
        ?.map((v) => items.find((i) => i.value === v)!)
        .filter((i) => !!i) ?? [],
    [items, selectedItems]
  );

  const { removeByIndex, toggleValue } = useListHelpers(
    availableSelectedItems.map((it) => it.value),
    setSelectedItems
  );

  const {
    inputValue,
    setInputValue,
    notEnoughChars,
    isRunning: loadingMoreResults,
  } = useDebouncedQuerySideEffect();

  const dimensionTitle =
    title ?? meta.dimensions[labelBinding].shortTitle.trim();

  return (
    <CubeInputFormGroup title={dimensionTitle} errorMessage={error?.message}>
      <MultiSelect2<BlueprintSelectItem>
        fill
        className="minimal"
        tagInputProps={{
          fill: true,
          rightElement: isLoading ? (
            <div style={{ padding: '0.25rem' }}>{<Spinner size={16} />}</div>
          ) : availableSelectedItems.length > 1 ? (
            <Button icon="cross" minimal onClick={() => setSelectedItems([])} />
          ) : undefined,
          onRemove: (_, i) => {
            removeByIndex(i);
          },
          ...multiSelectProps?.tagInputProps,
          inputProps: {
            value: inputValue,
            autoComplete: 'off',
            placeholder: '+ Add',
            onChange: (ev) => setInputValue((ev.target as any).value),
            ...multiSelectProps?.tagInputProps?.inputProps,
          },
          tagProps: {
            minimal: true,
            ...multiSelectProps?.tagInputProps?.tagProps,
          },
        }}
        placeholder={dimensionTitle}
        itemListRenderer={renderMenu}
        items={items}
        selectedItems={availableSelectedItems}
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
        itemRenderer={(item, itemProps) => {
          const isSelected = (
            availableSelectedItems.map((i) => i.value) ?? []
          ).includes(item.value);
          return (
            <BaseInputItem
              key={itemProps.index}
              item={{
                ...item,
                icon: item.icon ?? (isSelected ? 'tick' : 'blank'),
              }}
              itemProps={itemProps}
              highlightResults
              isSelected={itemProps.modifiers.active}
            />
          );
        }}
        tagRenderer={(s) => s.text}
        onItemSelect={(item) => {
          toggleValue(item.value);
          setInputValue('');
        }}
      />
    </CubeInputFormGroup>
  );
};
