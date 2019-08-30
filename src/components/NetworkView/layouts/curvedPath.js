import { interpolateArray } from 'd3';

const X = 0;
const Y = 1;

/**
 * Calculates the length of a line given two points
 *
 * @param {Number[]} a The first point [x, y]
 * @param {Number[]} b The second point [x, y]
 *
 * @return {Number} The length of the line
 */
export function lineLength(a, b) {
  return Math.sqrt(Math.pow(a[X] - b[X], 2) + Math.pow(a[Y] - b[Y], 2));
}

/**
 * Finds a point on a line (as defined by two points) at a given length
 *
 * @param {Number[]} startPoint The first point [x, y]
 * @param {Number[]} endPoint The second point [x, y]
 * @param {Number} length How far along the line the point will be
 *
 * @return {Number[]} The point on the line at the specified length
 */
export function pointOnLine(start, end, length) {
  const deltaLength = lineLength(start, end);

  return [
    start[X] + (end[X] - start[X]) * (length / deltaLength),
    start[Y] + (end[Y] - start[Y]) * (length / deltaLength),
  ];
}

/**
 * Rotate a point ([x, y]) around an origin ([x, y]) by theta radians
 *
 * @param {Number[]} point [x, y]
 * @param {Number} thetaRadians How many radians to rotate the point around origin
 * @param {Number[]} [origin] [x, y] (defaults to [0, 0])
 *
 * @return {Number[]} The rotated point [x, y]
 */
export function rotate(point, thetaRadians, origin = [0, 0]) {
  const rotatedEndX =
    origin[X] +
    ((point[X] - origin[X]) * Math.cos(thetaRadians) -
      (point[Y] - origin[Y]) * Math.sin(thetaRadians));
  const rotatedEndY =
    origin[Y] +
    ((point[X] - origin[X]) * Math.sin(thetaRadians) +
      (point[Y] - origin[Y]) * Math.cos(thetaRadians));

  return [rotatedEndX, rotatedEndY];
}

/**
 * Create a curved path `d` attribute between two given points
 *
 * @param {Number[]} start the start point [x, y]
 * @param {Number[]} end the end point [x, y]
 * @param {Number} amount=0.5 How flat/peaked the line is. Corresponds to dragging
 *   the control points at an angle towards the middle of the line (1) or
 *   to the end points (0)
 * @param {Boolean} rotationDir=false Which direction to curve
 *   (true = clockwise, false = counter-clockwise)
 *
 * @return {String} The `d` attribute for a curved line between two points
 */
export default function curvedPath(start, end, amount = 0.5, rotationDir) {
  const theta = rotationDir ? -Math.PI / 4 : Math.PI / 4;

  // rotate the end point 45 degrees around the start point
  const rotatedPoint = rotate(end, theta, start);

  // scale this point to be in the middle of the line
  const midRotatedPoint = pointOnLine(
    start,
    rotatedPoint,
    (Math.sqrt(2) / 2) * lineLength(start, end),
  );

  // adjust the control points to be between this rotated midpoint and the end points
  const startControlPoint = interpolateArray(start, midRotatedPoint)(amount);
  const endControlPoint = interpolateArray(end, midRotatedPoint)(amount);

  return `M${start[X]},${start[Y]}
          C${startControlPoint[X]},${startControlPoint[Y]}
           ${endControlPoint[X]},${endControlPoint[Y]}
           ${end[X]},${end[Y]}`;
}
