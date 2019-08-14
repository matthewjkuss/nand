import { Component, OnInit, Input } from '@angular/core';
import { Chip } from '../chip';
import { State, evaluate } from '../eval-chip';

@Component({
  selector: '[app-chip-display]',
  templateUrl: './chip-display.component.html',
  styleUrls: ['./chip-display.component.scss']
})
export class ChipDisplayComponent implements OnInit {

  @Input() chip: Chip;
  @Input() state: State;
  @Input() scale: number;

  evaluate = evaluate;

  constructor() { }

  ngOnInit() {
  }

}
