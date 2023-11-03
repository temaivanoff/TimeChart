// @ts-nocheck

import { axisBottom, axisLeft } from 'd3-axis';
import { select } from "d3-selection";
import { TimeChartPlugin } from ".";

export const d3Axis: TimeChartPlugin = {
    apply(chart) {
        const d3Svg = select(chart.svgLayer.svgNode)
        const xg = d3Svg.append('g');
        const yg = d3Svg.append('g');
        const myg = {}

        const xAxis = axisBottom(chart.model.xScale);
        const yAxis = axisLeft(chart.model.yScale);
        const mYAxis = {};

        if (Array.isArray(chart.options.yRanges)) {
          for (const range of chart.options.yRanges) {
            myg[range.id] = d3Svg.append('g');
            mYAxis[range.id] = axisLeft(chart.model.getYscale(range.id));
          }
        }

        function update() {
            if (chart.options.yRanges) {
              let yScalesPadding = null;

              for (const range of chart.options.yRanges) {
          
                mYAxis[range.id].scale(chart.model.getYscale(range.id));
                myg[range.id].call(mYAxis[range.id]);

                yScalesPadding = yScalesPadding + (yScalesPadding === null ? chart.options.paddingLeft : myg[range.id]._groups[0][0].getBoundingClientRect().width + 5);
                
                myg[range.id].attr('transform', `translate(${yScalesPadding}, 0)`);
              }

              chart.model.yScalesPadding = yScalesPadding;
            } else {
              yAxis.scale(chart.model.yScale);
              yg.call(yAxis);
            }     

            const xs = chart.model.xScale;
            const xr = xs.range();
            const xts = chart.options.xScaleType()
                .domain(xs.domain().map(d => d + chart.options.baseTime))
                .range(chart.options.yRanges ? [chart.model.yScalesPadding, xr[1]] : xr);
            xAxis.scale(xts);
            xg.call(xAxis);
        }

        chart.model.updated.on(update);

        chart.model.resized.on((w, h) => {
          const op = chart.options;
          xg.attr('transform', `translate(0, ${h - op.paddingBottom})`);

          if (op.yRanges) {

          } else {
            yg.attr('transform', `translate(${op.paddingLeft}, 0)`);
          }

          update()
        });
    }
}
