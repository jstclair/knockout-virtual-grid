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
    }


    public dispose() {
    }
}
