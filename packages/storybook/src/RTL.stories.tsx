import React, {
    useRef,
    useState,
    useCallback,
} from "react";
import Grid, {
    Cell as DefaultCell,
    useSelection,
    useCopyPaste,
    GridRef,
} from "@rowsncolumns/grid";

export default {
    title: "RTL Grid",
    component: Grid,
};

export const RTLGrid: React.FC = () => {
    const width = 900;
    const height = 600;
    const App = () => {
        return (
            <Grid
                width={width}
                height={height}
                columnCount={200}
                rowCount={200}
                columnWidth={(index) => {
                    return 100;
                }}
                itemRenderer={(props) => (
                    <DefaultCell
                        {...props}
                        value={`${props.rowIndex}:${props.columnIndex}`}
                    />
                )}
                rowHeight={(index) => {
                    return 20;
                }}
                direction="rtl"
            />
        );
    };

    return <App />;
};

export const RTLGridWithFrozenColumns: React.FC = () => {
    const width = 900;
    const height = 600;
    const App = () => {
        return (
            <Grid
                width={width}
                height={height}
                columnCount={200}
                rowCount={200}
                frozenColumns={2}
                frozenRows={2}
                columnWidth={(index) => {
                    return 100;
                }}
                itemRenderer={(props) => (
                    <DefaultCell
                        {...props}
                        value={`${props.rowIndex}:${props.columnIndex}`}
                    />
                )}
                rowHeight={(index) => {
                    return 20;
                }}
                direction="rtl"
            />
        );
    };

    return <App />;
};

export const RTLGridWithSelectionAndCopy: React.FC = () => {
    const width = 900;
    const height = 600;
    const rowCount = 100;
    const columnCount = 100;
    const App = () => {
        const [data, setData] = useState({
            [[1, 2]]: "Hello world",
        });
        const gridRef = useRef<GridRef>();
        const getValue = useCallback(
            ({ rowIndex, columnIndex }) => {
                return data[[rowIndex, columnIndex]];
            },
            [data]
        );
        const { activeCell, selections, setSelections, ...selectionProps } =
            useSelection({
                gridRef,
                columnCount,
                rowCount,
                direction: "rtl",
            });

        const { copy, paste } = useCopyPaste({
            gridRef,
            selections,
            activeCell,
            getValue,
            onPaste: (rows, activeCell) => {
                const { rowIndex, columnIndex } = activeCell;
                const endRowIndex = Math.max(rowIndex, rowIndex + rows.length - 1);
                const endColumnIndex = Math.max(
                    columnIndex,
                    columnIndex + (rows.length && rows[0].length - 1)
                );
                const changes = {};
                for (const [i, row] of rows.entries()) {
                    for (const [j, cell] of row.entries()) {
                        changes[[rowIndex + i, columnIndex + j]] = cell.text;
                    }
                }
                setData((prev) => ({ ...prev, ...changes }));

                /* Should select */
                if (rowIndex === endRowIndex && columnIndex === endColumnIndex) return;

                setSelections([
                    {
                        bounds: {
                            top: rowIndex,
                            left: columnIndex,
                            bottom: endRowIndex,
                            right: endColumnIndex,
                        },
                    },
                ]);
            },
            onCut: (selection) => {
                const { bounds } = selection;
                const changes = {};
                for (let i = bounds.top; i <= bounds.bottom; i++) {
                    for (let j = bounds.left; j <= bounds.right; j++) {
                        changes[[i, j]] = undefined;
                    }
                }
                setData((prev) => ({ ...prev, ...changes }));
            },
        });
        return (
            <>
                <div style={{ marginBottom: 10 }}>
                    <button onClick={() => copy()}>Copy</button>
                    <button onClick={() => paste()}>Paste</button>
                </div>
                <Grid
                    activeCell={activeCell}
                    selections={selections}
                    ref={gridRef}
                    width={width}
                    height={height}
                    rowCount={rowCount}
                    columnCount={columnCount}
                    columnWidth={() => 100}
                    rowHeight={() => 20}
                    direction="rtl"
                    itemRenderer={(props) => {
                        return (
                            <DefaultCell
                                {...props}
                                value={data[[props.rowIndex, props.columnIndex]]}
                            />
                        );
                    }}
                    {...selectionProps}
                />
            </>
        );
    };
    return <App />;
};
