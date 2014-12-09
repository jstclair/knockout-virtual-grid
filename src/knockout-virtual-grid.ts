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

    constructor(params: VirtualGrid.IKnockoutVirtualGridBindingParameters) { }


    public dispose() {
    }
}
