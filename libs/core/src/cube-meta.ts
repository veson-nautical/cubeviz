import {
  TCubeDimension,
  TCubeMeasure,
  TCubeSegment,
} from '@cubejs-client/core';

export type CubeMeta = {
  measures: Record<string, TCubeMeasure>;
  dimensions: Record<string, TCubeDimension>;
  segments: Record<string, TCubeSegment>;
};
