import { Component, OnInit, Input } from '@angular/core';
import { Layout } from '../layout';
import { Chip, chipFromReg } from '../chip';
import { valueFromList, NamedValue, RegReduce, regReduce } from '../reduce-register';
import { State } from '../eval-chip';

@Component({
  selector: '[app-chip-exterior]',
  templateUrl: './chip-exterior.component.html',
  styleUrls: ['./chip-exterior.component.scss']
})
export class ChipExteriorComponent implements OnInit {
  @Input() layouts: NamedValue<Layout>[];
  @Input() register: Chip[];
  @Input() chip: string;
  @Input() state: State;

  layout: Layout = null;
  mychip: Chip = null;

  constructor() { }

  ngOnInit() {
    console.log('loaded state', this.chip, this.state)
    this.layout = valueFromList(this.chip, this.layouts);
    this.mychip = chipFromReg(this.chip, this.register);
  }

}
