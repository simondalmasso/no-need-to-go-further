import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../site/src/graph.js", import.meta.url), "utf8");
const transformed = source
  .replace("export const SCENES =", "globalThis.SCENES =")
  .replace(/export const START_SCENE = "([^"]+)";/, 'globalThis.START_SCENE = "$1";');

const context = {};
vm.createContext(context);
vm.runInContext(transformed, context);

const { SCENES, START_SCENE } = context;
const errors = [];

if (!SCENES[START_SCENE]) errors.push(`Missing start scene: ${START_SCENE}`);

for (const [id, scene] of Object.entries(SCENES)) {
  if (scene.id !== id) errors.push(`${id}: scene.id mismatch`);

  if (!scene.terminal && !scene.next && !scene.choices?.length) {
    errors.push(`${id}: non-terminal scene has no exit`);
  }

  if (scene.next && !SCENES[scene.next]) {
    errors.push(`${id}: next target missing: ${scene.next}`);
  }

  if (scene.choices) {
    if (!scene.choiceTimeoutMs) errors.push(`${id}: choices require choiceTimeoutMs`);
    for (const choice of scene.choices) {
      if (!SCENES[choice.target]) errors.push(`${id}/${choice.id}: missing target ${choice.target}`);
      if (!Array.isArray(choice.hotspot) || choice.hotspot.length !== 4) {
        errors.push(`${id}/${choice.id}: hotspot must be [x,y,w,h]`);
      }
    }

    if (scene.auto !== "seeded" && !scene.choices.some((choice) => choice.id === scene.auto)) {
      errors.push(`${id}: auto choice not found: ${scene.auto}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`graph ok: ${Object.keys(SCENES).length} scenes, start=${START_SCENE}`);
