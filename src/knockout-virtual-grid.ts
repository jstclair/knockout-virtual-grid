/// <reference path="./_references.d.ts" />
/// <amd-dependency path="text!./knockout-virtual-grid.html" />

import ko = require('knockout');

export var template: string = require('text!./knockout-virtual-grid.html');

export class viewModel implements VirtualGrid.IKnockoutVirtualGrid {
    public tableCss: KnockoutObservable<string>;
    public virtualGridRow: KnockoutObservableArray<VirtualGrid.IVirtualGridLayoutRow>;

    private dataSource: KnockoutObservable<VirtualGrid.IVirtualGridRow<any>[]>;
    private subscriptions: any[];
    private layout: LayoutOffsetHelper;

    constructor(params: VirtualGrid.IKnockoutVirtualGridBindingParameters) {
        console.log('[KnockoutVirtualGrid] %o', params);
        if (!params || !params.dataSource) {
            throw new Error('Invalid params');
        }
        this.tableCss = ko.observable<string>(params.css || '');
        this.dataSource = params.dataSource;

        var data = params.dataSource(),
            init = this.measure(data);

        this.layout = new LayoutOffsetHelper(init.maxRows,
                                             init.maxColumns,
                                             params.offset,
                                             params.layout);

        var initialRows = this.convert(data);

        this.virtualGridRow = ko.observableArray([]).extend({ rateLimit: 0 });
        this.virtualGridRow(initialRows);
        this.render();

        this.subscriptions = [
            this.layout.changed.subscribe(() => this.render()),
            this.dataSource.subscribe(() => this.render())
        ];
    }

    private onNewData(rows: VirtualGrid.IVirtualGridRow<any>[]) {
        var init = this.measure(rows);
        // if max is lower than existing visible, then we have to re-init
        if (init.maxRows < this.layout.rows() || init.maxColumns < this.layout.columns()) {
            console.log('[VG] re-initializing');
        }
        else {
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
    private convert(data: VirtualGrid.IVirtualGridRow<any>[]) : VirtualGrid.IVirtualGridLayoutRow[] {
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

                columns.push({
                    columnIndex: j,
                    rowIndex: i,
                    value: ko.observable(c.value),
                    css: ko.observable(c.css && c.css.length > 0 ? c.css.join(' ') : ''),
                    readonly: ko.observable(false),
                    metadata: {}
                });
            }

            result.push({
                rowIndex: i,
                columns: ko.observableArray(columns),
                rowCss: ko.observable(r.css && r.css.length > 0 ? r.css.join(' ') : ''),
                fixedColumns: ko.observableArray([]),
                format: (v: any) => v.toString(),
                editable: ko.observable(false)
            });
        }

        console.log('[VG] convert - rows: %d', result.length);

        return result;
    }

    private render() {
        var source = this.dataSource(),
            target = this.virtualGridRow();

        if (!source || source.length === 0) return;

        var rowOffset = this.layout.row(),
            colOffset = this.layout.column(),

            startRow = Math.min(rowOffset, source.length - this.layout.rows()),
            startCol = Math.min(colOffset, source[0].columns.length - this.layout.columns()),

            endRow = Math.min(startRow + this.layout.rows(), source.length),
            endColumn = Math.min(startCol + this.layout.columns(), source[0].columns.length);

        console.log('[VG] render: source - rows: %d, cols: %d', source.length, source[0].columns.length);
        console.log('[VG] render: start - row: %d, col: %d', startRow, startCol);
        console.log('[VG] render: end   - row: %d, col: %d', endRow, endColumn);

        for (var targetRowIndex = 0, i = startRow; i < endRow; i++, targetRowIndex++) {
            // copy values from source to target
            var r = source[i],
                targetRow = target[targetRowIndex],
                targetColumns = targetRow.columns();

            targetRow.rowCss(r.css && r.css.length > 0 ? r.css.join(' ') : '');

            for(var targetColumnIndex = 0, j = startCol; j < endColumn; j++, targetColumnIndex++){
                // copy values from source[i].columns[j] to target
                var c = r.columns[j],
                    targetColumn = targetColumns[targetColumnIndex];

                targetColumn.value(c.value);
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

export class LayoutOffsetHelper {
    public column: KnockoutComputed<number>;
    public row: KnockoutComputed<number>;
    public columns: KnockoutComputed<number>;
    public rows: KnockoutComputed<number>;
    public changed: KnockoutComputed<number[]>;

    constructor(public maxRows: number, public maxColumns: number,
                offset?: VirtualGrid.IVirtualGridBindingOffset,
                layout?: VirtualGrid.IVirtualGridBindingLayout) {

        var offsets: KnockoutObservable<number>[] = [],
            val: number;

        //[0]
        if (offset && offset.row) {
            offsets.push(offset.row);
        } else {
            offsets.push(ko.observable(0));
        }
        //[1]
        if (offset && offset.column) {
            offsets.push(offset.column);
        } else {
            offsets.push(ko.observable(0));
        }
        //[2]
        if (layout && layout.rows) {
            offsets.push(layout.rows);
        } else {
            // ensure that layout rows are <= max
            val = Math.min(25, this.maxRows);
            offsets.push(ko.observable(val));
        }
        //[3]
        if (layout && layout.columns) {
            offsets.push(layout.columns);
        } else {
            // ensure that layout columns are <= max
            val = Math.min(35, this.maxColumns);
            offsets.push(ko.observable(val));
        }

        this.row = ko.computed({
            read: () => {
                var v = offsets[0],
                    val = v();
                console.log('[VG] layout - row: %d', val);
                return val;
            },
            write: (val: number) => {
                var min = this.maxRows - this.rows();
                if (val < 0 || isNaN(val)){
                    offsets[0](0);
                } else if (val >= 0 && val < min + 1) {
                    offsets[0](val);
                } else {
                    offsets[0](min);
                }
            },
            deferEvaluation: true,
            owner: this
        }).extend({ rateLimit: 0 });

        this.column = ko.computed({
            read: () => {
                return offsets[1]();
            },
            write: (val: number) => {
                // can't advance beyond the starting visible column
                var min = this.maxColumns - this.columns();
                if (val < 0 || isNaN(val)){
                    offsets[1](0);
                } else if (val >= 0 && val < min + 1) {
                    offsets[1](val);
                } else {
                    offsets[1](min);
                }
            },
            deferEvaluation: true,
            owner: this
        }).extend({ rateLimit: 0});

        this.rows = ko.computed({
            read: () => {
                return offsets[2]();
            },
            deferEvaluation: true,
            owner: this
        }).extend({ rateLimit: 0});

        this.columns = ko.computed({
            read: () => {
                return offsets[3]();
            },
            deferEvaluation: true,
            owner: this
        }).extend({ rateLimit: 0});

        this.changed = ko.computed({
            read: () => {
                return [this.row(), this.column(), this.rows(), this.columns()];
            },
            owner: this,
            pure: true,
            deferEvaluation: true
        }).extend({ rateLimit: 0 });
    }

    dispose() {
        this.row.dispose();
        this.column.dispose();
        this.rows.dispose();
        this.columns.dispose();
        this.changed.dispose();
    }
}
