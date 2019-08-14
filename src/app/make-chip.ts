import { Wire, Chip, Apply, Nand } from './chip';


export function wire(from: string, to: string): Wire {
  return { kind: 'wire', from: from, to: to };
}

export function apply(chip: string, input: Wire[], output: Wire[]): Apply {
  return { kind: 'apply', chip: chip, input: input, output: output };
}

export function id(str: string): Wire {
  return wire(str, str);
}

export function nand(a: string, b: string, output: string): Nand {
  return { kind: 'nand', a: a, b: b, output: output };
}

