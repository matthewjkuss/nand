/** Represents a path. */
export interface Path {
  pathGoal: PathGoal;
  pathInstance: PathInstance;
}

/** Defines a wire path between two columns of logic chips. */
interface PathInstance {
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

/**
 * Represents the start and end points of a given wire. Note that both source
 * and dest should be unique for each collection of connections between logic
 * gate columns.
 */
export interface PathGoal {
  source: number;
  dest: number;
}

/** Represents a line from (x1, y1) to (x2, y2). */
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

/** Spacing to leave around wires in expansion stage. */
const spacing = 15;

/** Size of crossover in pixels. */
const crossover = 10;

function emptyPathInstance(): PathInstance {
  return {
    initY: 0,
    preExpDx: 0,
    expDy: 0,
    joinDx: 0,
    crossDy: {init: 0, cross: []},
    postDx: 0,
  };
}

export function connect(pairs: PathGoal[]): PathInstance[] {
  const input: Path[] = pairs.map(x => ({pathGoal: x, pathInstance: emptyPathInstance()}));
  return cross(expand(input));
}

function expandWire(point: PathGoal, midpoint: number, reservedPos: number[]): [PathGoal, number] {
  // If wire is before any reserved spaces, go here
  // if (point[0] <= reservedPos[0] - spacing) {

  //   const newPoint = point[0];
  //   reservedPos.push(newPoint);
  //   reservedPos.sort(function(a, b) { return a - b; });
  //   return [point, newPoint];
  // }
  // console.log(midpoint, point.source)
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
        // console.log('middle going down')
        return [point, newPoint];
      }
    }
    const newPoint = reservedPos.slice(-1)[0] + spacing;
    // console.log(point, reservedPos, newPoint)
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
        // console.log("middle going up")
        return [point, newPoint];
      }
    }
    const newPoint = reservedPos[0] - spacing;
    // console.log(point, reservedPos, newPoint)
    reservedPos.push(newPoint);
    reservedPos.sort(function(a, b) { return a - b; });
    return [point, newPoint];
  }
  // Else, try to fit it in the middle

  // Still nothing? Put it at the end.
  // console.log("blam")
}

// function abs(a: number) {
//   return a >= 0 ? a : -a;
// }

export function expand(paths: Path[]): Path[] {
  // Generate initial reserved positions list by taking all destinations and sort
  const reservedPositions: number[] = paths.map(x => x.pathGoal.dest);
  reservedPositions.sort(function(a, b) { return a - b; });

  // Sort pairs based on source position
  // paths.sort(function(a, b) { return a.source - b.source; });

  const midpoint = Math.abs(
    paths[paths.length - 1].pathGoal.source - paths[0].pathGoal.source
  ) / 2;

  // Generate a list of (wire, expanded y pos) pairs and sort
  // const expedPts = paths.map(x => expandWire(x.pathGoal, midpoint, reservedPositions));
  const expedPts: [PathGoal, number][] = orderedMap(
    paths,
    path => path.pathGoal.source,
    path => expandWire(path.pathGoal, midpoint, reservedPositions)
  );
  // expedPts.sort(function(a, b) { return b[0].source - a[0].source; });

  // Output Expanded partial path
  let depth = 5;
  return expedPts.map(x => {
    depth += 5;
    return {
      pathInstance: {
        initY: x[0].source,
        preExpDx: depth,
        expDy: x[1] - x[0].source,
        joinDx: expedPts.length * 5 - depth + 5,
        crossDy: {init: 0, cross: []},
        postDx: 0,
      },
      pathGoal: {
        source: x[1],
        dest: x[0].dest
      }
    };
  });
}

function pos(wire: Path) {
  return wire.pathInstance.initY
    + wire.pathInstance.expDy
    + wire.pathInstance.crossDy.init
    + wire.pathInstance.crossDy.cross.reduce((acc, cur) =>
      acc + cur + (cur > 0 ? 1 : -1) * crossover, 0);
}

function cross(paths: Path[]): PathInstance[] {
  let depth = 5;

  function upThenDownOrder(x: Path): number {
    const positiveOrder = Math.exp(x.pathGoal.dest);
    return (pos(x) > x.pathGoal.dest ? -1 : 1) * positiveOrder;
  }

  orderedMap(paths, upThenDownOrder, crosser => {
    depth += 15;
    let init = 0;
    let inited = false;
    const cross = [];
    let dy = pos(crosser);

    const dir = (pos(crosser) > crosser.pathGoal.dest) ? -1 : 1;

    orderedMap(paths, x => dir * pos(x), crossee => {
      dy = pos(crosser);
      const hasNotCrossed: boolean = dir * dy < dir * pos(crossee);
      const needsToCross: boolean = dir * pos(crossee) < dir * crosser.pathGoal.dest;

      if (hasNotCrossed && needsToCross) {
        if (inited) {
          crosser.pathInstance.crossDy.cross.push(pos(crossee) - dir * crossover - dir * crossover/2 - dy);
          // dy = pos(crossee) - dir * crossover/2;
        } else {
          crosser.pathInstance.crossDy.init = pos(crossee) - dir * crossover/2 - dy;
          // dy = pos(crossee) - dir * crossover/2;

          inited = true;
        }
      }
      console.log('At:', dy, 'Goal:', crosser.pathGoal.dest, inited);
    });
    dy = pos(crosser);
    console.log('Post', init);
    if (inited) {
      crosser.pathInstance.crossDy.cross.push(crosser.pathGoal.dest - dy - dir * crossover);
    } else {
      crosser.pathInstance.crossDy.init = crosser.pathGoal.dest - dy;
    }
    crosser.pathInstance.joinDx += depth;
    crosser.pathInstance.postDx += 70-depth;
    // return path;
    // return {
    //   initY: crosser.pathInstance.initY,
    //   preExpDx: crosser.pathInstance.preExpDx,
    //   expDy: crosser.pathInstance.expDy,
    //   joinDx: crosser.pathInstance.joinDx + depth,
    //   crossDy: {init: init, cross: cross},
    //   postDx: 30,
    // };
  });
  return paths.map(x => x.pathInstance);
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

export function makeDrawPath(path: PathInstance): DrawPath {
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
