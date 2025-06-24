// Custom node.js loader to allow imports with aliases and without file extension.
// Example: "@/foo" will resolve to "./src/foo.ts".

import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const alias = {
  '@': path.resolve(__dirname, 'src'),
};

function appendFileSuffix(specifier) {
  // if importing relative path without suffix then it must be a .ts file
  if (/^[.]{1,2}\//.test(specifier) && !/(\.ts|\.js)$/.test(specifier)) {
    return specifier + '.ts';
  }
  return specifier;
}

export async function resolve(specifier, context, nextResolve) {
  for (const [prefix, targetPath] of Object.entries(alias)) {
    if (specifier.startsWith(prefix + '/')) {
      const subPath = specifier.slice(prefix.length + 1);
      const resolved = path.join(targetPath, subPath);
      return {
        url: pathToFileURL(resolved + '.ts').href,
        shortCircuit: true,
      };
    }
  }
  return nextResolve(appendFileSuffix(specifier), context);
}
