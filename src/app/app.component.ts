import { Component, OnInit } from '@angular/core';
import { Chip } from './chip';
import { evaluate, bind } from './eval-chip';
import { and_chip, or_chip, not_chip } from './chips';
import { validate } from './test-chip'

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

  chip = and_chip;

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
  test(chip: Chip) {
    return evaluate(chip, [bind('a', this.a), bind('b', this.b)])[0].value;
  }

  ngOnInit() {
    // console.log(this.test1, this.test2, this.test3);
    // console.log(this.test3);
    validate(or_chip);

    console.log(this.pos);
  }
}
