/// <reference path="./_references.d.ts" />
import ko = require('knockout');

class LayoutOffsetHelper {
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
        if (val < 0 || isNaN(val)) {
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
        if (val < 0 || isNaN(val)) {
          offsets[1](0);
        } else if (val >= 0 && val < min + 1) {
          offsets[1](val);
        } else {
          offsets[1](min);
        }
      },
      deferEvaluation: true,
      owner: this
    }).extend({ rateLimit: 0 });

    this.rows = ko.computed({
      read: () => {
        return offsets[2]();
      },
      write: (val: number) => {
        offsets[2](val);
      },
      deferEvaluation: true,
      owner: this
    }).extend({ rateLimit: 0 });

    this.columns = ko.computed({
      read: () => {
        return offsets[3]();
      },
      write: (val: number) => {
        offsets[3](val);  
      },
      deferEvaluation: true,
      owner: this
    }).extend({ rateLimit: 0 });

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

export = LayoutOffsetHelper;
