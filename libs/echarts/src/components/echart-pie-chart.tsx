import { NonIdealState, Spinner } from '@blueprintjs/core';
import { EChartsOption } from 'echarts';
import { useCallback, useMemo } from 'react';
import { Table } from 'typed-data-table';
import { EChartsBaseComponent } from './echarts-base-component';
import { binOtherRows } from '../utils/bin-other-rows';
import { positionTooltip } from '../utils/position-tooltip';
import { sortChartAxis } from '../utils/sort-chart-axis';
import {
  cubeAutoFormatter,
  CubevizComponent,
  getCubeColumn,
  useCubeTheme,
  useDashboardCubeQuery,
  useMeta,
  usePrepareDimensionCubeQuery,
} from '@cubeviz/core';

export interface EChartPieWidgetParams {
  title?: string;
  value: string;
  color: string;
  binOther?: number;
  onDrillDown?: (values: string[]) => void;
}

export const EChartsPieChart: CubevizComponent<EChartPieWidgetParams> = ({
  title,
  value,
  color,
  onDrillDown,
  binOther,
  baseQuery,
}) => {
  const meta = useMeta();
  const theme = useCubeTheme();
  const bindings = useMemo(() => [value, color], [value, color]);
  const query = usePrepareDimensionCubeQuery(bindings, undefined, baseQuery);
  const { lastResults, error, isLoading } = useDashboardCubeQuery(query);

  const { option, otherValues } = useMemo(() => {
    if (!lastResults || !color) return {};

    const valueColDef = getCubeColumn(meta, value);
    const colorColDef = getCubeColumn(meta, color);
    if (!valueColDef || !colorColDef) return {};

    // Other row binning
    let data = new Table(lastResults.rawData());
    let otherValues = [] as string[];
    if (binOther && binOther > 0) {
      const numValues = Array.from(
        data.groupBy((r) => r[color]).data.keys()
      ).length;
      if (numValues > binOther) {
        [data, otherValues] = binOtherRows(data, color, value, binOther);
      }
    }

    // Order categorical axes rationally
    data = sortChartAxis(data, color, [value]);

    return {
      option: {
        title: {
          text: title,
          textStyle: {
            fontWeight: 300,
            fontSize: '1rem',
          },
        },
        backgroundColor: 'transparent',
        dataset: {
          source: data.data,
        },
        tooltip: {
          trigger: 'item',
          appendToBody: true,
          position: positionTooltip,
          valueFormatter: cubeAutoFormatter(meta, valueColDef.name),
        },
        series: {
          type: 'pie',
          name: getCubeColumn(meta, color)?.shortTitle,
          top: 30,
          label: {
            formatter: '{b}: {d}%',
            alignTo: 'edge',
            minMargin: 5,
            edgeDistance: 10,
            lineHeight: 15,
          },
          encode: {
            value,
            itemName: color,
            tooltip: value,
          },
        },
      } as EChartsOption,
      otherValues,
    };
  }, [lastResults, color, value, binOther, title, meta]);

  const onClick = useCallback(
    (clickParams: any) => {
      if (!onDrillDown) return;
      const value = clickParams.name;
      if (value != 'Other') {
        onDrillDown([value]);
      } else if (otherValues) {
        onDrillDown(otherValues);
      }
    },
    [onDrillDown, otherValues]
  );

  if (error) {
    return (
      <NonIdealState
        icon="error"
        title={error.name}
        description={error.message}
      />
    );
  }

  if (!color || !value) {
    return (
      <NonIdealState icon="pie-chart" title="Set color and value bindings" />
    );
  }

  if (!lastResults) {
    return <NonIdealState icon={<Spinner />} />;
  }

  return (
    <EChartsBaseComponent
      option={option}
      theme={theme}
      isLoading={isLoading}
      onClick={onClick}
    />
  );
};
