import { BoundVar } from './eval-chip';
/** Defines a wire connecting chips. */
export interface Wire {
  kind: 'wire';
  from: string;
  to: string;
}

/** Allows the creation of named chips, from combination of wires, nands, and
 * other named chips. */
export interface Apply {
  kind: 'apply';
  // chip: Chip;
  chip: string;
  input: Wire[];
  output: Wire[];
}

/** Just a plain old nand gate. */
export interface Nand {
  kind: 'nand';
  a: string;
  b: string;
  output: string;
}

export type Action = Wire | Apply;

export interface Chip {
  name: string;
  input: string[];
  output: string[];
  /** Outer array gives 'stages' of chips, and inner gives chips within a given
   * stage. */
  design: Action[][];
  emulation: (_: BoundVar[]) => BoundVar[];
}

export function chipFromReg(chip_name: string, register: Chip[]) {
  const result = register.find(x => x.name === chip_name);
  if (result) {
    return result;
  } else {
    throw new Error('Could not retrieve chip ' + chip_name + ' from register!');
  }
}
