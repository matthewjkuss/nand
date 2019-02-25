export interface Wire {
  kind: 'wire';
  from: string;
  to: string;
}

export interface Apply {
  kind: 'apply';
  chip: Chip;
  input: Wire[];
  output: Wire[];
}

export interface Nand {
  kind: 'nand';
  a: string;
  b: string;
  output: string;
}

export type Action = Wire | Apply | Nand;

export interface Chip {
  name: string;
  input: string[];
  output: string[];
  design: Action[][];
}
