import * as d3 from 'd3';

import NetworkLayout from './NetworkLayout';

import { networkDisplay } from './constants';

/**
 * Setup simulation to run in force layout mode.
 * @param {Object} props Input props
 */
function setupForceSimulation(props) {
  const { width, height, rScale, sizeBy } = props;

  let { chargeMultiplier } = props;

  if (!chargeMultiplier) {
    chargeMultiplier = 1.0 / networkDisplay.nodeSize;
  }

  const simulation = d3
    .forceSimulation()
    .alphaMin(0.04)
    .velocityDecay(0.2);

  simulation.stop();

  // now edges and how they impact
  // the layout of the network is all
  // handled in a link force
  const linkForce = d3
    .forceLink()
    .distance(100 * chargeMultiplier)
    .id(d => d.id);

  // add the link force to the simulation
  simulation.force('links', linkForce);
  // setup a center force to keep nodes
  // in middle of the div
  simulation.force('center', d3.forceCenter(width / 2, height / 2 - 160));

  // setup many body force to have nodes repel one another
  // increasing the chargePower here to make nodes stand about
  // TODO: need to figure out original vs current value
  // TODO: is there a more appropriate place for this function?
  function charge(d) {
    const c = -Math.pow(rScale(d[sizeBy]), 2.0) * (4.0 * chargeMultiplier);
    return c;
  }

  const chargeDistance = sizeBy === 'none' ? Infinity : Infinity;

  simulation.force(
    'charge',
    d3
      .forceManyBody()
      .strength(charge)
      .distanceMax(chargeDistance),
  );

  // put the nodes with no edges somewhere
  // TODO: clean up.
  const xForce = d3
    .forceX()
    .strength(0.02)
    .x(d => (d.totalEdges > 0 ? null : width / 2));

  const yForce = d3
    .forceY()
    .strength(0.02)
    .y(d => (d.totalEdges > 0 ? null : height / 2));

  // add these forces to the simulation
  simulation.force('x', xForce);
  simulation.force('y', yForce);

  return simulation;
}

/**
 * Force Network Layout.
 */
class ForceLayout extends NetworkLayout {
  /**
   * Constructor
   */
  constructor(props) {
    super(props);
    this.simulation = setupForceSimulation(props);
  }

  /**
   * Restarts the simulation, given a set of nodes and edges.
   */
  restart(nodes, edges) {
    this.simulation.on('tick', this.ticked).on('end', this.ended);
    this.simulation.nodes(nodes);
    this.simulation.force('links').links(edges);
    this.simulation.alpha(1).restart();
  }

  /**
   *
   */
  find(x, y, r) {
    return this.simulation.find(x, y, r);
  }
}

export default ForceLayout;
