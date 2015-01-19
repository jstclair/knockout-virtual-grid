/// <reference path="./_references.d.ts" />
/// <amd-dependency path="resizeSensor" />
declare var ResizeSensor;

import ko = require('knockout');
import _ = require('lodash');

class ResizeHelper {
    private sensor:  any;
    private elem: HTMLElement;
    private size: ClientRect;
    private sizer: (size: ClientRect) => void;

    constructor(elem: HTMLElement, sizer: (size: ClientRect) => void) {
        if (!elem) {
            throw new Error('elem required');
        }
        this.elem = elem;

        if (!sizer) {
            throw new Error('sizer required');
        }
        this.sizer = sizer;

        var boundResize = this.onResize.bind(this),
            debouncedResize = _.debounce(boundResize, 100);

        this.sensor = new ResizeSensor(elem, debouncedResize);
    }

    public onResize(){
        var newSize: ClientRect = this.elem.getBoundingClientRect();
        console.log('[VG] onResize: from %o to %o', this.size, newSize);

        if (!this.size){
            this.sizer(newSize);
            this.size = newSize;
            return;
        }

        var vDiff = Math.abs(newSize.height - this.size.height),
            hDiff = Math.abs(newSize.width - this.size.width);

        console.log('[VG] onResize: vDiff %d, hDiff %d', vDiff, hDiff);

        if (newSize && (vDiff > 23 || hDiff > 43)) {
            this.sizer(newSize);
            this.size = newSize;
        }
    }

    public dispose() {
        if (this.sensor && this.sensor.detach) {
            this.sensor.detach();
        }
    }
}

export = ResizeHelper;
