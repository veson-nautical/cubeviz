import { Query } from '@cubejs-client/core';
import React from 'react';

export interface CubevizComponentBaseParams {
  baseQuery?: Query;
  theme?: 'light' | 'dark';
}
export type CubevizComponentParams<T> = T & CubevizComponentBaseParams;

export type CubevizComponent<T> = React.FC<CubevizComponentParams<T>>;
