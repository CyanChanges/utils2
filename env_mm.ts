import * as env from "./env.ts";
import { isString } from "jsr:@radashi-org/radashi";
import { toSnakeCase } from "jsr:@std/text/to-snake-case";
import { compareSimilarity } from "jsr:@std/text/compare-similarity";
import { bgCyan, black, blue, gray, red } from "jsr:@std/fmt/colors";

export * from "./env.ts";

export const rawKeys = Object.keys(env).filter(isString);
export const keys = rawKeys.map((x) => x.toLowerCase()).map(
  toSnakeCase,
);
export function lookForSimilar(key: string) {
  const similarKeys = keys.toSorted(compareSimilarity(toSnakeCase(key)));
  console.error(red(`Could not found ${bgCyan(black(key))}`));
  console.error(`Did you mean ${blue(similarKeys.join(gray(", ")))} ?`);
}

if (import.meta.main) {
  for (const arg of Deno.args) {
    const index = keys.findIndex((x) => x === arg);
    if (index === -1) {
      lookForSimilar(arg);
      break;
    }
    const value = Reflect.get(env, rawKeys[index]);
    Deno.stdout.writeSync(new TextEncoder().encode(value));
  }
}
