declare module VirtualGrid {
    export interface IVirtualGridRow<T> {
        css?: string[];
        columns: IVirtualGridColumn<T>[];
        fixedColumns?: IVirtualGridFixedColumn<string>[];
        format?: (value: T) => string;
        editable?: boolean;
    }

    export interface IVirtualGridColumn<T> {
        value: T;
        css?: string[];
        readonly?: boolean;
        metadata?: any;
    }

    export interface IVirtualGridFixedColumn<T> extends IVirtualGridColumn<T> {
    }

    export interface IVirtualGridCellInfo<T> {
        index: {
            row: number;
            column: number;
        };
        metadata: T;
    }

    export interface ISupportVirtualGridEditing<T,K> {
        onEdit: (value: T, info: IVirtualGridCellInfo<K>) => boolean;
        onAfterEdit?: (previousValue: T, value: T, info: IVirtualGridCellInfo<K>, cell: HTMLElement) => void;
    }
}
