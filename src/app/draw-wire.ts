interface Path {
  initY: number;
  //
  preExpDx: number;
  expDy: number;
  //
  joinDx: number;
  //
  crossDy: {init: number, cross: number[]};
  postDx: number;
}

interface Expanded {
  initY: number;
  preExpDx: number;
  expDy: number;
  postExpDx: number;
  wire: Wire;
}

interface Wire {
  source: number;
  dest: number;
}

interface Line {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export interface DrawPath {
  preExpDx: Line;
  expDy: Line;
  preCrossDx: Line;
  crossDy: [Line, Line[]];
  postDx: Line;
}

function line(x1: number, y1: number, x2: number, y2: number): Line {
  return {
    x1: x1,
    x2: x2,
    y1: y1,
    y2: y2,
  };
}

const spacing = 5;

function expandWire(point: Wire, midpoint: number, reservedPos: number[]): [Wire, number] {
  // If wire is before any reserved spaces, go here
  if (point[0] <= reservedPos[0] - spacing) {
    const newPoint = point[0];
    reservedPos.push(newPoint);
    reservedPos.sort(function(a, b) { return a - b; });
    return [point, newPoint];
  }
  // Else, try to fit it in the middle
  for (let i = 0; i < reservedPos.length - 1; i++) {
    if (reservedPos[i] < midpoint || reservedPos[i] < point[0]) {
      continue;
    }
    if (reservedPos[i + 1] - reservedPos[i] >= 2 * spacing) {
      const newPoint = (reservedPos[i + 1] + reservedPos[i]) / 2;
      reservedPos.push(newPoint);
      reservedPos.sort(function(a, b) { return a - b; });
      return [point, newPoint];
    }
  }
  // Still nothing? Put it at the end.
  const newPoint = reservedPos.slice(-1)[0] + spacing;
  reservedPos.push(newPoint);
  reservedPos.sort(function(a, b) { return a - b; });
  return [point, newPoint];
}

function expand(pairs: Wire[]): Expanded[] {
  // Generate initial reserved positions list by taking all destinations and sort
  const reservedPositions: number[] = pairs.map(x => x.dest);
  reservedPositions.sort(function(a, b) { return a - b; });

  // Generate a list of (wire, expanded y pos) pairs and sort
  const expedPts = pairs.map(x => expandWire(x, 0, reservedPositions));
  expedPts.sort(function(a, b) { return b[0].dest - a[0].dest; });

  // Output Expanded partial path
  let depth = 5;
  return expedPts.map(x => {
    depth += 5;
    return {
      initY: x[0][0],
      preExpDx: depth,
      expDy: x[1] - x[0][0],
      postExpDx: expedPts.length * 5 - depth + 5,
      wire: {source: x[1], dest: x[0][1]}
    };
  });
}

// function cross(expanedWires: { initial: number, expand: Shift, wire: Wire }[]): Path {

// }



const crossover = 10;

export function makeDrawPath(path: Path): DrawPath {
  let yShift: number = path.crossDy.init;
  const y = path.crossDy.cross.map(x => {
    yShift += x + (x > 0 ? crossover : -crossover);
    return line(
      300 + path.preExpDx + path.joinDx,
      200 + path.initY + path.expDy + yShift - x,
      300 + path.preExpDx + path.joinDx,
      200 + path.initY + path.expDy + yShift
    );
  });
  return {
    preExpDx: line(
      300,
      200 + path.initY,
      300 + path.preExpDx,
      200 + path.initY
    ),
    expDy: line(
      300 + path.preExpDx,
      200 + path.initY,
      300 + path.preExpDx,
      200 + path.initY + path.expDy
    ),
    preCrossDx: line(
      300 + path.preExpDx,
      200 + path.initY + path.expDy,
      300 + path.preExpDx + path.joinDx,
      200 + path.initY + path.expDy
    ),
    crossDy: [line(
      300 + path.preExpDx + path.joinDx,
      200 + path.initY + path.expDy,
      300 + path.preExpDx + path.joinDx,
      200 + path.initY + path.expDy + path.crossDy.init
    ), y],
    postDx: line(
      300 + path.preExpDx + path.joinDx,
      200 + path.initY + path.expDy + yShift,
      300 + path.preExpDx + path.joinDx + path.postDx,
      200 + path.initY + path.expDy + yShift
    ),
  };
}

export function genCross(x: number, y: number, dy: number): string {
  return 'M ' + x + ' ' + (dy > y ? y - crossover : y + crossover) + ' A 1 1 0 0 ' + (dy < y ? 1 : 0) + ' ' + x + ' ' + y;
}
