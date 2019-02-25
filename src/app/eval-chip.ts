import { Wire, Chip, Apply, Nand, Action } from './chip';

interface BoundVar {
  name: String;
  value: Boolean;
}

function getBound(state: BoundVar[], name: String): Boolean {
  return state.find(x => x.name === name).value;
}

export function bind(name: String, value: Boolean): BoundVar {
  return {name: name, value: value };
}

function wireFind(action: Wire, state: BoundVar[]): BoundVar {
  return bind(action.to, getBound(state, action.from));
}

function perform(action: Action, state: BoundVar[]): BoundVar[] {
  switch (action.kind) {
    case 'nand': return [ bind(action.output, !(getBound(state, action.a) && getBound(state, action.b))) ];
    case 'wire': return [ wireFind(action, state) ];
    case 'apply':
      const output = evaluate(action.chip, action.input.map(x => wireFind(x, state)));
      return action.output.map(x => wireFind(x, output));
  }
}

export function evaluate(chip: Chip, input: BoundVar[]): BoundVar[] {
  return chip.design.reduce((state, line) => [].concat.apply([], line.map(action => perform(action, state))), input);
}
