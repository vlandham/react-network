import * as d3 from 'd3';
import NetworkLayout from './NetworkLayout';
import { networkDisplay } from './constants';

/**
 * Focus layout, a layout design for the mode where one node is the focus of the
 * visualisation and we are visualizing only connections to that node.
 */
class FocusLayout extends NetworkLayout {
  /**
   * Constructor
   */
  constructor(props) {
    super(props);
    // Find the focus node
    this.setFocusNodeData(props.currentGraph, props.focusNode);
    this.simulation = this.setupForceSimulation(props);
  }

  setFocusNodeData(currentGraph, focusNode) {
    this.focusNode = currentGraph.nodes.find(n => n.id === focusNode);

    // Also make a map of all the focus nodes edges. The keys will be
    // the target nodes id.
    this.focusNodeEdges = {};
    currentGraph.edges.forEach(e => {
      const { source, target } = e;
      if (source === focusNode) {
        if (this.focusNodeEdges[target] === undefined) {
          this.focusNodeEdges[target] = [];
        }
        this.focusNodeEdges[target].push(e);
      } else if (target === focusNode) {
        if (this.focusNodeEdges[source] === undefined) {
          this.focusNodeEdges[source] = [];
        }
        this.focusNodeEdges[source].push(e);
      }
    });
  }

  /**
   *
   */
  setupForceSimulation(props) {
    const { width, height, rScale, sizeBy, chargeMultiplier } = props;

    const simulation = d3
      .forceSimulation()
      .velocityDecay(0.2)
      .alphaMin(0.1);
    simulation.stop();

    // Control edges via link force
    // from https://github.com/d3/d3-force/blob/master/README.md#link_strength
    // default strength is based on in / out nodes.
    const linkForce = d3
      .forceLink()
      .distance(300)
      .id(d => d.id);

    // add the link force to the simulation
    simulation.force('links', linkForce);

    // setup a center force to keep nodes in middle of the div
    simulation.force('center', d3.forceCenter(width / 2, height / 2 - 160));

    // setup many body force to have nodes repel one another
    // increasing the chargePower here to make nodes stand out from each
    // other more.
    function charge(d) {
      if (d.entityType !== 'application') {
        return -Math.pow(networkDisplay.nodeSize, 2.0) * (6.0 * chargeMultiplier);
      }
      return -Math.pow(rScale(d[sizeBy]), 2.0) * (6.0 * chargeMultiplier);
    }

    simulation.force('charge', d3.forceManyBody().strength(charge));

    // const collisionForce = d3.forceCollide(d => 1.5 * rScale(d[sizeBy]));
    // simulation.force('collision', collisionForce);

    // put the nodes with no edges somewhere
    // TODO: Should be able to remove this once we fix expandBy to 1.
    // const xForce = d3.forceX()
    //   .strength(0.02)
    //   .x((d) => (d.totalEdges > 0 ? null : width / 2));
    //
    // const yForce = d3.forceY()
    //   .strength(0.02)
    //   .y((d) => (d.totalEdges > 0 ? null : height / 2));
    //
    // // add these forces to the simulation
    // simulation.force('x', xForce);
    // simulation.force('y', yForce);

    // Create directional forces based on the direction of the
    // edges between a node and the 'focus node'.
    // Nodes with bidirectional edges should be above the node
    // Nodes with incoming edges from the focus node should be at 4 o'clock
    // Nodes with outgoing edges from the focus node should be at 8 o'clock
    //
    const directionalForceStrength = 0.05;
    const nodeDistance = 1000;

    // Note these angles are rotated 360 degrees to what you would expect
    // because of how the SVG coordinate system works compared to regular
    // cartesian coordinates.
    const bothAngle = (3 * Math.PI) / 2;
    const outAngle = Math.PI / 4;
    const inAngle = (3 * Math.PI) / 4;

    const xForce = d3
      .forceX()
      .strength(directionalForceStrength)
      .x(d => {
        // Determine directionality
        const focusEdges = this.focusNodeEdges[d.id];
        if (focusEdges === undefined) {
          return 0;
        }

        if (focusEdges.length === 2) {
          // Bi-directional Node Move this up
          return nodeDistance * Math.cos(bothAngle);
        } else if (focusEdges.length === 1) {
          // Check the direction.
          const edge = focusEdges[0];
          if (edge.source === d.id) {
            // This node feeds into the focus node. pull it to the left and down
            return nodeDistance * Math.cos(inAngle);
          }

          return nodeDistance * Math.cos(outAngle);
        }

        return 0;
      });

    const yForce = d3
      .forceY()
      .strength(directionalForceStrength)
      .y(d => {
        // Determine directionality
        const focusEdges = this.focusNodeEdges[d.id];
        if (focusEdges === undefined) {
          return 0;
        }

        if (focusEdges.length === 2) {
          // Bi-directional Node Move this up
          return nodeDistance * Math.sin(bothAngle);
        } else if (focusEdges.length === 1) {
          const edge = focusEdges[0];
          if (edge.source === d.id) {
            // This node feeds into the focus node. pull it to the left and down
            return nodeDistance * Math.sin(inAngle);
          }
          // This node is fed by the focus node. pull it to the right and down
          return nodeDistance * Math.sin(outAngle);
        }

        return 0;
      });

    simulation.force('x', xForce);
    simulation.force('y', yForce);

    return simulation;
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

export default FocusLayout;
