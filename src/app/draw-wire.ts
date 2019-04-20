import { mapToExpression } from "@angular/compiler/src/render3/view/util";

/** Defines a wire path between two columns of logic chips. */
interface Path {
  initY: number;
  //
  preExpDx: number;
  expDy: number;
  //
  joinDx: number;
  /** The crossing component. */
  crossDy: {init: number; cross: number[]};
  postDx: number;
}

interface Expanded {
  initY: number;
  preExpDx: number;
  expDy: number;
  postExpDx: number;
  wire: Wire;
}

/** Represents the start and end points of a given wire. Note that both source
    and dest should be unique for each collection of connections between logic
    gate columns. */
export interface Wire {
  source: number;
  dest: number;
}

interface Line {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

/** Represents the wire path as a series of lines, ready to be rendered. */
export interface DrawPath {
  preExpDx: Line;
  expDy: Line;
  preCrossDx: Line;
  crossDy: [Line, Line[]];
  postDx: Line;
}

/** Constructs a Line object from the four coordinates of two points. */
function line(x1: number, y1: number, x2: number, y2: number): Line {
  return {
    x1: x1,
    x2: x2,
    y1: y1,
    y2: y2,
  };
}

const spacing = 15;
const crossover = 10;

function expandWire(point: Wire, midpoint: number, reservedPos: number[]): [Wire, number] {
  // If wire is before any reserved spaces, go here
  // if (point[0] <= reservedPos[0] - spacing) {

  //   const newPoint = point[0];
  //   reservedPos.push(newPoint);
  //   reservedPos.sort(function(a, b) { return a - b; });
  //   return [point, newPoint];
  // }
  console.log(midpoint, point.source)
  if (point.source === point.dest) {
    return [point, point.source];
  }
  if (point.source > midpoint) {
    for (let i = 0; i < reservedPos.length - 1; i++) {
      if (reservedPos[i] < midpoint || reservedPos[i] < point[0]) {
        continue;
      }
      if (reservedPos[i + 1] - reservedPos[i] >= 2 * spacing) {
        const newPoint = (reservedPos[i + 1] + reservedPos[i]) / 2;
        reservedPos.push(newPoint);
        reservedPos.sort(function(a, b) { return a - b; });
        console.log("middle going down")
        return [point, newPoint];
      }
    }
    const newPoint = reservedPos.slice(-1)[0] + spacing;
    console.log(point, reservedPos, newPoint)
    reservedPos.push(newPoint);
    reservedPos.sort(function(a, b) { return a - b; });
    return [point, newPoint];
  } else {
    for (let i = reservedPos.length - 1; i > 0 ; i--) {
      if (reservedPos[i] > midpoint || reservedPos[i] > point[0]) {
        continue;
      }
      if (reservedPos[i] - reservedPos[i-1] >= 2 * spacing) {
        const newPoint = (reservedPos[i] - reservedPos[i-1]) / 2;
        reservedPos.push(newPoint);
        reservedPos.sort(function(a, b) { return a - b; });
        console.log("middle going up")
        return [point, newPoint];
      }
    }
    const newPoint = reservedPos[0] - spacing;
    console.log(point, reservedPos, newPoint)
    reservedPos.push(newPoint);
    reservedPos.sort(function(a, b) { return a - b; });
    return [point, newPoint];
  }
  // Else, try to fit it in the middle

  // Still nothing? Put it at the end.
  // console.log("blam")
}

function abs(a: number) {
  return a >= 0 ? a : -a;
}

export function expand(pairs: Wire[]): Expanded[] {
  // Generate initial reserved positions list by taking all destinations and sort
  const reservedPositions: number[] = pairs.map(x => x.dest);
  reservedPositions.sort(function(a, b) { return a - b; });

  // Sort pairs based on source position
  pairs.sort(function(a, b) { return a.source - b.source; });

  const midpoint = abs(pairs[pairs.length-1].source - pairs[0].source)/2;

  // Generate a list of (wire, expanded y pos) pairs and sort
  const expedPts = pairs.map(x => expandWire(x, midpoint, reservedPositions));
  expedPts.sort(function(a, b) { return b[0].source - a[0].source; });

  // Output Expanded partial path
  let depth = 5;
  return expedPts.map(x => {
    depth += 5;
    return {
      initY: x[0].source,
      preExpDx: depth,
      expDy: x[1] - x[0].source,
      postExpDx: expedPts.length * 5 - depth + 5,
      wire: {source: x[1], dest: x[0].dest}
    };
  });
}

function pos(wire: any) {
  return wire.initY + wire.expDy;
}

function cross(expandedWires: Expanded[]): Path[] {
  let depth = 5;
  return orderedMap(expandedWires, x => (pos(x.wire) > x.wire.dest ? -Math.exp(x.wire.dest) : Math.exp(x.wire.dest)), wire => {
    depth += 15;
    let init = 0;
    let inited = false;
    const cross = [];
    let dy = pos(wire);

    const dir = (pos(wire) > wire.wire.dest) ? -1 : 1;

    orderedMap(expandedWires, x => dir * pos(x), otherWire => {
      const hasNotCrossed: boolean = dir * dy < dir * pos(otherWire);
      const needsToCross: boolean = dir * pos(otherWire) < dir * wire.wire.dest;


      if (hasNotCrossed && needsToCross) {
        if (inited) {
          cross.push(pos(otherWire) - dir * crossover - dir * crossover/2 - dy);
          dy = pos(otherWire) - dir * crossover/2;
        } else {
          init = pos(otherWire) - dir * crossover/2 - dy;
          dy = pos(otherWire) - dir * crossover/2;

          inited = true;
        }
      }
      console.log('At:', dy, 'Goal:', wire.wire.dest, inited);
    });
    console.log('Post', init);
    if (inited) {
      cross.push(wire.wire.dest - dy - dir * crossover);
    } else {
      init = wire.wire.dest - dy;
    }
    return {
      initY: wire.initY,
      preExpDx: wire.preExpDx,
      expDy: wire.expDy,
      joinDx: wire.postExpDx + depth,
      crossDy: {init: init, cross: cross},
      postDx: 30,
    };
  });
}

export function connect(pairs: Wire[]): Path[] {
  return cross(expand(pairs));
}

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

/** Map over a list in the order specified by an array of indices. */
export function idxMap<A, B>(list: A[], indices: number[], f: (item: A, idx?: number) => B): B[] {
  return indices.map((i, idx) => f(list[i], idx));
}

/** Generate a sorted list on indices, for use with idxMap. */
export function genSortOrder<A>(list: A[], order: (item: A) => number): number[] {
  return Array.from(Array(list.length).keys()).sort((a, b) => order(list[a]) - order(list[b]));
}

/** Maps over a list using the order from sort function. */
export function orderedMap<A, B>(list: A[], order: (item: A) => number, f: (item: A, idx?: number) => B): B[] {
  return idxMap(list, genSortOrder(list, order), f);
}
