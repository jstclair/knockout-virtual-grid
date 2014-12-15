/// <reference path="./_references.d.ts" />
/// <amd-dependency path="text!./knockout-virtual-grid.html" />
define(["require", "exports", 'knockout', "text!./knockout-virtual-grid.html"], function (require, exports, ko) {
    exports.template = require('text!./knockout-virtual-grid.html');
    var viewModel = (function () {
        function viewModel(params) {
            var _this = this;
            console.log('[KnockoutVirtualGrid] %o', params);
            if (!params) {
                throw new Error('Invalid params');
            }
            this.dataSource = params.dataSource;
            if (params.layout) {
                this.layout = {
                    columns: params.layout.columns || ko.observable(20),
                    rows: params.layout.rows || ko.observable(20)
                };
            }
            else {
                this.layout = {
                    columns: ko.observable(20).extend({ rateLimit: 0 }),
                    rows: ko.observable(20).extend({ rateLimit: 0 })
                };
            }
            if (params.offset) {
                this.offset = {
                    column: params.offset.column.extend({ rateLimit: 0 }) || ko.observable(0).extend({ rateLimit: 0 }),
                    row: params.offset.row.extend({ rateLimit: 0 }) || ko.observable(0).extend({ rateLimit: 0 }),
                    changeTracker: ko.computed({
                        read: function () {
                            var r = _this.offset.row(), c = _this.offset.column();
                            return [r, c];
                        },
                        deferEvaluation: true,
                        pure: true,
                        owner: this
                    })
                };
            }
            else {
                this.offset = {
                    column: ko.observable(0).extend({ rateLimit: 0 }),
                    row: ko.observable(0).extend({ rateLimit: 0 }),
                    changeTracker: ko.computed({
                        read: function () {
                            var r = _this.offset.row(), c = _this.offset.column();
                            return [r, c];
                        },
                        deferEvaluation: true,
                        pure: true,
                        owner: this
                    })
                };
            }
            this.initialize();
            var data = this.dataSource(), initialRows = this.convert(data);
            this.virtualGridRow(initialRows);
            this.render();
            this.subscriptions = [
                this.offset.changeTracker.subscribe(function () { return _this.render(); })
            ];
        }
        viewModel.prototype.onNewData = function (rows) {
        };
        viewModel.prototype.initialize = function () {
            var rows = this.layout.rows(), columns = this.layout.columns(), hasData = this.dataSource && this.dataSource.peek().length > 0, existingData = hasData ? this.dataSource.peek() : [];
            // for now, assume grid is rectangular
            if (hasData) {
                rows = Math.min(rows, existingData.length);
                columns = Math.min(columns, existingData[0].columns.length);
            }
            this.layout.rows(rows);
            this.layout.columns(columns);
            console.log('[VG] initialize - rows: %d, columns: %d', rows, columns);
            this.virtualGridRow = ko.observableArray([]).extend({ rateLimit: 0 });
        };
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
        viewModel.prototype.convert = function (data) {
            if (!data || data.length === 0)
                return [];
            var result = [], maxRows = Math.min(data.length, this.layout.rows()), maxColumns = Math.min(data[0].columns.length, this.layout.columns()), r, c, columns, startRow = Math.min(this.offset.column(), maxRows), startCol = Math.min(this.offset.row(), maxColumns);
            console.log('[VG] convert: max rows: %d, max cols: %d, i: %d, j: %d', maxRows, maxColumns, i, j);
            for (var i = startRow; i < maxRows; i++) {
                r = data[i];
                columns = [];
                for (var j = startCol; j < maxColumns; j++) {
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
                    format: function (v) { return v.toString(); },
                    editable: ko.observable(false)
                });
            }
            console.log('[VG] convert - rows: %d', result.length);
            return result;
        };
        viewModel.prototype.render = function () {
            var source = this.dataSource(), target = this.virtualGridRow();
            if (!source || source.length === 0)
                return;
            var rowOffset = this.offset.row(), colOffset = this.offset.column(), startRow = Math.min(rowOffset, source.length - rowOffset), startCol = Math.min(colOffset, source[0].columns.length - colOffset), maxRows = Math.min(this.layout.rows(), source.length), maxColumns = Math.min(this.layout.columns(), source[0].columns.length);
            console.log('[VG] render: max rows: %d, max cols: %d', maxRows, maxColumns);
            for (var targetRowIndex = 0, i = startRow; i < maxRows; i++, targetRowIndex++) {
                // copy values from source to target
                var r = source[i], targetRow = target[targetRowIndex], targetColumns = targetRow.columns();
                targetRow.rowCss(r.css && r.css.length > 0 ? r.css.join(' ') : '');
                for (var targetColumnIndex = 0, j = startCol; j < maxColumns; j++, targetColumnIndex++) {
                    // copy values from source[i].columns[j] to target
                    var c = r.columns[j], targetColumn = targetColumns[targetColumnIndex];
                    targetColumn.value(c.value);
                    targetColumn.css(c.css && c.css.length > 0 ? c.css.join(' ') : '');
                }
            }
        };
        viewModel.prototype.dispose = function () {
            for (var i = 0; i < this.subscriptions.length; i++) {
                var sub = this.subscriptions[i];
                if (sub && sub.dispose)
                    sub.dispose();
            }
            this.offset.changeTracker.dispose();
        };
        return viewModel;
    })();
    exports.viewModel = viewModel;
});
//# sourceMappingURL=knockout-virtual-grid.js.map