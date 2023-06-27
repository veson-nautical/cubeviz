export interface SharedCellParams {
  minValue: number;
  maxValue: number;
  theme?: 'light' | 'dark';
}

export const BarCellRenderer: React.FC<
  SharedCellParams & {
    value: any;
    valueFormatted?: string;
  }
> = (props) => {
  const cellValue = props.valueFormatted ? props.valueFormatted : props.value;
  const pct = ((props.value / props.maxValue) * 100.0).toFixed(0);
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          width: `${pct}%`,
          top: '20%',
          height: '60%',
          position: 'absolute',
          backgroundColor: props.theme === 'dark' ? '#4992ff' : '#8ABBFF',
          opacity: 0.5,
          zIndex: -1,
        }}
      />
      <div style={{ marginLeft: '0.5rem' }}>{cellValue}</div>
    </div>
  );
};
