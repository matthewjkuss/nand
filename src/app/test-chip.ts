import { Chip, Apply, Action } from './chip';

type Check = NotSameLength | Different | Equal;

interface NotSameLength {
  kind: 'notSameLength';
}

interface Different {
  kind: 'different';
  difference: number[];
}

interface Equal {
  kind: 'equal';
}

function testInputBijectivity(app: Apply): string {
  return app.chip.input
    .map(input => [input, app.input.filter(x => input === x.to).length])
    .map(x => {
      if (x[1] < 1) {
        return (
          '\t\tERROR - Surjectivity: Cannot find wire to map to input "' +
          x[0] +
          '" in "' +
          app.chip.name +
          '".\n'
        );
      } else if (x[1] > 1) {
        return (
          '\t\tERROR - Injectivity: Found multiple wires to map to input "' +
          x[0] +
          '" in "' +
          app.chip.name +
          '".\n'
        );
      } else {
        return '';
      }
    })
    .reduce((a, b) => a + b, '');
}

function testOutputBijectivity(app: Apply): string {
  return app.chip.output
    .map(output => [output, app.output.filter(x => output === x.from).length])
    .map(x => {
      if (x[1] < 1) {
        return (
          '\t\tWarning - Surjectivity: Output "' +
          x[0] +
          '" in "' +
          app.chip.name +
          '" maps to nothing.\n'
        );
      } else if (x[1] > 1) {
        return (
          '\t\tERROR - Injectivity: Found multiple wires from output "' +
          x[0] +
          '" in "' +
          app.chip.name +
          '".\n'
        );
      } else {
        return '';
      }
    })
    .reduce((a, b) => a + b, '');
}

function testInputCodomain(app: Apply): string {
  return app.input
    .filter(input => !app.chip.input.find(x => input.to === x))
    .map(
      x =>
        '\t\tERROR - Codomain: Wire "' +
        x.to +
        '" does not map to an input in "' +
        app.chip.name +
        '".\n'
    )
    .reduce((a, b) => a + b, '');
}

function testOutputDomain(app: Apply): string {
  return app.output
    .filter(output => !app.chip.output.find(x => output.from === x))
    .map(
      x =>
        '\t\tERROR - Domain: Chip "' +
        app.chip.name +
        '" has no output called "' +
        x.from +
        '".\n'
    )
    .reduce((a, b) => a + b, '');
}

function listInput(action: Action): string[] {
  if (action.kind === 'apply') {
    return action.input.map(x => x.from);
  } else if (action.kind === 'nand') {
    return [action.a, action.b];
  } else if (action.kind === 'wire') {
    return [action.from];
  }
}

function listOutput(action: Action): string[] {
  if (action.kind === 'apply') {
    return action.output.map(x => x.to);
  } else if (action.kind === 'nand') {
    return [action.output];
  } else if (action.kind === 'wire') {
    return [action.to];
  }
}

function checkEqual(output: any, input: any): string {
  return input.map(x => output.find(y => x === y) ? '' : '\t\tERROR - : Cannot find output to pair to input "' + x + '".\n')
   + output.map(x => input.find(y => x === y) ? '' : '\t\tWarning - : Output "' + x + '" is unused.\n');
}

export function validate(chip: Chip): boolean {
  let errors = '';
  chip.design.map(column => {
    errors += 'Checking column...\n';
    column.map(action => {
      if (action.kind === 'apply') {
        errors += '\tChecking ' + action.chip.name + '...\n';
        errors += testInputCodomain(action);
        errors += testInputBijectivity(action);
        errors += testOutputDomain(action);
        errors += testOutputBijectivity(action);
      }
    });
  });
  const pairs: string[][] = [chip.input]
    .concat(
      chip.design
        .map(column => {
          errors += 'Checking column...\n';
          return [
            column.map(listInput).reduce((a, b) => a.concat(b), []),
            column.map(listOutput).reduce((a, b) => a.concat(b), [])
          ];
        })
        .reduce((a, b) => a.concat(b))
    )
    .concat([chip.output]);
  if (pairs.length % 2 === 1) {
    console.log('Error! Not in pairs!');
  }
  // const output: Check[] = [];
  for (let i = 0; i < pairs.length; i += 2) {
    errors += checkEqual(pairs[i], pairs[i + 1]);
  }
  // console.log(output.map(x => {
  //   if (x.kind === 'equal') {
  //     return '';
  //   } else if (x.kind === 'different') {
  //     return '';
  //   } else if (x.kind === 'notSameLength') {
  //     return 'Not same length';
  //   }
  // }));

  // console.log(output);
  console.log(errors);
  for (let i = 0; i < chip.design.length - 1; i++) {}
  return true;
}
