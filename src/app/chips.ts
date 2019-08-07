import { Chip } from './chip';
import { nand, apply, wire, id } from './make-chip';

/** A not gate */
export const not_chip: Chip = {
  name: 'not',
  input: ['a'],
  output: ['out'],
  design: [
    [ id('a'), wire('a', 'b') ],
    [ nand('a', 'b', 'out') ]
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
    [ apply(not_chip, [id('a')], [wire('out', 'z')]), apply(not_chip, [wire('b', 'a')], [wire('out', 'y')]) ],
    [ nand('z', 'y', 'out')]
  ]
};

export const mux_chip: Chip = {
  name: 'mux',
  input: ['a', 'b', 'm'],
  output: ['out'],
  design: [
    [ id('a'), id('b'), apply(not_chip, [wire('m', 'a')], [wire('out', 'nm')]) ],
    [ apply(and_chip, [id('a'), wire('m' , 'b')], [wire('out', 'x')]),
      apply(and_chip, [id('b'), wire('nm', 'a')], [wire('out', 'y')]) ],
    [ apply(or_chip, [wire('x', 'a'), wire('y', 'b')], [id('out')]) ]
  ]
};
