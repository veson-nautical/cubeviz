export function positionTooltip(
  pos: [number, number],
  params: any,
  dom: any,
  rect: any,
  size: any
) {
  var obj: any = { top: pos[1], left: pos[0] };
  // tooltip will be fixed on the right if mouse hovering on the left,
  // and on the left if hovering on the right.
  // obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
  return obj;
}
