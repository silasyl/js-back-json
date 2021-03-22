import { promises as fs } from 'fs';
import { EventEmitter } from 'events';

const eventEmitter = new EventEmitter();
let counter = 0;

async function readJson() {
  try {
    // Read the database json files
    const states = JSON.parse(await fs.readFile('./database/Estados.json'));
    const cities = JSON.parse(await fs.readFile('./database/Cidades.json'));

    // Create a json file for each state
    await states.forEach((state) => {
      let stateCities = cities.filter((city) => {
        return city.Estado === state.ID;
      });
      let fileName = `./created/${state.Sigla}.json`;
      fs.writeFile(fileName, JSON.stringify(stateCities));
    });
    eventEmitter.emit('jsonCreated', states);
  } catch (err) {
    console.log(err);
  }
}

// Count number of cities of state
async function countCities(state) {
  try {
    const cities = JSON.parse(await fs.readFile(`./created/${state}.json`));
    const numberCities = await cities.reduce((acc, curr) => {
      return acc + 1;
    }, 0);
    eventEmitter.emit('counted', { state, numberCities });
  } catch (err) {
    console.log(err);
  }
}

function eventOn(states) {
  eventEmitter.on('counted', (obj) => {
    states.find((state) => {
      return state.Sigla === obj.state;
    }).numberCities = obj.numberCities;

    counter += 1;

    if (counter === 27) {
      eventEmitter.emit('counted27States', states);
    }
  });
}

async function sortStates() {
  try {
    const states = JSON.parse(await fs.readFile('./database/Estados.json'));

    await states.forEach((state) => {
      countCities(state.Sigla);
    });

    eventOn(states);

    eventEmitter.on('counted27States', (states) => {
      states.sort((a, b) => {
        return a.numberCities - b.numberCities;
      });
      eventEmitter.emit('sorted', states);
    });
  } catch (err) {
    console.log(err);
  }
}

async function showMaxStates() {
  try {
    eventEmitter.on('sorted', (states) => {
      console.log(
        `["${states[26].Sigla} - ${states[26].numberCities}", "${states[25].Sigla} - ${states[25].numberCities}", "${states[24].Sigla} - ${states[24].numberCities}", "${states[23].Sigla} - ${states[23].numberCities}", "${states[22].Sigla} - ${states[22].numberCities}"]`
      );
    });
  } catch (err) {
    console.log(err);
  }
}

async function showMinStates() {
  try {
    eventEmitter.on('sorted', (states) => {
      console.log(
        `["${states[4].Sigla} - ${states[4].numberCities}", "${states[3].Sigla} - ${states[3].numberCities}", "${states[2].Sigla} - ${states[2].numberCities}", "${states[1].Sigla} - ${states[1].numberCities}", "${states[0].Sigla} - ${states[0].numberCities}"]`
      );
    });
  } catch (err) {
    console.log(err);
  }
}

async function showMaxNames() {
  try {
    const states = JSON.parse(await fs.readFile('./database/Estados.json'));
    const cities = JSON.parse(await fs.readFile('./database/Cidades.json'));

    let maxSize = 0;
    let maxNameOfAll = '';
    let max = [];
    let maxState = '';

    await states.forEach((state) => {
      let maxNameNumber = 0;
      let maxName = '';

      cities
        .filter((city) => {
          return city.Estado === state.ID;
        })
        .forEach((city) => {
          if (city.Nome.length >= maxNameNumber) {
            if (city.Nome.length > maxNameNumber) {
              maxNameNumber = city.Nome.length;
              maxName = city.Nome;
            } else {
              if (maxName.localeCompare(city.Nome) !== -1) {
                maxName = city.Nome;
              }
            }
          }
        });
      console.log(maxName, state);

      max = [...max, { maxName: maxName, state: state.Sigla }];
    });

    max.forEach((city) => {
      if (city.maxName.length >= maxSize) {
        if (city.maxName.length > maxSize) {
          maxSize = city.maxName.length;
          maxNameOfAll = city.maxName;
          maxState = city.state;
        } else {
          if (maxNameOfAll.localeCompare(city.maxName) !== -1) {
            maxNameOfAll = city.maxName;
            maxState = city.state;
          }
        }
      }
    });
    eventEmitter.emit('maxFound', [maxNameOfAll, maxState]);
  } catch (err) {
    console.log(err);
  }
}

async function showMinNames() {
  try {
    const states = JSON.parse(await fs.readFile('./database/Estados.json'));
    const cities = JSON.parse(await fs.readFile('./database/Cidades.json'));

    let minSize = 999;
    let minNameOfAll = '';
    let min = [];
    let minState = '';

    await states.forEach((state) => {
      let minNameNumber = 999;
      let minName = '';

      cities
        .filter((city) => {
          return city.Estado === state.ID;
        })
        .forEach((city) => {
          if (city.Nome.length <= minNameNumber) {
            if (city.Nome.length < minNameNumber) {
              minNameNumber = city.Nome.length;
              minName = city.Nome;
            } else {
              if (minName.localeCompare(city.Nome) !== -1) {
                minName = city.Nome;
              }
            }
          }
        });
      console.log(minName, state);

      min = [...min, { minName: minName, state: state.Sigla }];
    });

    min.forEach((city) => {
      if (city.minName.length <= minSize) {
        if (city.minName.length < minSize) {
          minSize = city.minName.length;
          minNameOfAll = city.minName;
          minState = city.state;
        } else {
          if (minNameOfAll.localeCompare(city.minName) !== -1) {
            minNameOfAll = city.minName;
            minState = city.state;
          }
        }
      }
    });
    eventEmitter.emit('minFound', [minNameOfAll, minState]);
  } catch (err) {
    console.log(err);
  }
}

async function findMax() {
  eventEmitter.on('maxFound', (obj) => {
    console.log(obj);
  });
}

async function findMin() {
  eventEmitter.on('minFound', (obj) => {
    console.log(obj);
  });
}

readJson();
sortStates();
showMaxStates();
showMinStates();
showMaxNames();
showMinNames();
findMax();
findMin();
