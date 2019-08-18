import { Component, OnInit } from '@angular/core';
import { Chip, chipFromReg } from './chip';
import { evaluate, bind, evaluate2, State } from './eval-chip';
import { register } from './chips';
import { validate } from './test-chip';
import { genCross, makeDrawPath, DrawPath, expand, PathGoal, connect, idxMap, genSortOrder, orderedMap } from './draw-wire';
import { RegReduce, regReduce, NamedValue, valueFromList } from './reduce-register';
import { Layout, generateLayout } from './layout';
import { MatCheckboxChange } from '@angular/material/checkbox';

// const testConnect: PathGoal[] = [[0, 60], [30, 30], [60, 0]].map(x => {
//   return { source: x[0], dest: x[1] };
// });
// const testConnect: PathGoal[] = [[0, 0], [30, 20], [50, -10]].map(x => {
//   return { source: x[0], dest: x[1] };
// });
const slots = 20;

// const testConnect: PathGoal[] = Array.from(Array(3).keys()).map(x => {
//   return { source: Math.random()*200, dest: 200 * Math.round(Math.random() * slots) / slots};
// });

const testConnect = Array.from(Array(6).keys())
  .sort((a,b) => Math.random()-0.5)
  .map((x, idx) => ({source: idx*15, dest: x*35}))
  // .sort((a,b) => Math.random()-0.5).slice(5);

// const testConnect = [
//   {source: 1.080518276655007, dest: 59.74135806963552},
//  {source: 85.2384239438265, dest: 77.14243567205759},
//  {source: 60.016805256118076, dest: 4.604772807473179},
// ];

const countNand: RegReduce<number> = {
  genChild: () => 1,
  defValue: 0,
  each: (acc, x) => acc + x.value,
  all: null
};

const countOrder: RegReduce<number> = {
  genChild: () => 0,
  defValue: 0,
  each: (acc, x) => x.value + 1 > acc ? x.value + 1 : acc,
  all: null
};

// Need to find positions of all chips (nulls for wires) and size of all chips


/*
for each stage, find max width and height
  space each chip in stage evenly and centered, using max box
find max stage height, use to center stages, and then calculate chip dimesions
*/



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'nand';
  runAnimation = false;
  shift = 50;
  // and_chip = and_chip;
  // or_chip = or_chip;
  // not_chip = not_chip;
  // mux_chip = mux_chip;
  valueFromList = valueFromList;
  genCross = genCross;

  tempchip = "mux";

  state: State = null;
  a = false;
  b = false;
  sel = false;


  chip = 'mux';
  register = register;
  layouts = register.reduce((acc, x) => regReduce(generateLayout, register, x.name, acc), []);

  pathss: DrawPath[] = [
    {
      initY: 0,
      preExpDx: 10,
      expDy: 10,
      joinDx: 10,
      crossDy: {init: -10, cross: [-5, -5]},
      postDx: 5
    },
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
  test(chip: string) {
    return evaluate(register, chip, [bind('a', this.a), bind('b', this.b)])[0].value;
  }

  animate(t, obj) {
    // obj.shift += 0.1;
    // obj.shift = obj.shift > 5 ? 0 : obj.shift;
    obj.shift = 2.5 + 2.5 * Math.sin(t / 500);
    requestAnimationFrame(t => obj.animate(t, obj));
  }

  calculatestate() {
    this.state = evaluate2(register, this.chip, [bind('a', this.a), bind('b', this.b), bind('sel', this.sel)]);
    console.log('new state', this.state);
  }

  updatea(x: MatCheckboxChange) {
    this.a = x.checked;
    this.calculatestate();
  }

  updateb(x: MatCheckboxChange) {
    this.b = x.checked;
    this.calculatestate();
  }

  updatesel(x: MatCheckboxChange) {
    this.sel = x.checked;
    this.calculatestate();
  }

  updateChip() {
    this.chip = this.tempchip;
    // this.layouts = register.reduce((acc, x) => regReduce(generateLayout, register, x.name, acc), []);
    this.calculatestate();
    console.log(this.chip);
  }

  ngOnInit() {
    this.calculatestate();
    console.log('Eval1', evaluate(register, 'mux', [bind('a', true), bind('b', false), bind('sel', false)]));
    console.log('Eval2', this.state);
    console.log('layouts', this.layouts);
    this.animate(0, this);
    // const mylist: String[] = ['Andy', 'Bob', 'Carl', 'Derek'];
    // const lastletter = genSortOrder(mylist, a => a.substr(-1).charCodeAt(0));
    // const secondletter = genSortOrder(mylist, a => a.charCodeAt(1));
    // console.log(idxMap(mylist, lastletter, x => {
    //   return [x + ' is cool, but '].concat(idxMap(mylist, secondletter, x => x + ' is great!'));
    // }));
    // console.log(orderedMap(mylist, x => x.charCodeAt(1), (x, i) => (i === 0 ? 'Hi ' : 'Also, hi ') + x + '!'));
    // console.log(idxMap(mylist, secondletter, x => x + ' is great!'));
    // orderedMap(mylist, x => x.charCodeAt(0), x => {x = 'x'; console.log(x)});
    // console.log(mylist);
    // console.log(this.test1, this.test2, this.test3);
    // console.log(this.test3);
    // validate(or_chip);
    // connect(testConnect);
    // console.log("Test expand", expand(testConnect));

    console.log(testConnect);

    console.log(this.pos);
    console.log('order', register.reduce((acc, x) => regReduce(countOrder, register, x.name, acc), []));
    console.log('nands', register.reduce((acc, x) => regReduce(countNand, register, x.name, acc), []));
    console.log('layout', register.reduce((acc, x) => regReduce(generateLayout, register, x.name, acc), []));
  }
}
