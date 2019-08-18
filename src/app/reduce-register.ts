import { chipFromReg, Chip } from './chip';

export interface RegReduce<X> {
  genChild: (chip: Chip) => X;
  defValue: X;
  each: (acc: X, x: NamedValue<X>) => X;
  all: (acc: X, chip: Chip, list: NamedValue<X>[]) => X;
}

export interface NamedValue<X> {
  name: string;
  value: X;
}

export function valueFromList<X>(name: string, list: NamedValue<X>[]): X {
  const result = list.find(x => x.name === name);
  if (result) {
    return result.value;
  } else {
    throw new Error('Could not retrieve value ' + name + ' from list!');
  }
}

export function regReduce<X>(reduce: RegReduce<X>, register: Chip[], chip_name: string, list: NamedValue<X>[]): NamedValue<X>[] {
  const chip = chipFromReg(chip_name, register);
  const entry = list.find(x => x.name === chip.name);
  if (entry) {

  } else if (!chip.design) {
    list.push({name: chip_name, value: reduce.genChild(chip)});
  } else {
    let acc = reduce.defValue;
    for (const stage of chip.design) {
      for (const action of stage) {
        if (action.kind === 'apply') {
          list = regReduce(reduce, register, action.chip, list);
          if (reduce.each) {
            acc = reduce.each(acc, list.find(x => x.name === action.chip));
          }
        }
      }
    }
    if (reduce.all) {
      acc = reduce.all(acc, chip, list);
    }
    list.push({name: chip_name, value: acc});
  }
  return list;
}
