import { RegReduce, NamedValue, valueFromList } from './reduce-register';
import { Chip } from './chip';

interface ChipSlot {
  x: number;
  y: number;
  // dx: number;
}

export interface Layout {
  width: number;
  height: number;
  lpad: number;
  rpad: number;
  inputs: { length: number, position: number }[];
  outputs: { length: number, position: number }[];
  design: ChipSlot[][];
}

function generateInputs(chip: Chip, partialLayout: {width: number, height: number, design: ChipSlot[][]}): Layout {
  const inputs = [];
  const outputs = [];
  for (const [i, name] of chip.input.entries()) {
    inputs.push({length: 10, position: (2*i+1)*(partialLayout.height)/(2*chip.input.length)});
  }
  for (const [i, name] of chip.output.entries()) {
    outputs.push({length: 10, position: (2*i+1)*(partialLayout.height)/(2*chip.output.length)});
  }
  return {
    width: partialLayout.width,
    height: partialLayout.height,
    design: partialLayout.design,
    inputs: inputs,
    outputs: outputs,
    lpad: inputs.reduce((acc, x) => x.length > acc ? x.length : acc, 0) + 2,
    rpad: outputs.reduce((acc, x) => x.length > acc ? x.length : acc, 0) + 2
  };
}

export const generateLayout: RegReduce<Layout> = {
  genChild: (chip: Chip) => generateInputs(chip, { width: 70, height: 70, design: null }),
  defValue: { width: 0, height: 0, design: null, lpad: 0, rpad: 0, inputs: null, outputs: null },
  each: null,
  all: function (acc: Layout, chip: Chip, list: NamedValue<Layout>[]): Layout {
    const chip_vert_buffer = 10;
    const stage_hori_buffer = 50;
    const wire_space = 30;
    const padding = 20;
    // First loop sets chip positions within stage
    let max_stage_height = 0;
    const stage_pos_matrix = [];
    const stage_width_list = [];
    const stage_height_list = [];
    for (const stage of chip.design) {
      let max_chip_width = 0;
      let max_chip_height = 0;
      for (const action of stage) {
        if (action.kind === 'apply') {
          const layout = valueFromList(action.chip, list);
          max_chip_width = max_chip_width > layout.width+layout.lpad ? max_chip_width : layout.width+layout.lpad;
          max_chip_height = max_chip_height > layout.height ? max_chip_height : layout.height;
        }
      }
      stage_width_list.push(max_chip_width);
      const chip_pos_list = [];
      let y = 0;
      for (const action of stage) {
        if (action.kind === 'apply') {
          const layout = valueFromList(action.chip, list);
          chip_pos_list.push({x: (max_chip_width - layout.width) / 2, y: y});
          y += max_chip_height + chip_vert_buffer;
        } else {
          chip_pos_list.push({x: max_chip_width / 2, y: y});
          y += wire_space + chip_vert_buffer;
        }
      }
      y -= chip_vert_buffer;
      stage_height_list.push(y);
      max_stage_height = max_stage_height > y ? max_stage_height : y;
      stage_pos_matrix.push(chip_pos_list);
    }
    // Second loop positions stages
    let x = padding;
    for (const [i, stage] of chip.design.entries()) {
      for (const [j, action] of stage.entries()) {
        stage_pos_matrix[i][j].x += x;
        stage_pos_matrix[i][j].y += (max_stage_height - stage_height_list[i]) / 2 + padding;
      }
      x += stage_width_list[i] + stage_hori_buffer;
    }
    x -= stage_hori_buffer;
    return generateInputs(chip, { width: x + 2 * padding, height: max_stage_height + 2 * padding + 30, design: stage_pos_matrix});
  }
};
