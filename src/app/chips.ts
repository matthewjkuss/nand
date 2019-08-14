import { Chip } from './chip';
import { nand, apply, wire, id } from './make-chip';
import { getBound } from './eval-chip';

/** A not gate */

export const register: Chip[] = [
  {
    name: 'nand',
    input: ['a'],
    output: ['out'],
    design: null,
    emulation: x => [{name: 'out', value: !(x[0].value && x[1].value)}]
  }, {
    name: 'true',
    input: ['a'],
    output: ['out'],
    design: null,
    emulation: x => [{name: 'out', value: true}]
  }, {
    name: 'not',
    input: ['a'],
    output: ['out'],
    design: [
      [ id('a'), wire('a', 'b') ],
      [ nand('a', 'b', 'out') ]
    ],
    emulation: x => [{name: 'out', value: !x[0].value}]
  }, {
    name: 'and',
    input: ['a', 'b'],
    output: ['out'],
    design: [
      [ nand('a', 'b', 'out') ],
      [ apply('not', [wire('out', 'a')], [id('out')]) ]
    ],
    emulation: x => [{name: 'out', value: x[0].value && x[1].value}]
  }, {
    name: 'or',
    input: ['a', 'b'],
    output: ['out'],
    design: [
      [ apply('not', [id('a')], [wire('out', 'z')]), apply('not', [wire('b', 'a')], [wire('out', 'y')]) ],
      [ nand('z', 'y', 'out')]
    ],
    emulation: x => [{name: 'out', value: x[0].value || x[1].value}]
  }, {
    name: 'mux',
    input: ['a', 'b', 'm'],
    output: ['out'],
    design: [
      [ id('a'), id('b'), id('m'), apply('not', [wire('m', 'a')], [wire('out', 'nm')]) ],
      [ apply('and', [id('a'), wire('nm' , 'b')], [wire('out', 'x')]),
        apply('and', [id('b'), wire('m', 'a')], [wire('out', 'y')]) ],
      [ apply('or', [wire('x', 'a'), wire('y', 'b')], [id('out')]) ]
    ],
    emulation: x => [{name: 'out', value: getBound(x, 'm') ? getBound(x, 'b') : getBound(x, 'a')}]
  }
];
