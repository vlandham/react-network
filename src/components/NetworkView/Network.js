import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import addComputedProps, { compose } from 'react-computed-props';

import { floatingTooltip } from '../tooltip/tooltip';
import { edgeArrow } from './layouts/draw';
import ForceLayout from './layouts/ForceLayout';
import { networkDisplay } from './layouts/constants';

import './Network.scss';

function chartProps(props) {
  const { height, width, graph } = props;

  const padding = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  let rScale = () => networkDisplay.nodeSize;
  const edgeColor = () => networkDisplay.edgeColor;
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  const nodeColor = d => colorScale(d.type);

  let sizeBy = 'r';

  const nodes = graph.nodes;
  const edges = graph.edges;

  return {
    plotWidth,
    plotHeight,
    padding,
    nodes,
    edges,
    rScale,
    edgeColor,
    nodeColor,
    sizeBy,
  };
}

function layoutProps(props) {
  const layout = new ForceLayout(props);

  return {
    layout,
  };
}

/**
 * Component.
 */
class Network extends Component {
  static propTypes = {
    colorScale: PropTypes.func,
    graph: PropTypes.object,
    height: PropTypes.number,
    layout: PropTypes.object,
    onClick: PropTypes.func,
    padding: PropTypes.object,
    plotHeight: PropTypes.number,
    plotWidth: PropTypes.number,
    width: PropTypes.number,
  };

  static defaultProps = {
    graph: { nodes: [], edges: [] },
    height: 800,
    width: 600,
    onClick: () => {},
    colorScale: () => '#777',
  };

  /**
   *
   */
  constructor(props) {
    super(props);

    this.ticked = this.ticked.bind(this);
    this.ended = this.ended.bind(this);

    this.dragStarted = this.dragStarted.bind(this);
    this.dragEnded = this.dragEnded.bind(this);
    this.dragged = this.dragged.bind(this);

    this.mouseover = this.mouseover.bind(this);
    this.mouseout = this.mouseout.bind(this);
    this.mouseoverEdge = this.mouseoverEdge.bind(this);
    this.mouseoutEdge = this.mouseoutEdge.bind(this);
    this.click = this.click.bind(this);
  }

  /**
   * When the react component mounts, setup the d3 vis
   */
  componentDidMount() {
    this.setup();
  }

  /**
   * When the react component updates, update the d3 vis
   */
  componentDidUpdate() {
    this.update();
    this.restartLayout();
  }

  /**
   * Unmount callback method.
   */
  componentWillUnmount() {
    this.tooltip.hideTooltip();
  }

  /**
   *
   */
  mouseover(el, d) {
    d3.select(el)
      .raise()
      .select('circle')
      .classed('hover', true);
  }

  /**
   *
   */
  mouseout(el) {
    d3.select(el)
      .select('circle')
      .classed('hover', false);
  }

  /**
   *
   */
  click(d) {
    const { onClick } = this.props;

    onClick(d);
  }

  /**
   * callback for drag start
   */
  dragStarted() {
    const { layout } = this.props;

    if (!d3.event.active) {
      layout.warm();
    }

    // NOTE: the subject is the data bound to the particular
    // node being moved. Pretty cool!
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  }

  /**
   * callback for drag
   */
  dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  }

  /**
   * callback for drag end
   */
  dragEnded() {
    const { layout } = this.props;

    if (!d3.event.active) {
      layout.cool();
    }
  }

  /**
   * Called when edge is moused over
   * @param {Object} d Data for edge
   * @param {Object} edge Edge DOM element
   */
  mouseoverEdge(d, edge) {
    d3.select(edge)
      .style('stroke', networkDisplay.edgeHighlightColor)
      .raise();
  }

  /**
   *
   * @param {*} d
   * @param {*} edge
   */
  mouseoutEdge(d, edge) {
    const { edgeColor } = this.props;
    d3.select(edge).style('stroke', edgeColor(d));
  }

  /**
   *
   */
  setup() {
    const cRoot = d3.select(this.root);

    this.tooltip = floatingTooltip('tooltip');

    this.g = cRoot.append('g');
    const g = this.g;

    this.edgesG = g.append('g').attr('class', 'edges');

    this.nodesG = g.append('g').attr('class', 'nodes');

    this.titlesG = g.append('g').attr('class', 'titles');

    this.showEdges = true;

    function zoomed() {
      g.attr('transform', d3.event.transform);
    }

    this.zoom = d3
      .zoom()
      .scaleExtent([1 / 20, 8])
      .on('zoom', zoomed);

    cRoot.call(this.zoom).on('dblclick.zoom', null);

    this.restartLayout();
    this.update();
  }

  /**
   * Restart the layout
   */
  restartLayout() {
    const { layout, nodes, edges } = this.props;

    layout.onTicked(this.ticked);
    layout.onEnded(this.ended);

    layout.restart(nodes, edges);
  }

  /**
   * Exit Layout
   */
  exitLayout() {
    const { layout } = this.props;
    layout.exit(this.underG, this.overG);
  }

  /**
   * Update SVG Edges on tick
   */
  tickedEdges() {
    if (this.showEdges) {
      this.edgesG.selectAll('.edge').attr('d', d => {
        // const targetSize = this.sizeNode(d.target);
        // const sourceSize = this.sizeNode(d.source);
        // const edgeSize = this.sizeEdge(d);
        return edgeArrow(d, 2, 2, 2);
      });
    } else {
      this.edgesG.selectAll('.edge').attr('d', () => '');
    }
  }

  /**
   * Update SVG Nodes on tick
   */
  tickedNodes() {
    this.nodesG.selectAll('.node').attr('transform', d => `translate(${d.x},${d.y})`);
  }

  /**
   * Update SVG Titles on tick
   */
  tickedTitles() {
    this.titlesG.selectAll('.title').attr('transform', d => `translate(${d.x},${d.y})`);
  }

  /*
   * Callback executed after ever tick of the simulation
   */
  ticked() {
    this.tickedNodes();
    this.tickedEdges();
    this.tickedTitles();
  }

  /*
   * Called when simulation finishes
   */
  ended() {
    this.showEdges = true;
  }

  /**
   *
   */
  update() {
    const { padding } = this.props;
    this.g.attr('transform', `translate(${padding.left} ${padding.top})`);

    this.updateLayout();
    this.updateNodes();
    this.updateEdges();
  }

  /**
   * Update layout with props and a place to render new content if need be.
   */
  updateLayout() {
    const { layout } = this.props;
    layout.render(this.props, this.underG, this.overG);
  }

  /**
   * Update display of nodes
   */
  updateNodes() {
    const { nodes, nodeColor } = this.props;

    let node = this.nodesG.selectAll('.node').data(nodes, d => d.id);

    const nodeE = node
      .enter()
      .append('g')
      .classed('node', true)
      .call(
        d3
          .drag()
          .on('start', this.dragStarted)
          .on('drag', this.dragged)
          .on('end', this.dragEnded),
      );
    nodeE.append('circle').classed('node-circle', true);

    // NOTE: Don't have the exit below the merge
    // if you plan on reusing the `node` variable!!!
    node.exit().remove();
    node = node.merge(nodeE);

    node
      .select('.node-circle')
      .attr('r', 5)
      .attr('fill', d => nodeColor(d));

    node.attr('transform', d => (d.x ? `translate(${d.x}, ${d.y})` : null));
  }

  /**
   * Update display of edges
   */
  updateEdges() {
    const { edges, edgeColor } = this.props;

    let edge = this.edgesG.selectAll('.edge').data(edges, d => d.id);

    const edgeE = edge
      .enter()
      .append('path')
      .classed('edge', true);

    edge.exit().remove();

    const that = this;
    edge = edge
      .merge(edgeE)
      .on('mouseover', function edgeOver(d) {
        that.mouseoverEdge(d, this);
      })
      .on('mouseout', function edgeOver(d) {
        that.mouseoutEdge(d, this);
      });
    edge.style('stroke', d => edgeColor(d)).style('stroke-width', 2);
  }

  /**
   *
   */
  render() {
    const { height, width } = this.props;

    return (
      <div>
        <svg
          className="Network chart"
          height={height}
          ref={node => {
            this.root = node;
          }}
          width={width}
        />
      </div>
    );
  }
}

export default compose(
  addComputedProps(chartProps),
  addComputedProps(layoutProps),
)(Network);
