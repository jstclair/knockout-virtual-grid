declare module VirtualGrid {
    export interface IVirtualGridBindingLayout {
        rows?: KnockoutObservable<number>;
        columns?: KnockoutObservable<number>;
    }

    export interface IVirtualGridBindingOffset {
        row?: KnockoutObservable<number>;
        column?: KnockoutObservable<number>;
    }

    export interface IAfterEditValues {
        didEdit: boolean;
        previous: any;
        value: any;
    }

    export interface IKnockoutVirtualGridBindingParameters {
        dataSource: KnockoutObservable<VirtualGrid.IVirtualGridRow<any>[]>;
        css: string;
        offset?: IVirtualGridBindingOffset;
        layout?: IVirtualGridBindingLayout;
        onEdit?: (value: any, info: IVirtualGridCellInfo<any>) => boolean;
        onAfterEdit?: (value: IAfterEditValues, info: IVirtualGridCellInfo<any>, cell: HTMLElement) => void;
    }

    export interface IVirtualGridLayoutColumn<T> {
        columnIndex: number;
        rowIndex: number;
        underlyingValue: KnockoutObservable<T>;
        value: KnockoutComputed<T>;
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
        tableCss: KnockoutObservable<string>;

        dispose: () => void;
    }

}
