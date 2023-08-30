import { useMeta } from '../context/context';

export function useDimensionTitle(dimension: string) {
  const meta = useMeta();
  const dimensionMember = dimension
    ? meta.resolveMember(dimension, 'dimensions')
    : undefined;
  const dimensionTitle =
    !dimensionMember || 'error' in dimensionMember
      ? ''
      : dimensionMember.shortTitle.trim();
  return dimensionTitle;
}
