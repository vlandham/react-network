import * as d3 from 'd3';
import NetworkLayout from './NetworkLayout';
import gridLayout from './grid_layout';
import { networkDisplay } from './constants';

/**
 * Setup simulation to run in force layout mode.
 * @param {Object} props Input props
 */
function setupGroupBySimulation(props) {
  const { width, height, rScale, sizeBy, groupBy, nodes, chargeMultiplier } = props;

  if (!nodes) {
    return null;
  }

  const simulation = d3
    .forceSimulation()
    .velocityDecay(0.2)
    .alphaMin(0.1);
  simulation.stop();

  // setup many body force to have nodes repel one another
  // increasing the chargePower here to make nodes stand about
  // TODO: need to figure out original vs current value
  // TODO: is there a more appropriate place for this function?
  function charge(d) {
    const mult = sizeBy === 'none' ? 0.45 : 0.25;
    if (d.entityType !== 'application') {
      return -Math.pow(networkDisplay.nodeSize, 2) * (mult * chargeMultiplier);
    }
    return -Math.pow(rScale(d[sizeBy]), 2) * (mult * chargeMultiplier);
  }

  // TODO: max distance is based on observation of the data
  simulation.force(
    'charge',
    d3
      .forceManyBody()
      .strength(charge)
      .distanceMax(220),
  );

  const grid = gridLayout()
    .width(width)
    .height(height)
    .key(groupBy);

  grid.arrange(nodes);

  const gridPoints = grid.grid();

  const xForce = d3
    .forceX()
    .strength(0.05)
    .x(d => d.gridx);

  const yForce = d3
    .forceY()
    .strength(0.05)
    .y(d => d.gridy);

  simulation.force('x', xForce);
  simulation.force('y', yForce);

  return {
    simulation,
    gridPoints,
  };
}

/**
 * GroupBy Network Layout
 */
class GroupByLayout extends NetworkLayout {
  /**
   * constructor
   * @param {Object} props Props from parent component.
   */
  constructor(props) {
    super(props);

    const simFeatures = setupGroupBySimulation(props);

    this.simulation = simFeatures.simulation;
    this.gridPoints = simFeatures.gridPoints;
  }

  /**
   * Render groupby layout
   * @param {Object} props Props from parent component.
   * @param {Object} svgG SVG group to draw into
   */
  render(props, underG, overG) {
    let maxSize = 450;
    if (props.sizeBy !== 'none') {
      maxSize = 600;
    }

    const rScale = d3
      .scaleSqrt()
      .domain([5, 400])
      .clamp(true)
      .range([20, maxSize]);

    const groupCircles = underG.selectAll('.circle').data(this.gridPoints);

    const groupCirclesE = groupCircles
      .enter()
      .append('circle')
      .classed('circle', true);

    groupCircles
      .merge(groupCirclesE)
      .attr('r', d => rScale(d.count))
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    groupCircles.exit().remove();

    const groupTitles = overG.selectAll('.title').data(this.gridPoints);
    const groupTitlesE = groupTitles
      .enter()
      .append('text')
      .classed('title', true);

    groupTitles
      .merge(groupTitlesE)
      .text(d => d.id)
      .attr('text-anchor', 'middle')
      .attr('x', d => d.x)
      .attr('y', d => d.y - rScale(d.count))
      .attr('dy', -20);

    groupTitles.exit().remove();
  }

  /**
   * Called when layout is switching
   * @param {Object} svgG SVG group to draw into
   */
  exit(underG, overG) {
    underG
      .selectAll('.circle')
      .data([])
      .exit()
      .remove();
    overG
      .selectAll('.title')
      .data([])
      .exit()
      .remove();
  }

  /**
   *
   */
  find(x, y, r) {
    return this.simulation.find(x, y, r);
  }

  /**
   * Restarts the simulation, given a set of nodes.
   * @param {Array} nodes Array of nodes.
   */
  restart(nodes) {
    this.simulation.on('tick', this.ticked).on('end', this.ended);
    this.simulation.nodes(nodes);
    this.simulation.alpha(1).restart();
  }
}

export default GroupByLayout;
