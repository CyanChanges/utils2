import { song } from './msr/api.ts'
export * from "./msr/api.ts";
export * from "./msr/oop.ts";
export * as meta from "./msr/meta.ts";
import { resolve, extname } from 'jsr:@std/path'
import { exists } from 'jsr:@std/fs'
import { Song } from "./msr/oop.ts";

function generatePath(song: Song) {
  return resolve(Deno.env.get("HOME") ?? './', 'Downloads/', `${song.cid}_${song.name}${extname(song.sourceUrl)}`);
}

export async function downloadTo(song: Song, path: string) {

  const resp = await fetch(song.sourceUrl)
  const ab = await resp.arrayBuffer()
  await Deno.writeFile(path, new Uint8Array(ab))
}

export async function download(cid: string, name?: string) {
  const song1 = await song(cid)
  const path = name ?? generatePath(song1)
  await downloadTo(song1, path)
  return path
}

export async function dlIn(cid: string, name?: string) {
  function generatePath(song: Song) {
    return resolve(Deno.env.get("HOME") ?? './', 'Downloads/', `${song.cid}_${song.name}${extname(song.sourceUrl)}`);
  }

  const song1 = await song(cid)
  const path = name ?? generatePath(song1)
  if (await exists(path)) return path
  return await downloadTo(song1, path)
}

export function ffplay(path: string) {
  console.log('Ffplay', path)
  const command = new Deno.Command("ffplay", {
    args: [
      path,
      '-loop', '0'
    ],
  })
  return command.spawn()
}
