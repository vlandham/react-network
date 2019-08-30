class NetworkLayout {
  /**
   * constructor
   * @param {Object} props Props from parent component.
   */
  constructor(/* props */) {
    this.ticked = this.ticked.bind(this);
    this.ended = this.ended.bind(this);

    this.tickedCallback = () => {};
    this.endedCallback = () => {};
  }

  /**
   * Connect ticked callback
   * @param {Function} callback Call on each tick of the layout
   */
  onTicked(callback) {
    this.tickedCallback = callback;
  }

  /**
   * Connect ended callback
   * @param {Function} callback Call on end
   */
  onEnded(callback) {
    this.endedCallback = callback;
  }

  /**
   * Update layout
   * @param {Object} props Props from parent component.
   * @param {Object} svgG SVG group to draw into
   */
  render(/* props, svgG */) {
    return null;
  }

  /**
   * Restart layout
   * @param {Array} nodes Nodes of Graph
   * @param {Array} edges Edges of Graph
   */
  restart(/* nodes, edges */) {}

  /**
   * Clean up Layout on change
   * @param {Object} svgG SVG group to draw into
   */
  exit(/* svgG */) {}

  /**
   *
   */
  find(/* x, y*/) {
    return undefined;
  }

  /**
   * Simulation ticked callback
   */
  ticked() {
    this.tickedCallback();
  }

  /**
   * Simulation ended callback
   */
  ended() {
    this.endedCallback();
  }

  /**
   * Method to 'warm up' simulation
   */
  warm() {
    if (this.simulation) {
      this.simulation.alphaTarget(0.3).restart();
    }
  }

  /**
   * Method to 'cool down' simulation
   */
  cool() {
    if (this.simulation) {
      this.simulation.alphaTarget(0);
    }
  }
}

export default NetworkLayout;
