import { NonIdealState, ResizeSensor, Spinner } from '@blueprintjs/core';
import { TimeDimensionGranularity } from '@cubejs-client/core';
import {
  CubevizComponent,
  cubeAutoFormatter,
  getCubeColumn,
  useDashboardCubeQuery,
  useMeta,
  usePrepareDimensionCubeQuery,
} from '@cubeviz/core';
import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useMemo, useRef } from 'react';
import { max, min } from 'typed-data-table';
import { BarCellRenderer, SharedCellParams } from './bar-cell-renderer';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

export interface TableWidgetParams {
  columns: string[];
  timeDimensionGranularity?: TimeDimensionGranularity;
  onDrillDown?: (data: any) => void;
}

export const AgGridTable: CubevizComponent<TableWidgetParams> = ({
  columns,
  timeDimensionGranularity,
  theme,
  onDrillDown,
  baseQuery,
}) => {
  const meta = useMeta();
  const query = usePrepareDimensionCubeQuery(
    columns,
    timeDimensionGranularity,
    baseQuery
  );
  const { lastResults: results, isLoading } = useDashboardCubeQuery(query);

  const gridRef = useRef<AgGridReact | null>(null);

  const cellParams = useMemo(() => {
    return columns.reduce((obj, col) => {
      const values = results?.rawData()?.map((r: any) => r[col]);
      const metaObj = getCubeColumn(meta, col);
      if (!metaObj) {
        return obj;
      }
      if (metaObj.metaType == 'measure') {
        obj[col] = {
          minValue: values ? min(values) : 0,
          maxValue: values ? max(values) : 1,
          theme,
        };
      }
      return obj;
    }, {} as Record<string, SharedCellParams>);
  }, [columns, results, theme, meta]);

  const columnDefs = useMemo(() => {
    return columns.map((col: string) => {
      const metaObj = getCubeColumn(meta, col)!;
      const formatter = cubeAutoFormatter(meta, col, true);
      return {
        headerName: metaObj.shortTitle,
        field: col.replaceAll('.', '_'),
        cellRenderer: metaObj.metaType === 'measure' ? 'barCell' : undefined,
        cellRendererParams: cellParams[col],
        valueFormatter: formatter
          ? (params) => {
              return formatter(params.value);
            }
          : undefined,
        sortable: false,
      } as ColDef;
    });
  }, [columns, meta, cellParams]);

  const rowData = useMemo(() => {
    if (results) {
      return results.rawData().map((row: any) => {
        const newRow: any = {};
        for (const col in row) {
          newRow[col.replaceAll('.', '_')] = row[col];
        }
        return newRow;
      });
    }
    return [];
  }, [results]);

  // resize when the columns or data change
  useEffect(() => {
    if (columnDefs.length > 0 && rowData.length > 0) {
      gridRef.current?.api && gridRef.current.api.sizeColumnsToFit();
    }
  }, [columnDefs, rowData]);

  useEffect(() => {
    if (isLoading) {
      gridRef.current?.api && gridRef.current.api.showLoadingOverlay();
    } else {
      gridRef.current?.api && gridRef.current.api.hideOverlay();
    }
  }, [isLoading]);

  if (columnDefs.length === 0) {
    return (
      <NonIdealState title="Table" description="Configure columns in sidebar" />
    );
  }

  if (!results) {
    return <NonIdealState icon={<Spinner />} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
      }}
    >
      <ResizeSensor
        observeParents
        onResize={() => {
          gridRef.current && gridRef.current.api?.sizeColumnsToFit();
        }}
      >
        <div
          className={
            theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'
          }
          style={{ width: '100%', height: '100%', flex: '1 1 auto' }}
        >
          <AgGridReact
            ref={gridRef}
            rowHeight={30}
            onGridReady={(params) => params.api.sizeColumnsToFit()}
            headerHeight={30}
            components={{ barCell: BarCellRenderer }}
            columnDefs={columnDefs}
            rowData={rowData}
            rowSelection="single"
            onRowClicked={({ data }) => {
              onDrillDown && onDrillDown(data);
            }}
          />
        </div>
      </ResizeSensor>
    </div>
  );
};
