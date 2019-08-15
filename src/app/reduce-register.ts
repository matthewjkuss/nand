import { chipFromReg, Chip } from './chip';

export interface RegReduce<X> {
  childValue: X;
  defValue: X;
  f: (acc: X, x: NamedValue<X>) => X;
}

interface NamedValue<X> {
  name: string;
  value: X;
}

export function regReduce<X>(reduce: RegReduce<X>, register: Chip[], chip_name: string, list: NamedValue<X>[]): NamedValue<X>[] {
  const chip = chipFromReg(chip_name, register);
  const entry = list.find(x => x.name === chip.name);
  if (entry) {

  } else if (!chip.design) {
    list.push({name: chip_name, value: reduce.childValue});
  } else {
    let acc = reduce.defValue;
    for (const stage of chip.design) {
      for (const action of stage) {
        if (action.kind === 'apply') {
          list = regReduce(reduce, register, action.chip, list);
          acc = reduce.f(acc, list.find(x => x.name === action.chip));
        }
      }
    }
    list.push({name: chip_name, value: acc});
  }
  return list;
}
