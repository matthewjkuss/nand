import { Component, OnInit, Input } from '@angular/core';
import { Layout } from '../layout';
import { Chip, chipFromReg } from '../chip';
import { valueFromList, NamedValue, regReduce, RegReduce } from '../reduce-register';
import { State } from '../eval-chip';

@Component({
  selector: '[app-chip-interior]',
  templateUrl: './chip-interior.component.html',
  styleUrls: ['./chip-interior.component.scss']
})
export class ChipInteriorComponent implements OnInit {
  @Input() layouts: NamedValue<Layout>[];
  @Input() register: Chip[];
  @Input() chip: string;
  @Input() state: State;

  layout: Layout = null;
  mychip: Chip = null;
  inputs: {x: number, y: number}[][] = [];
  outputs: {x1: number, y1: number, x2: number, y2: number}[][][] = [];

  constructor() { }

  valueFromList = valueFromList;

  ngOnInit() {
    this.layout = valueFromList(this.chip, this.layouts);
    console.log('inner layout', this.layout);
    this.mychip = chipFromReg(this.chip, this.register);
    console.log('inner mychip', this.mychip);
    // this.inputs.push(this.layout.inputs.map(x => ({x: 0, y: x.position})));

    for (let i = 0; i < this.mychip.design.length - 1; i++) {
      const stage_output = [];
      for (const [j, subchip] of this.mychip.design[i].entries()) {
        const chip_output = [];
        if (subchip.kind === 'apply') {
          for (const [k, input] of subchip.input.entries()) {
            let leftside;
            if (i === 0) {
              leftside = this.layout.inputs.find((x, idx) => this.mychip.input[idx] === input.from);
            } else {
              // for (this.layout.inputs)
              let chipidx = 0;
              let chipname= 'blah';
              let outidx = 0;
              this.mychip.design[i-1].map((leftchip, chipidxs) => {
                if (leftchip.kind === 'apply') {
                  leftchip.output.map((leftout, outidxs) => {
                    console.log('mnm', leftchip, leftout, input.from);
                    if (leftout.to === input.from) {

                      chipidx = chipidxs;
                      chipname = leftchip.chip;
                      outidx = outidxs;
                      leftside = {length: 0, position: this.layout.design[i-1][chipidx].y + valueFromList(chipname, this.layouts).outputs[outidx].position};
                    }
                    // return leftout.to === input.from;
                  });
                } else {
                  if (leftchip.to === input.from) {
                    leftside = {length: 0, position: this.layout.design[i-1][chipidxs].y};
                  }
                }
              });
              // leftside = {length: 0, position: this.layout.design[i-1][chipidx].y + valueFromList(chipname, this.layouts).outputs[outidx].position};
            }
            const sublayout = valueFromList(subchip.chip, this.layouts);
            chip_output.push({
              x1: 0,
              y1: leftside.position,
              x2: this.layout.design[0][j].x + this.layout.lpad - sublayout.inputs[k].length,
              y2: this.layout.design[0][j].y + sublayout.inputs[k].position
            });
          }
        } else {
          const leftside = this.layout.inputs.find((x, idx) => this.mychip.input[idx] === subchip.from);
          chip_output.push({
            x1: 0,
            y1: leftside.position,
            x2: this.layout.design[0][j].x,
            y2: this.layout.design[0][j].y
          });
        }
        stage_output.push(chip_output);
      }
      this.outputs.push(stage_output);
    }
    console.log('Show me!', this.mychip, 'outputs', this.outputs, this.layout);
  }

}
