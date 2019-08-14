import { Component, OnInit, Input } from '@angular/core';
import { Chip } from '../chip';
import { State, evaluate } from '../eval-chip';
import { register } from '../chips';

@Component({
  selector: '[app-chip-display]',
  templateUrl: './chip-display.component.html',
  styleUrls: ['./chip-display.component.scss']
})
export class ChipDisplayComponent implements OnInit {

  @Input() chip: Chip;
  @Input() state: State;
  @Input() scale: number;

  register = register;

  evaluate = evaluate;

  constructor() { }

  ngOnInit() {
  }


  getChip(chip: string): Chip {
    return register.find(x => x.name === chip);
  }
}
