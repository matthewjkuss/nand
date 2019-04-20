import { Component, OnInit } from '@angular/core';
import { Chip } from './chip';
import { evaluate, bind } from './eval-chip';
import { and_chip, or_chip, not_chip } from './chips';
import { validate } from './test-chip';
import { genCross, makeDrawPath, DrawPath, expand, Wire, connect, idxMap, genSortOrder, orderedMap } from './draw-wire';

const testConnect: Wire[] = [[0, 60], [30, 30], [60, 0]].map(x => {
  return { source: x[0], dest: x[1] };
});
// const testConnect: Wire[] = [[0, 0], [30, 20], [50, -10]].map(x => {
//   return { source: x[0], dest: x[1] };
// });

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'nand';
  a = false;
  b = false;
  shift = 50;
  and_chip = and_chip;
  or_chip = or_chip;
  not_chip = not_chip;

  genCross = genCross;

  chip = and_chip;

  // initialY: number;
  // preExpDx: number;
  // expDy: number;
  // preCrossDx: number;
  // crossDy: [number, number[]];
  // postDx: number;
  pathss: DrawPath[] = [
    // {
    //   initialY: -5,
    //   expansion: {
    //     preDx: 5,
    //     dy: {init: 5, rest: []},
    //     postDx: 0,
    //   },
    //   cross: {
    //     preDx: 15,
    //     dy: {init: 5, rest: [3,3]},
    //     postDx: 20
    //   }
    // },
    {
      initY: 0,
      preExpDx: 10,
      expDy: 10,
      joinDx: 10,
      crossDy: {init: -10, cross: [-5, -5]},
      postDx: 5
    },
    // {
    //   initY: 50,
    //   preExpDx: 0,
    //   expDy: 10,
    //   joinDx: 30,
    //   crossDy: {init: -10, cross: [-5, -5]},
    //   postDx: 20
    // }
  ].map(makeDrawPath);

  paths = connect(testConnect).map(makeDrawPath);

  // paths(wires: [number, number][]): Path[] {
  //   return [[10, this.shift]];
  // }

  pos() {
    return 'translate(' + 3 + this.shift + ' 30) scale(0.5 0.5)';
  }

  // [[0],[1]]
  // [[0,0],[0,1],[1,0],[1,1]]
  inputs(i: number): number[][] {
    if (i === 1) {
      return [[0], [1]];
    } else {
      return [].concat.apply(
        [],
        this.inputs(i - 1).map(x => [x.concat([0]), x.concat([1])])
      );
    }
  }

  // test1 = evaluate(not, [bound('a', true)]);
  // test2 = evaluate(not, [bound('a', false)]);
  // test(chip: Chip) {
  //   return evaluate(chip, [bind('a', this.a), bind('b', this.b)])[0].value;
  // }

  ngOnInit() {
    const mylist = ['Andy', 'Bob', 'Carl', 'Derek'];
    const lastletter = genSortOrder(mylist, a => a.substr(-1).charCodeAt(0));
    const secondletter = genSortOrder(mylist, a => a.charCodeAt(1));
    // console.log(idxMap(mylist, lastletter, x => {
    //   return [x + ' is cool, but '].concat(idxMap(mylist, secondletter, x => x + ' is great!'));
    // }));
    // console.log(orderedMap(mylist, x => x.charCodeAt(1), (x, i) => (i === 0 ? 'Hi ' : 'Also, hi ') + x + '!'));
    // console.log(idxMap(mylist, secondletter, x => x + ' is great!'));
    // console.log(this.test1, this.test2, this.test3);
    // console.log(this.test3);
    // validate(or_chip);
    // connect(testConnect);
    // console.log("Test expand", expand(testConnect));

    console.log(this.pos);
  }
}
