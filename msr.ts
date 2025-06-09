import { song } from './msr/api.ts'
export * from "./msr/api.ts";
export * from "./msr/oop.ts";
export * as meta from "./msr/meta.ts";
import { resolve, extname } from 'jsr:@std/path'

export async function download(cid: string, name?: string) {
  const song1 = await song(cid)

  function generatePath() {
    return resolve(Deno.env.get("HOME") ?? './', 'Downloads/', `${song1.cid}_${song1.name}${extname(song1.sourceUrl)}`);
  }

  const resp = await fetch(song1.sourceUrl)
  const ab = await resp.arrayBuffer()
  const path = name ?? generatePath()
  await Deno.writeFile(path, new Uint8Array(ab))
  return path
}

