import { Chip } from './chip';
import { nand, apply, wire, id } from './make-chip';

export const not_chip: Chip = {
  name: 'not',
  input: ['a'],
  output: ['out'],
  design: [
    // [ id('a'), wire('a', 'b') ],
    [ nand('a', 'a', 'out') ]
  ]
};

export const and_chip: Chip = {
  name: 'and',
  input: ['a', 'b'],
  output: ['out'],
  design: [
    [ nand('a', 'b', 'out') ],
    [ apply(not_chip, [wire('out', 'a')], [id('out')]) ]
  ]
};

export const or_chip: Chip = {
  name: 'or',
  input: ['a', 'b'],
  output: ['out'],
  design: [
    [ apply(not_chip, [id('a'), id('a')], [wire('out', 'z')]), apply(not_chip, [wire('b', 'a')], [wire('out', 'b')]) ],
    [ nand('a', 'b', 'out')]
  ]
};
