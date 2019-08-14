import { Wire, Chip, Apply, Nand, Action } from './chip';

/** A specifies the boolean value assigned to a named variable. */
export interface BoundVar {
  name: String;
  value: Boolean;
}

/** Using its name, get the value of a variable from a given state. */
export function getBound(state: BoundVar[], name: String): Boolean {
  return state.find(x => x.name === name).value;
}

export function bind(name: String, value: Boolean): BoundVar {
  return { name: name, value: value };
}

function wireFind(action: Wire, state: BoundVar[]): BoundVar {
  return bind(action.to, getBound(state, action.from));
}

function perform(register: Chip[], action: Action, state: BoundVar[]): BoundVar[] {
  switch (action.kind) {
    case 'nand': return [ bind(action.output, !(getBound(state, action.a) && getBound(state, action.b))) ];
    case 'wire': return [ wireFind(action, state) ];
    case 'apply':
      const output = evaluate(register, action.chip, action.input.map(x => wireFind(x, state)));
      return action.output.map(x => wireFind(x, output));
  }
}

export function evaluate(register: Chip[], chip: string, input: BoundVar[]): BoundVar[] {
  // return chip.emulation(input);
  return register.find(x => x.name == chip).design.reduce((state, line) => [].concat.apply([], line.map(action => perform(register, action, state))), input);
}

export interface State {
  input: BoundVar[];
  design: State[][];
  output: BoundVar[];
}

export function stateFromChip(register: Chip[], chip: string): State {
  const input = [];
  const output = [];
  const chip_ptr = register.find(y => y.name === chip);
  let x;
  for (x of chip_ptr.input) {
    input.push({ name: x, value: null });
  }
  for (x of chip_ptr.output) {
    input.push({ name: x, value: null });
  }
  return {
    input: input,
    design: null,
    output: output,
  };
}
