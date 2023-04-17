import numeral from 'numeral';

function thousandsMagnitude(value: number) {
  return Math.floor(Math.log10(Math.abs(value)) / 3);
}

export function autoFormatNumber(value: number) {
  const numValue = numeral(value);
  const absVal = Math.abs(value);
  if (absVal > 10000) {
    const magnitude = thousandsMagnitude(value);
    if (absVal / 1000 ** magnitude >= 100) {
      return numValue.format('0a');
    } else {
      return numValue.format('0.0a');
    }
  } else if (absVal > 100) {
    return numValue.format('0,0');
  } else if (absVal > 1) {
    return numValue.format('0.0');
  } else if (absVal > 0) {
    return numValue.format('0.00');
  } else {
    return '0';
  }
}
