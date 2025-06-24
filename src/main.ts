import { App } from './App';

async function main() {
  new App().print('Hello TS World')
}

try {
  await main();
} catch (err) {
  console.log(err)
  process.exitCode = 1;
}
