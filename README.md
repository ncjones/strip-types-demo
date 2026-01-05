# Node.js Typescript Strip Types Demo

This project demonstrates a Hello World application using the
`--experimental-strip-types` Node.js runtime feature so that source code can be
authored using Typescript and executed directly without a Typescript toolchain.
The benefit of this approach is a lighter and faster developer experience.


## Important Files

**bin/run.sh** – The entry point for running the application. It runs `node`
and sets the following flags:

1. `--experimental-strip-types` to allow Typescript syntax to be stripped.
2. `--experimental-loader` flag to allow custom module path resolution.

**loader.mjs** – Implements custom module path resolution so that modules can
be imported using path alias and without file suffix. For example, "@/foo" will
be treated as "./src/foo.ts".

**tsconfig.json** – Typescript language options are configured to match the
Node.js runtime so that compilation can be skipped.


**package.json** – The project must declare `"type": "module"` to enable ESM 
module loading. The "@types/node" package should be added as a dev dependency
so type information is available for Node.js stdlib features like
`process.exitCode` or `node:fs` etc.

**.yarnrc.yml** – Yarn Node Linker is set to "node_modules" to ensure the LSP
server can discover type information for dependencies.


## Language Limitations

Some Typescript language features are not compatible with the Node.js strip
types option. Configuring ESLint to disallow these features would be ideal. The
main features to be aware of are:

**No Enums** – The enum syntax is not available when stripping types. This is
because Typescript enums depend on runtime code structures that cannot be
generated without a compilation step.

**No Parameter Properties** –  The "Parameter Property" constructor syntax is
not available when stripping types. Properties need to be declared using the
regular syntax and assigned separately in their constructor.

**Import Type** – The `import type` syntax must be used when importing types
and interfaces so that they can be stripped. Without this there will be runtime
errors trying to import the stripped types.

**No CJS Shims** – Modules _must_ use ESM syntax and _cannot_ use CJS module
variables like `require`, `module.exports` or `__dirname`. Your test runner
(eg vitest) will likely provide these shims so even though these won't work in
your production code they may work in your test code.

## CJS to ESM Syntax Mapping

The following table shows how to avoid CJS syntax when using pure ESM. With
compiled Typescript, mixing CJS and ESM features is often permitted but it is
strictly not feasible with type stripping.

| Concept            | CommonJS (CJS)                                | ECMAScript Modules (ESM)                                                                            |
| ------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Export syntax**  | `module.exports = ...`<br>`exports.foo = ...` | `export default ...`<br>`export const foo = ...`                                                    |
| **Import syntax**  | `const foo = require('foo')`                  | `import foo from 'foo'`<br>`import { foo } from 'foo'`                                              |
| **Dynamic import** | `require('foo')` (sync)                       | `await import('foo')` (async)                                                                       |
| **JSON import**    | `require('./data.json')`                      | `import data from './data.json' assert { type: 'json' }` *(requires `--experimental-json-modules`)* |
| **\_\_filename**   | `__filename`                                  | `import.meta.filename`                                                                              |
| **\_\_dirname**    | `__dirname`                                   | `import.meta.dirname`                                                                               |


## TSConfig Settings

The following "compilerOptions" settings in `tsconfig.json` are relevant when
using type stripping.

| Setting                                | Why It Matters for Type Stripping                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `"module": "esnext"`                   | Ensures native ESM syntax is preserved — critical for Node ESM and loaders.                           |
| `"moduleResolution": "node"`           | Aligns TypeScript's resolution with Node's module resolution logic.                                   |
| `"types": ["node"]`                    | Pulls in `@types/node`, ensuring Node globals like `process` are typed.                               |
| `"noEmit": true`                       | Prevents `.js` output from TypeScript — essential if you rely purely on a runtime loader or bundler.  |
| `"paths"`                              | Enables custom import aliases (e.g., `@/utils`) — make sure runtime resolver mirrors this.            |

