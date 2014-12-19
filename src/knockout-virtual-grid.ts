/// <reference path="./_references.d.ts" />
/// <amd-dependency path="text!./knockout-virtual-grid.html" />
import ko = require('knockout');
import LayoutOffsetHelper = require('./layoutOffsetHelper');

export var template: string = require('text!./knockout-virtual-grid.html');

export class viewModel implements VirtualGrid.IKnockoutVirtualGrid {
    public tableCss: KnockoutObservable<string>;
    public virtualGridRow: KnockoutObservableArray<VirtualGrid.IVirtualGridLayoutRow>;

    private dataSource: KnockoutObservable<VirtualGrid.IVirtualGridRow<any>[]>;
    private subscriptions: any[];
    private layout: LayoutOffsetHelper;

    private onEdit: (value: any, info: VirtualGrid.IVirtualGridCellInfo<any>) => boolean;
    private onAfterEdit: (value: VirtualGrid.IAfterEditValues, info: VirtualGrid.IVirtualGridCellInfo<any>, cell: HTMLElement) => void;

    constructor(params: VirtualGrid.IKnockoutVirtualGridBindingParameters) {
        console.log('[KnockoutVirtualGrid] %o', params);
        if (!params || !params.dataSource) {
            throw new Error('Invalid params');
        }
        this.tableCss = ko.observable<string>(params.css || '');
        this.dataSource = params.dataSource;
        this.onEdit = params.onEdit || this.handleOnEdit;
        this.onAfterEdit = params.onAfterEdit || this.handleOnAfterEdit;

        var data = params.dataSource(),
            init = this.measure(data);

        this.layout = new LayoutOffsetHelper(init.maxRows,
                                             init.maxColumns,
                                             params.offset,
                                             params.layout);

        var initialRows = this.initialize(data);

        this.virtualGridRow = ko.observableArray([]).extend({ rateLimit: 0 });
        this.virtualGridRow(initialRows);
        this.render();

        this.subscriptions = [
            this.layout.changed.subscribe(() => this.render()),
            this.dataSource.subscribe((rows: VirtualGrid.IVirtualGridRow<any>[]) => this.onNewData(rows))
        ];
    }

    private handleOnEdit(value: any, info: VirtualGrid.IVirtualGridCellInfo<any>): boolean {
        console.debug('[VG] base.handleOnEdit');
        return true;
    }

    private handleOnAfterEdit(value: VirtualGrid.IAfterEditValues, info: VirtualGrid.IVirtualGridCellInfo<any>, cell: HTMLElement) : void {
        console.debug('[VG] base.handleOnAfterEdit');
    }

    private onNewData(rows: VirtualGrid.IVirtualGridRow<any>[]) {
        console.log('[VG] onNewData...');
        var init = this.measure(rows);
        // if max is lower than existing visible, then we have to re-init
        if (init.maxRows < this.layout.rows() || init.maxColumns < this.layout.columns()) {
            console.log('[VG] re-initializing');
            this.layout.maxRows = init.maxRows;
            this.layout.maxColumns = init.maxColumns;
            this.render();
        }
        else {
            this.layout.maxRows = init.maxRows;
            this.layout.maxColumns = init.maxColumns;
            this.render();
        }
    }

    private measure(data: VirtualGrid.IVirtualGridRow<any>[]) {
        var result: any = {
            maxRows: 0,
            maxColumns: 0
        };

        if (data && data.length > 0) {
            result.maxRows = data.length;
            // for now, assume grid is rectangular
            if (data[0].columns && data[0].columns.length > 0){
                result.maxColumns = data[0].columns.length;
            }
        }

        console.log('[VG] initialize: %o', result);
        return result;
    }

    /*
    rowIndex: number;
    columns: KnockoutObservableArray<IVirtualGridLayoutColumn<any>>;
    rowCss: KnockoutObservable<string>;
    fixedColumns: KnockoutObservableArray<IVirtualGridLayoutFixedColumn<string>>;
    format: (value: any) => string;
    editable: KnockoutObservable<boolean>;
    */

    /*
    columnIndex: number;
    rowIndex: number;
    value: KnockoutObservable<T>;
    css: KnockoutObservable<string>;
    readonly: KnockoutObservable<boolean>;
    metadata: any;
    */
    private initialize(data: VirtualGrid.IVirtualGridRow<any>[]) : VirtualGrid.IVirtualGridLayoutRow[] {
        if (!data || data.length === 0) return [];

        var result: VirtualGrid.IVirtualGridLayoutRow[] = [],
            maxRows: number = Math.min(data.length, this.layout.rows()),
            maxColumns: number = Math.min(data[0].columns.length, this.layout.columns()),
            r: VirtualGrid.IVirtualGridRow<any>,
            c: VirtualGrid.IVirtualGridColumn<any>,
            columns: VirtualGrid.IVirtualGridLayoutColumn<any>[],
            startRow: number = Math.min(this.layout.column(), maxRows),
            startCol: number = Math.min(this.layout.row(), maxColumns);

        console.log('[VG] convert: max rows: %d, max cols: %d, i: %d, j: %d', maxRows, maxColumns, startRow, startCol);


        for (var i = startRow; i < maxRows; i++) {
            r = data[i];
            columns = [];

            for (var j = startCol; j < maxColumns; j++){
                c = r.columns[j];
                columns.push(this.getColumn(c.value, i, j, c.css));
            }

            result.push({
                rowIndex: i,
                columns: ko.observableArray(columns),
                rowCss: ko.observable(r.css && r.css.length > 0 ? r.css.join(' ') : ''),
                fixedColumns: ko.observableArray([]),
                format: (v: any) => v.toString(),
                editable: ko.observable(true)
            });
        }

        console.log('[VG] convert - rows: %d', result.length);

        return result;
    }

    private getColumn(value: any, row: number, col: number, css?: string[]): VirtualGrid.IVirtualGridLayoutColumn<any> {
        var v = ko.observable(value);
        var column = {
            columnIndex: col,
            rowIndex: row,
            underlyingValue: v,
            value: ko.computed({
                read: () => {
                    return column.underlyingValue();
                    },
                write: (newValue: any) => {
                    var current = column.underlyingValue.peek();
                    if (newValue === current) return;

                    var element= arguments.length > 1 ? arguments[1] : undefined,
                    cell: HTMLTableCellElement = element ? element.cell : undefined,
                    cellInfo: any = {
                        metadata: column.metadata,
                        rowIndex: column.rowIndex,
                        columnIndex: column.columnIndex
                    },
                    didEdit = false;

                    try {
                        didEdit = this.onEdit(newValue, cellInfo);
                        if (didEdit) {
                            column.underlyingValue(newValue);
                        }
                    } catch (e) {}

                    var value: VirtualGrid.IAfterEditValues = {
                        didEdit: didEdit,
                        previous: current,
                        value: newValue
                    };

                    this.onAfterEdit(value, cellInfo, cell);
                },
                deferEvaluation: true,
                pure: true,
                owner: this
            }).extend({ rateLimit: 0 }),
            css: ko.observable(css && css.length > 0 ? css.join(' ') : ''),
            readonly: ko.observable(false),
            metadata: {}
        };

        return column;
    }

    private render() {
        var source = this.dataSource.peek(),
            target = this.virtualGridRow.peek();

        if (!source || source.length === 0) return;

        var offset = {
                row: this.layout.row(),
                column: this.layout.column()
            },
            start = {
                row: Math.min(offset.row, this.layout.maxRows - this.layout.rows()),
                column: Math.min(offset.column, this.layout.maxColumns - this.layout.columns())
            },
            end = {
                row: Math.min(start.row + this.layout.rows(), this.layout.maxRows),
                column: Math.min(start.column + this.layout.columns(), this.layout.maxColumns)
            };

        console.log('[VG] render: source: [%d, %d ], start: %o, end: %o',
            source.length, source[0].columns.length, start, end);

        for (var targetRowIndex = 0, i = start.row; i < end.row; i++, targetRowIndex++) {
            // copy values from source to target
            var r = source[i],
                targetRow = target[targetRowIndex],
                targetColumns = targetRow.columns();

            targetRow.rowIndex = i;
            targetRow.rowCss(r.css && r.css.length > 0 ? r.css.join(' ') : '');

            for(var targetColumnIndex = 0, j = start.column; j < end.column; j++, targetColumnIndex++){
                // copy values from source[i].columns[j] to target
                var c = r.columns[j],
                    targetColumn = targetColumns[targetColumnIndex];

                targetColumn.rowIndex = i;
                targetColumn.columnIndex = j;
                targetColumn.metadata = c.metadata;

                targetColumn.underlyingValue(c.value);
                targetColumn.css(c.css && c.css.length > 0 ? c.css.join(' ') : '');
            }
        }
    }

    public dispose() {
        for(var i = 0; i < this.subscriptions.length; i++) {
            var sub = this.subscriptions[i];
            if (sub && sub.dispose) sub.dispose();
        }
        this.layout.dispose();
    }
}
