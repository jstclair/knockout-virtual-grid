/// <reference path="./_references.d.ts" />
/// <amd-dependency path="text!./knockout-virtual-grid.html" />

import ko = require('knockout');

export var template: string = require('text!./knockout-virtual-grid.html');

export class viewModel implements VirtualGrid.IKnockoutVirtualGrid {
    public virtualGridRow: KnockoutObservableArray<VirtualGrid.IVirtualGridLayoutRow>;

    public layout: {
        columns: KnockoutObservable<number>;
        rows: KnockoutObservable<number>;
    }
    public offset: {
        column: KnockoutObservable<number>;
        row: KnockoutObservable<number>;
    }

    private dataSource: KnockoutObservable<VirtualGrid.IVirtualGridRow<any>[]>;

    constructor(params: VirtualGrid.IKnockoutVirtualGridBindingParameters) {
        console.log('[KnockoutVirtualGrid] %o', params);
        if (!params) {
            throw new Error('Invalid params');
        }
        this.dataSource = params.dataSource;

        if (params.layout) {
            this.layout = {
                columns: params.layout.columns || ko.observable(0),
                rows: params.layout.rows || ko.observable(0)
            }

        } else {
            this.layout = {
                columns: ko.observable(0),
                rows: ko.observable(0)
            }
        }

        if (params.offset) {
            this.offset = {
                column: params.offset.column || ko.observable(0),
                row: params.offset.row || ko.observable(0)
            }
        } else {
            this.offset = {
                column: ko.observable(0),
                row: ko.observable(0)
            }
        }

        var data = this.dataSource(),
            initialRows: VirtualGrid.IVirtualGridLayoutRow[] = [],
            i: number = 0, j: number = 0,
            r: VirtualGrid.IVirtualGridRow<any>,
            c: VirtualGrid.IVirtualGridColumn<any>,
            columns: VirtualGrid.IVirtualGridLayoutColumn<any>[];

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
        if (data) {
            console.log('[KVG] data: %o', data);
            for (i = 0; i < data.length; i++) {
                r = data[i];
                columns = [];

                for (j = 0; j < r.columns.length; j++){
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

                initialRows.push({
                        rowIndex: i,
                        columns: ko.observableArray(columns),
                        rowCss: ko.observable(r.css && r.css.length > 0 ? r.css.join(' ') : ''),
                        fixedColumns: ko.observableArray([]),
                        format: (v: any) => v.toString(),
                        editable: ko.observable(false)
                    });
            }
        }

        this.virtualGridRow = ko.observableArray(initialRows);

        console.log('[KVG] rows: %o', this.virtualGridRow());

    }


    public dispose() {
    }
}
