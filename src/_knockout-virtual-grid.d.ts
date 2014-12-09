declare module VirtualGrid {
    export interface IVirtualGridBindingLayout {
        row?: KnockoutObservable<number>;
        column?: KnockoutObservable<number>;
    }

    export interface IKnockoutVirtualGridBindingParameters {
        dataSource: KnockoutObservable<IVirtualGridRow<any>[]>;
        offset?: IVirtualGridBindingLayout;
        onEdit?: (value: any, info: IVirtualGridCellInfo<any>) => boolean;
        onAfterEdit?: (previousValue: any, value: any, info: IVirtualGridCellInfo<any>, cell: HTMLElement) => void;
    }

    export interface IVirtualGridLayoutColumn<T> {
        columnIndex: number;
        rowIndex: number;
        value: KnockoutObservable<T>;
        css: KnockoutObservable<string>;
        readonly: KnockoutObservable<boolean>;
        metadata: any;
    }

    export interface IVirtualGridLayoutFixedColumn<T> extends IVirtualGridLayoutColumn<T> { }

    export interface IVirtualGridLayoutRow {
        rowIndex: number;
        columns: KnockoutObservableArray<IVirtualGridLayoutColumn<any>>;
        rowCss: KnockoutObservable<string>;
        fixedColumns: KnockoutObservableArray<IVirtualGridLayoutFixedColumn<string>>;
        format: (value: any) => string;
        editable: KnockoutObservable<boolean>;
    }


    export interface IKnockoutVirtualGrid {
        virtualGridRow: KnockoutObservableArray<VirtualGrid.IVirtualGridLayoutRow>;
        layout: {
            columns: KnockoutObservable<number>;
            rows: KnockoutObservable<number>;
        };
        offset: {
            column: KnockoutObservable<number>;
            row: KnockoutObservable<number>;
        };

        dispose: () => void;
    }

}
