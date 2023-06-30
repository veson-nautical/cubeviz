import { NonIdealState, Spinner } from '@blueprintjs/core';
import { TimeDimensionGranularity } from '@cubejs-client/core';
import { EChartsOption, SeriesOption } from 'echarts';
import { useCallback, useMemo } from 'react';
import { filterNulls, Table } from 'typed-data-table';
import { EChartsBaseComponent } from './echarts-base-component';
import { axisType } from '../utils/axis-type';
import { binOtherRows } from '../utils/bin-other-rows';
import { pivotData } from '../utils/pivot-data';
import { positionTooltip } from '../utils/position-tooltip';
import { sortChartAxis } from '../utils/sort-chart-axis';
import {
  autoFormatNumber,
  cubeAutoFormatter,
  CubeMeta,
  CubevizComponent,
  getCubeColumn,
  useCubeTheme,
  useDashboardCubeQuery,
  useMeta,
  usePrepareDimensionCubeQuery,
} from '@cubeviz/core';

export interface EChartWidgetParams {
  title?: string;
  x: string;
  y: string;
  color?: string;
  timeDimensionGranularity?: TimeDimensionGranularity;
  chartType: 'line' | 'bar' | 'scatter' | 'area';
  showLegend?: boolean;
  stack?: boolean;
  binOther?: number;
  onDrillDown?: (values: string[]) => void;
}

export function isDrillable(param: string, meta: CubeMeta) {
  if (param in meta.dimensions) {
    return meta.dimensions[param].type === 'string';
  }
  return false;
}

export const EChartsXYChart: CubevizComponent<EChartWidgetParams> = ({
  chartType,
  onDrillDown,
  x,
  y,
  baseQuery,
  binOther,
  color,
  showLegend,
  stack,
  timeDimensionGranularity,
  title,
}) => {
  const meta = useMeta();
  const theme = useCubeTheme();
  const bindings = useMemo(() => filterNulls([x, y, color]), [x, y, color]);
  const query = usePrepareDimensionCubeQuery(
    bindings,
    timeDimensionGranularity,
    baseQuery
  );
  const { lastResults, error, isLoading } = useDashboardCubeQuery(query);

  const { option, otherValues } = useMemo(() => {
    if (!lastResults) return {};

    const xColDef = getCubeColumn(meta, x);
    const yColDef = getCubeColumn(meta, y);
    if (!xColDef || !yColDef) return {};

    const xMeasure = x in meta.measures;
    const yMeasure = y in meta.measures;
    const dualMeasure = xMeasure && yMeasure;

    // Other row binning
    let data = new Table(lastResults.rawData());
    let firstOtherValues: string[] | undefined = undefined;
    if (!dualMeasure && binOther && binOther > 0) {
      const measure = xMeasure ? x : y;
      const binAcross = [
        ...(!xMeasure && xColDef.type === 'string' ? [x] : []),
        ...(!yMeasure && yColDef.type === 'string' ? [y] : []),
        ...(color ? [color] : []),
      ];
      for (const col of binAcross) {
        const numValues = Array.from(
          data.groupBy((r) => r[col]).data.keys()
        ).length;
        if (numValues > binOther) {
          let otherValues = [] as string[];
          [data, otherValues] = binOtherRows(data, col, measure, binOther);
          if (!firstOtherValues) {
            firstOtherValues = otherValues;
          }
        }
      }
    }

    // Pivot the data per series as required by the charts component
    let pivotValues;
    if (color) {
      const groupKeys = [...(!xMeasure ? [x] : []), ...(!yMeasure ? [y] : [])];
      const valueKeys = [...(xMeasure ? [x] : []), ...(yMeasure ? [y] : [])];
      [data, pivotValues] = pivotData(data, color, valueKeys, groupKeys);
    }

    // Order categorical axes rationally
    if (!dualMeasure) {
      const measureCol = xMeasure ? x : y;
      const sortAxisCol = xMeasure ? y : x;
      if (meta.dimensions[sortAxisCol]?.type === 'string') {
        const seriesCols = pivotValues
          ? pivotValues.map((v) => `${v},${measureCol}`)
          : [measureCol];
        data = sortChartAxis(data, sortAxisCol, seriesCols);
      }
    }

    const seriesBase = {
      smooth: true,
      ...(chartType === 'area'
        ? {
            areaStyle: {},
            stack: 'Total',
          }
        : {}),
      ...(stack
        ? {
            stack: 'Total',
          }
        : {}),
    };

    const series = [] as SeriesOption[];
    if (pivotValues) {
      for (const col of pivotValues) {
        const xKey = xMeasure ? `${col},${x}` : x;
        const yKey = yMeasure ? `${col},${y}` : y;
        series.push({
          ...seriesBase,
          type: chartType === 'area' ? 'line' : chartType,
          name: col,
          encode: {
            x: xKey,
            y: yKey,
            itemName: xKey,
            tooltip: [...(yMeasure ? [yKey] : []), ...(xMeasure ? [xKey] : [])],
          },
        });
      }
    } else {
      series.push({
        ...seriesBase,
        type: chartType === 'area' ? 'line' : chartType,
        name: yColDef.shortTitle,
        encode: {
          x: x,
          y: y,
          itemName: x,
          tooltip: [x, y],
        },
      });
    }

    return {
      otherValues: firstOtherValues,
      option: {
        title: {
          text: title,
          textStyle: {
            fontWeight: 300,
            fontSize: '1rem',
          },
        },
        grid: {
          containLabel: true,
          ...(showLegend ? { bottom: '80' } : {}),
        },
        ...(showLegend
          ? {
              legend: {
                show: true,
                bottom: 0,
              },
            }
          : {}),
        backgroundColor: 'transparent',
        dataset: {
          source: data.data,
        },
        tooltip: {
          trigger: chartType === 'scatter' ? 'item' : 'axis',
          valueFormatter: (value) => {
            if (Array.isArray(value)) {
              return value.map((v) => {
                const val = v.valueOf();
                return typeof val === 'number' ? autoFormatNumber(val) : val;
              });
            } else {
              const val = value.valueOf();
              return typeof val === 'number' ? autoFormatNumber(val) : val;
            }
          },
          appendToBody: true,
          position: positionTooltip,
        },
        xAxis: {
          name: xColDef.shortTitle,
          nameLocation: 'middle',
          nameGap: axisType(xColDef.type) == 'category' ? 120 : 30,
          type: axisType(xColDef.type),
          axisLabel: {
            hideOverlap: axisType(xColDef.type) != 'category',
            rotate: axisType(xColDef.type) == 'category' ? 60 : 0,
            formatter: cubeAutoFormatter(meta, xColDef.name),
          },
        },
        yAxis: {
          name: yColDef.shortTitle,
          nameLocation: 'middle',
          nameGap: yMeasure ? 50 : 120,
          type: axisType(yColDef.type),
          inverse: !yMeasure,
          axisLabel: {
            formatter: cubeAutoFormatter(meta, yColDef.name),
          },
        },
        series,
      } as EChartsOption,
    };
  }, [
    lastResults,
    x,
    y,
    color,
    binOther,
    chartType,
    stack,
    showLegend,
    title,
    meta,
  ]);

  const onClick = useCallback(
    (clickParams: any) => {
      if (!onDrillDown) return;
      const drillAxisBinding = isDrillable(x, meta)
        ? x
        : isDrillable(y, meta)
        ? y
        : color;
      if (drillAxisBinding) {
        let bindingValue = clickParams.seriesName;
        if (drillAxisBinding in clickParams.data) {
          bindingValue = clickParams.data[drillAxisBinding];
        }
        if (bindingValue != 'Other') {
          onDrillDown([bindingValue]);
        } else if (otherValues) {
          onDrillDown(otherValues);
        }
      }
    },
    [onDrillDown, x, y, color, meta, otherValues]
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

  if (!x || !y) {
    return (
      <NonIdealState icon="timeline-bar-chart" title="Set x and y bindings" />
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
