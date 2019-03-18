interface Shift {
  preDx: number;
  dy: {init: number, rest: number[]};
  postDx: number;
}

interface Path {
  initialY: number;
  expansion: Shift;
  cross: Shift;
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

function expandWire(point: Wire, midpoint: number, dest: number[]): [Wire, number] {
  if (point[0] <= dest[0] - spacing) {
    const newPoint = point[0];
    dest.push(newPoint);
    dest.sort(function(a, b) { return a - b; });
    return [point, newPoint];
  }
  for (let i = 0; i < dest.length - 1; i++) {
    if (dest[i] < midpoint || dest[i] < point[0]) {
      continue;
    }
    if (dest[i + 1] - dest[i] >= 2*spacing) {
      const newPoint = (dest[i + 1] + dest[i]) / 2;
      dest.push(newPoint);
      dest.sort(function(a, b) { return a - b; });
      return [point, newPoint];
    }
  }
  const newPoint = dest.slice(-1)[0] + spacing;
  dest.push(newPoint);
  dest.sort(function(a, b) { return a - b; });
  return [point, newPoint];
}

function expand(pairs: Wire[]): { initial: number, expand: Shift, wire: Wire }[] {
  const reservedPositions: number[] = pairs.map(x => x.dest);
  reservedPositions.sort(function(a, b) { return a - b; });

  const expedPts = pairs.map(x => expandWire(x, 0, reservedPositions));

  expedPts.sort(function(a, b) { return b[0].dest - a[0].dest; });

  let depth = 5;

  let partial = expedPts.map(x => {
    depth += 5;
    return { initial: 0, wire: {source: x[1], dest: x[0][1]}, expand: {
      preDx: depth,
      dy: {init: x[1] - x[0][0], rest: []},//[x[1] - x[0][0], []],
      postDx: expedPts.length * 5 - depth + 5,
      // crossDy: [x[0][1] - x[1], []],
      // postDx: 10
    },
    cross: {
      preDx: depth,
      dy: {init: x[1] - x[0][0], rest: []},//[x[1] - x[0][0], []],
      postDx: expedPts.length * 5 - depth + 5}};
  } );

  depth = 5;

  // let next = partial.map(x => {
  //   if (x[0] < x[1]) {
  //     return { preDx: depth, crossDy: x[1] - x[0], }
  //   }

  // });

  console.log(expedPts, partial);

  return partial;
}

// function cross(expanedWires: { initial: number, expand: Shift, wire: Wire }[]): Path {

// }



const crossover = 10;

export function makeDrawPath(path: Path): DrawPath {
  let yShift: number = path.cross.dy.init;
  const y = path.cross.dy.rest.map(x => {
    yShift += x + (x > 0 ? crossover : -crossover);
    return line(
      300 + path.expansion.preDx + path.cross.preDx,
      200 + path.initialY + path.expansion.dy[0] + yShift - x,
      300 + path.expansion.preDx + path.cross.preDx,
      200 + path.initialY + path.expansion.dy[0] + yShift
    );
  });
  return {
    preExpDx: line(
      300,
      200 + path.initialY,
      300 + path.expansion.preDx,
      200 + path.initialY
    ),
    expDy: line(
      300 + path.expansion.preDx,
      200 + path.initialY,
      300 + path.expansion.preDx,
      200 + path.initialY + path.expansion.dy[0]
    ),
    preCrossDx: line(
      300 + path.expansion.preDx,
      200 + path.initialY + path.expansion.dy[0],
      300 + path.expansion.preDx + path.cross.preDx,
      200 + path.initialY + path.expansion.dy[0]
    ),
    crossDy: [line(
      300 + path.expansion.preDx + path.cross.preDx,
      200 + path.initialY + path.expansion.dy[0],
      300 + path.expansion.preDx + path.cross.preDx,
      200 + path.initialY + path.expansion.dy[0] + path.cross.dy[0]
    ), y],
    postDx: line(
      300 + path.expansion.preDx + path.cross.preDx,
      200 + path.initialY + path.expansion.dy[0] + yShift,
      300 + path.expansion.preDx + path.cross.preDx + path.cross.postDx,
      200 + path.initialY + path.expansion.dy[0] + yShift
    ),
  };
}

export function genCross(x: number, y: number, dy: number): string {
  return 'M ' + x + ' ' + (dy > y ? y - crossover : y + crossover) + ' A 1 1 0 0 ' + (dy < y ? 1 : 0) + ' ' + x + ' ' + y;
}
