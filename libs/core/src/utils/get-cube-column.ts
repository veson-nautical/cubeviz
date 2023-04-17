import { TCubeDimension, TCubeMeasure } from '@cubejs-client/core';
import { CubeMeta } from '../cube-meta';

export type CubeColumnType =
  | (TCubeDimension & { metaType: 'dimension' })
  | (TCubeMeasure & { metaType: 'measure' });

export function getCubeColumn(
  meta: CubeMeta,
  name: string
): CubeColumnType | undefined {
  if (name in meta.measures) {
    return { ...meta.measures[name], metaType: 'measure' };
  } else if (name in meta.dimensions) {
    return { ...meta.dimensions[name], metaType: 'dimension' };
  } else {
    return undefined;
  }
}
