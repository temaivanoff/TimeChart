// @ts-nocheck

import { scaleLinear } from "d3-scale";
import { ResolvedCoreOptions, TimeChartSeriesOptions } from '../options';
import { EventDispatcher } from '../utils';

export interface DataPoint {
    x: number;
    y: number;
}

export interface MinMax { min: number; max: number; }

function calcMinMaxY(arr: DataPoint[], start: number, end: number): MinMax {
    let max = -Infinity;
    let min = Infinity;
    for (let i = start; i < end; i++) {
        const v = arr[i].y;
        if (v > max) max = v;
        if (v < min) min = v;
    }
    return { max, min };
}

function unionMinMax(...items: MinMax[]) {
    return {
        min: Math.min(...items.map(i => i.min)),
        max: Math.max(...items.map(i => i.max)),
    };
}

export class RenderModel {
    xScale = scaleLinear();
    yScale = scaleLinear();
    yScales = {};
		yScalesPadding = 0;
    xScalesPadding = 0;

    xRange: MinMax | null = null;
    yRange: MinMax | null = null;

    constructor(chart, private options: ResolvedCoreOptions) {
        if (options.xRange !== 'auto' && options.xRange) {
            this.xScale.domain([options.xRange.min, options.xRange.max])
        }
        if (options.yRange !== 'auto' && options.yRange) {
            this.yScale.domain([options.yRange.min, options.yRange.max])
        }
        if (options.yRanges) {
          const _xRange = this.xScale.range;
          
          this.xScale.range = (p) => {
            if (p) {
              _xRange(p);
            }
            
            if (this.yScalesPadding !== 0 && this.xScalesPadding !== this.yScalesPadding) {
              this.xScalesPadding = this.yScalesPadding;
              options.renderPaddingLeft = this.yScalesPadding;
              chart.contentBoxDetector.node.style.left = this.yScalesPadding + 'px';
              const p = _xRange();
              _xRange([this.xScalesPadding, p[1]]);
            }
 
            return _xRange();
          }

          for (const range of options.yRanges) {
              this.yScales[range.id] = { min: range.min, max: range.max, scale: scaleLinear() };
              this.yScales[range.id].scale.domain([range.min, range.max]);
          }
        }
    }

    getYscale(rangeId) {
			if (this.yScales[rangeId]) {
				return this.yScales[rangeId].scale;
			}
			return this.yScale;
    }

    resized = new EventDispatcher<(width: number, height: number) => void>();
    resize(width: number, height: number) {
        const op = this.options;
        this.xScale.range([op.paddingLeft, width - op.paddingRight]);
        this.yScale.range([height - op.paddingBottom, op.paddingTop]);

				if (op.yRanges) {
					for (const range of op.yRanges) {
						this.getYscale(range.id).range([height - op.paddingBottom, op.paddingTop]);
					}
        }

        this.resized.dispatch(width, height)
        this.requestRedraw()
    }

    updated = new EventDispatcher();
    disposing = new EventDispatcher();
    readonly abortController = new AbortController();

    dispose() {
        if (!this.abortController.signal.aborted) {
            this.abortController.abort();
            this.disposing.dispatch();
        }
    }

    update() {
        this.updateModel();
        this.updated.dispatch();
        for (const s of this.options.series) {
            s.data._synced();
        }
    }

    updateModel() {
        const series = this.options.series.filter(s => s.data.length > 0);
        if (series.length === 0) {
            return;
        }

        const o = this.options;

        {
            const maxDomain = Math.max(...series.map(s => s.data[s.data.length - 1].x));
            const minDomain = Math.min(...series.map(s => s.data[0].x));
            this.xRange = { max: maxDomain, min: minDomain };
            if (this.options.realTime || o.xRange === 'auto') {
                if (this.options.realTime) {
                    const currentDomain = this.xScale.domain();
                    const range = currentDomain[1] - currentDomain[0];
                    this.xScale.domain([maxDomain - range, maxDomain]);
                } else { // Auto
                    this.xScale.domain([minDomain, maxDomain]);
                }
            } else if (o.xRange) {
                this.xScale.domain([o.xRange.min, o.xRange.max])
            }
        }
        {
            const minMaxY = series.flatMap(s => {
                return [
                    calcMinMaxY(s.data, 0, s.data.pushed_front),
                    calcMinMaxY(s.data, s.data.length - s.data.pushed_back, s.data.length),
                ];
            })
            if (this.yRange) {
                minMaxY.push(this.yRange);
            }
            this.yRange = unionMinMax(...minMaxY);
            if (o.yRange === 'auto') {
                this.yScale.domain([this.yRange.min, this.yRange.max]).nice();
            } else if (o.yRange) {
                this.yScale.domain([o.yRange.min, o.yRange.max])
            }
						if (o.yRanges) {
							for (const range of o.yRanges) {
								if (this.yScales[range.id] === undefined) {
									this.yScales[range.id] = { min: range.min, max: range.max, scale: scaleLinear() };
								}
								this.yScales[range.id].scale.domain([range.min, range.max]);
							}
						}
        }
    }

    private redrawRequested = false;
    requestRedraw() {
        if (this.redrawRequested) {
            return;
        }
        this.redrawRequested = true;
        const signal = this.abortController.signal;
        requestAnimationFrame((time) => {
            this.redrawRequested = false;
            if (!signal.aborted) {
                this.update();
            }
        });
    }

    pxPoint(dataPoint: DataPoint, rangeId) {
        return {
            x: this.xScale(dataPoint.x)!,
            y: this.getYscale(rangeId)(dataPoint.y)!,
        }
    }
}
