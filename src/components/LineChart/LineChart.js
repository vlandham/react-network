import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import addComputedProps from 'react-computed-props';

/**
 * concats together an array of arrays
 * @param {Array} arrays Array of arrays
 */
export function concatArrays(arrays) {
  return [].concat.apply([], arrays);
}

function chartProps(props) {
  const { data, xFunc, yFunc, width, height } = props;
  const padding = {
    top: 20,
    right: 50,
    bottom: 40,
    left: 50,
  };

  const lines = data.lines;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  let xExtent = [];
  let yExtent = [0, 1];

  if (data) {
    const allXValues = concatArrays(lines.map(d => d.values.map(v => xFunc(v))));
    const allYValues = concatArrays(lines.map(d => d.values.map(v => yFunc(v))));

    xExtent = d3.extent(allXValues);
    yExtent = d3.extent(allYValues);
  }

  // console.log('x e', xExtent, ' y e: ', yExtent);
  const xScale = d3.scaleLinear();
  xScale.domain(xExtent).range([0, plotWidth]);

  const yScale = d3
    .scaleLinear()
    .domain(yExtent)
    .range([plotHeight, 0]);

  const lineGen = d3
    .line()
    .x(d => xScale(xFunc(d)))
    .y(d => yScale(yFunc(d)));

  return { lines, padding, plotHeight, plotWidth, xScale, yScale, lineGen };
}
/**
 * Line Chart to use in Small Multiple.
 */
class LineChart extends PureComponent {
  static propTypes = {
    /**
     * Data to show in small multiples.
     * Object should have an array of objects as `values`
     */
    // data: PropTypes.arrayOf(
    //   PropTypes.shape({
    //     key: PropTypes.string,
    //     values: PropTypes.array,
    //   }),
    // ),
    data: PropTypes.object,

    /**
     * Height of chart.
     */
    height: PropTypes.number,

    /**
     * Color of highlighted lines
     */
    highlightColor: PropTypes.string,

    /**
     * Array of strings of highlighted keys
     */
    highlightKeys: PropTypes.array,

    /**
     * Radius of dots
     */
    radius: PropTypes.number,

    /**
     * Width of chart.
     */
    width: PropTypes.number,

    /**
     * Extracts x value from lines data
     */
    xFunc: PropTypes.func,

    /**
     * Type of xScale to use - 'linear' or 'point'
     */
    xScaleType: PropTypes.string,

    /**
     * Extracts y value from lines data
     */
    yFunc: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    layersFunc: d => d.layers,
    height: 200,
    highlightColor: '#1565C0',
    radius: 3,
    width: 300,
    xLabel: '',
    xFunc: d => d[0],
    yFunc: d => d[1],
  };

  /**
   * Constructor
   */
  constructor(props) {
    super(props);

    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
  }

  /**
   * Update canvas when component mounts
   */
  componentDidMount() {
    this.setup();
    this.update();
  }

  /**
   * Update Canvas when component updates
   */
  componentDidUpdate() {
    this.update();
  }

  /**
   * Mouseover dot callback
   *
   * @param {*} el DOM Element
   * @param {*} d data
   */
  onMouseOver(el, d) {
    // set parent to be higlight
    // to highlight all dots associated with line
    const parent = d3.select(el.parentNode);
    parent.classed('highlight', true).raise();
    // use the parent's `key` value for highlighting the line
    // associated with that key
    const parentData = parent.datum();
    this.chart
      .selectAll('.line')
      .filter(d => d.key === parentData.key)
      .classed('highlight', true)
      .raise();
  }

  /**
   * Mouseout dot callback
   *
   * @param {Object} el DOM Element
   */
  onMouseOut() {
    d3.selectAll('.dots').classed('highlight', false);
    this.chart.selectAll('.line').classed('highlight', false);
  }

  /**
   * Setup called in componentDidMount
   */
  setup() {
    const cRoot = d3.select(this.root);
    this.g = cRoot.append('g');

    this.xAxis = this.g.append('g').classed('x-axis', true);
    this.yAxis = this.g.append('g').classed('y-axis', true);
    this.chart = this.g.append('g').classed('chart-group', true);

    this.xAxisLabel = this.g
      .append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle');

    this.update();
  }

  /**
   * Updates chart when data is updated.
   */
  update() {
    const { padding } = this.props;
    this.g.attr('transform', `translate(${padding.left} ${padding.top})`);
    this.updateLines();
    // this.updateDots();
    this.updateLabels();
    this.updateAxes();
  }

  updateLabels() {
    const { data, yScale, yFunc, plotWidth } = this.props;

    const binding = this.chart.selectAll('.label').data(data.lines, d => d.key);
    binding.exit().remove();
    const enter = binding
      .enter()
      .append('text')
      .classed('label', true)
      .attr('pointer-event', 'none');

    const labelMerge = binding.merge(enter);
    labelMerge
      .attr('x', plotWidth)
      .attr('y', d => yScale(yFunc(d.values[d.values.length - 1])))
      .text(d => d.key);
  }

  /**
   * Update Lines in chart
   */
  updateLines() {
    const { data, lineGen, highlightColor, highlightKeys, colorBy, colorScale } = this.props;

    const binding = this.chart.selectAll('.line').data(data.lines, d => d.key);

    binding.exit().remove();

    const enter = binding
      .enter()
      .append('path')
      .classed('line', true)
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('pointer-event', 'none');

    const lineMerge = binding.merge(enter);

    // make the lin
    lineMerge
      .attr('d', d => lineGen(d.values))
      .attr('stroke', '#777')
      .attr('opacity', 0.8);
    // .attr('stroke', d =>
    //   highlightKeys.includes(d.key) ? highlightColor : colorScale(d[colorBy]),
    // )
    // .attr('opacity', d => {
    //   if (highlightKeys.length > 0) {
    //     return highlightKeys.includes(d.key) ? 0.9 : 0.4;
    //   }

    //   return 0.7;
    // });

    // put highlight lines on top
    // lineMerge.filter(d => highlightKeys.includes(d.key)).raise();
  }

  /**
   * Display / Update Dots on top of lines
   */
  updateDots() {
    const {
      data,
      xFunc,
      yFunc,
      xScale,
      yScale,
      radius,
      colorBy,
      colorScale,
      highlightKeys,
      highlightColor,
    } = this.props;

    const dotGBinding = this.chart.selectAll('.dots').data(data, d => d.key);

    dotGBinding.exit().remove();

    const that = this;
    const dotGEnter = dotGBinding
      .enter()
      .append('g')
      .classed('dots', true);

    const dotGMerge = dotGBinding.merge(dotGEnter);

    dotGMerge
      .attr('fill', d => (highlightKeys.includes(d.key) ? highlightColor : colorScale(d[colorBy])))
      .attr('opacity', d => {
        if (highlightKeys.length > 0) {
          return highlightKeys.includes(d.key) ? 0.9 : 0.4;
        }

        return 0.7;
      });

    // put highlight dots on the top
    dotGMerge.filter(d => highlightKeys.includes(d.key)).raise();

    const dotBinding = dotGMerge.selectAll('.dot').data(d => d.values);

    dotBinding.exit().remove();

    const dotEnter = dotBinding
      .enter()
      .append('circle')
      .classed('dot', true)
      .on('mouseover', function(d) {
        that.onMouseOver(this, d);
      })
      .on('mouseout', function(d) {
        that.onMouseOut(this, d);
      });

    const dotMerge = dotBinding.merge(dotEnter);

    dotMerge
      .attr('cx', d => xScale(xFunc(d)))
      .attr('cy', d => yScale(yFunc(d)))
      .attr('r', radius);
  }

  /**
   * Update Axes
   */
  updateAxes() {
    const { xScale, xLabel, yScale, plotWidth, padding, plotHeight } = this.props;
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);

    this.xAxis.attr('transform', `translate(${0}, ${plotHeight})`).call(xAxis);

    const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);

    this.yAxis.call(yAxis);

    this.xAxisLabel
      .attr(
        'transform',
        `translate(${plotWidth / 2} ${plotHeight + padding.top + padding.bottom / 3})`,
      )
      .text(xLabel);
  }

  /**
   * React render method
   */
  render() {
    const { height, width } = this.props;
    return (
      <svg
        className="LineChart chart"
        height={height}
        ref={node => {
          this.root = node;
        }}
        width={width}
      />
    );
  }
}

export default addComputedProps(chartProps)(LineChart);
