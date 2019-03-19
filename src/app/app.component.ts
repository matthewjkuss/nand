import { Component, OnInit } from '@angular/core';
import { Chip } from './chip';
import { evaluate, bind } from './eval-chip';
import { and_chip, or_chip, not_chip } from './chips';
import { validate } from './test-chip';
import { genCross, makeDrawPath, DrawPath } from './draw-wire';

const testConnect: [number, number][] = [[10, 20], [5, 15], [20, 10]];

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
  paths: DrawPath[] = [
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
      crossDy: {init: -10, cross: [-5,-5]},
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

  // paths = connect(testConnect);

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
    // console.log(this.test1, this.test2, this.test3);
    // console.log(this.test3);
    validate(or_chip);
    // connect(testConnect);

    console.log(this.pos);
  }
}
