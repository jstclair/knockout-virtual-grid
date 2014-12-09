declare module VirtualGrid {
    export interface IVirtualGridBindingLayout {
        row?: KnockoutObservable<number>;
        column?: KnockoutObservable<number>;
    }

    export interface IVirtualGridBindingParameters {
        dataSource: KnockoutObservable<IVirtualGridRow<any>[]>;
        offset?: IVirtualGridBindingLayout;
        onEdit?: (value: any, info: IVirtualGridCellInfo<any>) => boolean;
        onAfterEdit?: (previousValue: any, value: any, info: IVirtualGridCellInfo<any>, cell: HTMLElement) => void;
    }
}
