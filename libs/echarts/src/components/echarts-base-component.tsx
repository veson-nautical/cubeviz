import { ResizeSensor } from '@blueprintjs/core';
import { EChartsOption } from 'echarts';
import ReactECharts, { EChartsInstance } from 'echarts-for-react';
import { useMemo, useRef } from 'react';

export interface EChartsBaseComponentProps {
  option?: EChartsOption;
  theme?: 'light' | 'dark';
  isLoading?: boolean;
  onClick?: (params: any) => void;
}

export const LOADING_OPTIONS = {
  text: '',
  color: '#2196f3',
  textColor: '#000',
  maskColor: 'rgba(255, 255, 255, 0)',
  zlevel: 0,
};

export const EChartsBaseComponent: React.FC<EChartsBaseComponentProps> = ({
  option,
  theme,
  onClick,
  isLoading,
}) => {
  const chartRef = useRef<EChartsInstance>(null);
  const onEvents = useMemo(
    () => ({
      click: (clickParams: any) => {
        onClick && onClick(clickParams);
      },
    }),
    [onClick]
  );
  return (
    <ResizeSensor
      observeParents
      onResize={() => {
        chartRef.current && chartRef.current.resize();
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: isLoading ? 0.5 : 1,
        }}
      >
        <ReactECharts
          option={option}
          onChartReady={(chart) => {
            chartRef.current = chart;
          }}
          lazyUpdate
          notMerge
          style={{
            width: '100%',
            flex: '1 1 auto',
          }}
          opts={{
            renderer: 'svg',
            width: 'auto',
            height: 'auto',
          }}
          theme={theme ?? 'light'}
          onEvents={onEvents}
          showLoading={isLoading}
          loadingOption={LOADING_OPTIONS}
        />
      </div>
    </ResizeSensor>
  );
};
