import { Component, OnInit, Input } from '@angular/core';
import { Chip } from '../chip';

@Component({
  selector: '[app-chip-display]',
  templateUrl: './chip-display.component.html',
  styleUrls: ['./chip-display.component.scss']
})
export class ChipDisplayComponent implements OnInit {

  @Input() chip: Chip;
  @Input() scale: number;

  constructor() { }

  ngOnInit() {
  }

}
