import * as d3 from 'd3';

/**
 * Constants used for network display
 */
export const networkDisplay = {
  nodeSelectColor: 'tomato',
  nodeHighlightColor: 'tomato',
  nodeSizeRange: [4, 50],
  edgeHighlightColor: 'tomato',
  edgeColor: '#ddd',
  edgeColorRange: ['#ddd', '#888'],
  edgeWidthRange: [3, 8],
  edgeExpandColor: '#555',
  nodeSize: 8,
  legendDimColor: '#dddddd',
  edgeDirColors: [
    { id: 'Both', color: '#66BB6A' },
    { id: 'Out', color: '#BB3B38' },
    { id: 'In', color: '#42A5F5' },
    { id: 'None', color: '#BDBDBD' },
  ],
  nodeShapes: {
    Both: d3.symbolSquare,
    In: d3.symbolCircle,
    Out: d3.symbolDiamond,
    None: d3.symbolCircle,
  },
};
