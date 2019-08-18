import { Wire, Chip, Apply, Nand, Action } from './chip';

/** A specifies the boolean value assigned to a named variable. */
export interface BoundVar {
  name: String;
  value: Boolean;
}

/** Using its name, get the value of a variable from a given state. */
export function getBound(state: BoundVar[], name: String): Boolean {
  const result = state.find(x => x.name === name);
  if (result === undefined) {
    return false;
  }
  return result.value;
}

export function bind(name: String, value: Boolean): BoundVar {
  return { name: name, value: value };
}

function wireFind(action: Wire, state: BoundVar[]): BoundVar {
  // console.log('in7777')
  return bind(action.to, getBound(state, action.from));
}

function wireFindFrom(action: Wire, state: BoundVar[]): BoundVar {
  // console.log('out7777')
  return bind(action.from, getBound(state, action.from));
}

function perform(register: Chip[], action: Action, state: BoundVar[]): BoundVar[] {
  switch (action.kind) {
    // case 'nand': return [ bind(action.output, !(getBound(state, action.a) && getBound(state, action.b))) ];
    case 'wire': return [ wireFind(action, state) ];
    case 'apply':
      const output = evaluate(register, action.chip, action.input.map(x => wireFind(x, state)));
      return action.output.map(x => wireFind(x, output));
  }
}

export function evaluate(register: Chip[], chip: string, input: BoundVar[]): BoundVar[] {
  const chip_ptr = register.find(x => x.name === chip);
  // return chip.emulation(input);
  if (!chip_ptr.design) {
    return chip_ptr.emulation(input);
  } else {
    return chip_ptr.design.reduce((state, line) => [].concat.apply([], line.map(action => perform(register, action, state))), input);
  }
}

export function evaluate2(register: Chip[], chip: string, input: BoundVar[]): State {
  const chip_ptr = register.find(x => x.name === chip);
  // return chip.emulation(input);
  if (!chip_ptr.design) {
    return {
      input: input,
      design: null,
      output: chip_ptr.emulation(input)
    };
  } else {
    const design: State[][] = [];
    chip_ptr.design.reduce((state, line) => {
      const stage: State[] = [];
      const x = [].concat.apply([], line.map(action => {
        const y = perform2(register, action, state);
        stage.push(y);
        return y.output;
      }));
      design.push(stage);
      return x;
    }, input);
    return {
      input: input,
      design: design,
      output: chip_ptr.design.reduce((state, line) => [].concat.apply([], line.map(action => perform(register, action, state))), input)
    };
  }
}

function perform2(register: Chip[], action: Action, state: BoundVar[]): State {
  switch (action.kind) {
    // case 'nand': return [ bind(action.output, !(getBound(state, action.a) && getBound(state, action.b))) ];
    case 'wire': return { input: [wireFindFrom(action, state)], design: null, output: [wireFind(action, state)] };
    case 'apply':
      const output = evaluate2(register, action.chip, action.input.map(x => wireFind(x, state)));
      return {
        input: output.input,
        design: output.design,
        output: action.output.map(x => wireFind(x, output.output))
      };
  }
}

export interface State {
  input: BoundVar[];
  design: State[][];
  output: BoundVar[];
}

export function stateFromChip(input: BoundVar[], register: Chip[], chip: string): State {
  // const input = [];
  const chip_ptr = register.find(y => y.name === chip);
  // for (x of chip_ptr.input) {
  //   input.push({ name: x, value: null });
  // }
  // for (x of chip_ptr.output) {
  //   input.push({ name: x, value: null });
  // }
  const output = evaluate(register, chip, input);
  return {
    input: input,
    design: null,
    output: output,
  };
}
