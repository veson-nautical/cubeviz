import { IconName, MaybeElement } from '@blueprintjs/core';

export interface BlueprintSelectItem {
  label?: string;
  icon?: IconName | MaybeElement;
  text: string;
  value: string;
  disabled?: boolean;
  tooltip?: string;
}
