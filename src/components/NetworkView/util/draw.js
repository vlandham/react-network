
import curvedPath from '../../../util/curvedPath';

// constants
const arrowSize = 10;
const arrowPadding = 1;

/**
* Provides an array of points to draw an arrow given source and target
*
* @param {Object} source Source node
* @param {Object} target Target node
* @param {Object} targetSize Radius of target in pixels
*/
function endArrow(source, target, targetSize, edgeSize) {
  let toX = target.x;
  let toY = target.y;

  const angle = Math.atan2(target.y - source.y, target.x - source.x);
  const angleOffset = (16 / 180) * Math.PI;

  // adjust the end to be outside the target node
  // use edgesize to move arrowhead away from target
  toX = target.x - ((targetSize + arrowPadding + (edgeSize * 1.5)) * Math.cos(angle));
  toY = target.y - ((targetSize + arrowPadding + (edgeSize * 1.5)) * Math.sin(angle));

  return [[toX, toY],
    [toX - (Math.cos(angle + angleOffset) * (arrowSize - (edgeSize / 2))),
      toY - (Math.sin(angle + angleOffset) * (arrowSize - (edgeSize / 2)))],
    [toX - (Math.cos(angle - angleOffset) * (arrowSize - (edgeSize / 2))),
      toY - (Math.sin(angle - angleOffset) * (arrowSize - (edgeSize / 2)))],
    [toX, toY]];
}

/**
* Draw a line from source to target
* @param {Array} source 2D array
* @param {Array} target 2D array
*/
function lineTo(source, target) {
  return `M${source[0]},${source[1]} L${target[0]},${target[1]}`;
}

/**
* Draw an edge Arrow for a edge
*
* @param {Object} d Edge
* @param {Object} sourceSize Radius of source in pixels
* @param {Object} targetSize Radius of target in pixels
* @param {Object} edgeSize width of edge in pixels
*/
export function edgeArrow(edge, sourceSize, targetSize, edgeSize) {
  // diff between source and target
  const dx = edge.target.x - edge.source.x;
  const dy = edge.target.y - edge.source.y;

  // angle between two vectors
  const angle = Math.atan2(dy, dx);

  // for unexpanded arcs, use offset of 0.5
  let offset = 0.5;
  let rotationDir = false;

  if (edge.source === edge.target) {
    offset = 1.0;
  }

  if (edge.edgeIndex) {
    // tweak for expanded arcs
    rotationDir = (edge.edgeIndex % 2 === 0);
    offset = Math.min(0.05 + (0.1 * (edge.edgeIndex / 2)), 1.0);
  }

  const fromX = edge.source.x + ((sourceSize) * Math.cos(angle));
  const fromY = edge.source.y + ((sourceSize) * Math.sin(angle));

  let toPad = (targetSize + arrowPadding + arrowSize + edgeSize);

  // if edge is a dbEdge, then we won't be drawing arrow
  if (edge.edgeType === 'dbEdge') {
    toPad = targetSize + edgeSize;
  }

  // make the new end of the edge be the edge of the arrow
  const toX = edge.target.x - (toPad * Math.cos(angle));
  const toY = edge.target.y - (toPad * Math.sin(angle));

  let path = '';

  if (edge.edgeIndex || edge.edgeDisplay === 'curve') {
    path = curvedPath([fromX, fromY], [toX, toY], offset, rotationDir);
  } else {
    path = lineTo([fromX, fromY], [toX, toY]);
  }

  if (edge.edgeType !== 'dbEdge') {
    // Calculate the points for the arrow and convert them to a path string
    const arrowPath = endArrow(edge.source, edge.target, targetSize, edgeSize)
      .map((a) => `L${a[0]},${a[1]}`).join('');
    // Replace first L with an M, and close path with Z, to generate valid SVG path
    // string; then append arrowPath to existing edge path
    path = `${path} M${arrowPath.substr(1)}Z`;
  }
  return path;
}

export function edgeArrowCanvas(ctx, d, sourceSize, targetSize) {
  // diff between source and target
  const dx = d.target.x - d.source.x;
  const dy = d.target.y - d.source.y;

  // angle between two vectors
  const angle = Math.atan2(dy, dx);

  // distance between source and destination
  const dr = Math.sqrt((dx * dx) + (dy * dy));


  // make the new end of the edge be the edge of the arrow
  const toX = d.target.x - ((targetSize + arrowPadding + arrowSize) * Math.cos(angle));
  const toY = d.target.y - ((targetSize + arrowPadding + arrowSize) * Math.sin(angle));

  const midX = d.source.x + ((Math.abs(dx) / 2) * Math.cos(angle));
  const midY = d.source.y + ((Math.abs(dy) / 2) * Math.sin(angle));

  ctx.beginPath();
  ctx.moveTo(d.source.x, d.source.y);
  if (dr > 50) {
    ctx.arcTo(midX, midY, toX, toY, dr);
  }
  ctx.lineTo(toX, toY);
  const arrowData = endArrow(d.source, d.target, targetSize, arrowSize);
  ctx.moveTo(arrowData[0][0], arrowData[0][1]);
  arrowData.forEach((a) => ctx.lineTo(a[0], a[1]));
}
