import { Button, MenuItem, Spinner } from '@blueprintjs/core';
import { Select2Props, Suggest2 } from '@blueprintjs/select';
import { CubevizComponent, useMeta } from '@cubeviz/core';
import { useMemo } from 'react';
import { useDebouncedQuerySideEffect } from '../hooks/use-debounced-query-side-effect';
import { useSelectItemsQuery } from '../hooks/use-select-items-query';
import { BlueprintSelectItem } from '../types/blueprint-select-item';
import { BaseInputItem } from './base-input-item';
import { CubeInputFormGroup } from './cube-input-form-group';

export interface CubeSuggestParams {
  labelBinding: string;
  valueBinding?: string;
  title?: string;
  suggestProps?: Partial<Select2Props<BlueprintSelectItem>>;
  selectedItem?: string;
  setSelectedItem: (value: string | undefined) => void;
}

export const CubeSuggest: CubevizComponent<CubeSuggestParams> = ({
  labelBinding,
  valueBinding,
  selectedItem,
  setSelectedItem,
  baseQuery,
  suggestProps,
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
      <Suggest2<BlueprintSelectItem>
        query={inputValue}
        onQueryChange={(query) => setInputValue(query)}
        items={items}
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
        inputValueRenderer={(item) => item.text}
        selectedItem={selectedBPItem ?? null}
        {...suggestProps}
        inputProps={{
          autoComplete: 'off',
          rightElement:
            isLoading || loadingMoreResults ? (
              <Spinner size={18} />
            ) : selectedItem ? (
              <Button
                minimal
                icon="cross"
                onClick={() => {
                  setInputValue('');
                  setSelectedItem(undefined);
                }}
              />
            ) : undefined,
          ...suggestProps?.inputProps,
        }}
      />
    </CubeInputFormGroup>
  );
};
