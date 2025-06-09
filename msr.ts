import { song } from './msr/api.ts'
export * from "./msr/api.ts";
export * from "./msr/oop.ts";
export * as meta from "./msr/meta.ts";
import { resolve, extname } from 'jsr:@std/path'
import { exists } from 'jsr:@std/fs'
import { Song } from "./msr/oop.ts";
import { toArrayBuffer } from 'jsr:@std/streams'

export const DOWNLOAD_PATH = resolve(Deno.env.get("HOME") ?? './', 'Music/')

export function generatePath(song: Song) {
  return resolve(DOWNLOAD_PATH, `${song.cid}_${song.name}${extname(song.sourceUrl)}`);
}

export async function downloadTo(
  song: Song,
  path: string,
  progress?: (buf: number, total: number) => boolean
) {
  const resp = await fetch(song.sourceUrl)
  const total = (() => {
    const length = resp.headers.get("content-length")
    if (length) return Number.parseInt(length)
    return -1
  })()
  if (!resp.body) throw new TypeError("resp don't have a body");
  progress?.(0, total)

  const file = await Deno.open(path, { create: true, write: true, truncate: true })
  const writer = file.writable.getWriter()

  for await (const buf of resp.body) {
    if (progress?.(buf.length, total)) throw new Error("interrupted")
    await writer.write(buf)
  }

  await writer.close()
}

export async function download(
  cid: string,
  name?: string,
  progress?: (buf: number, total: number) => boolean
) {
  const song1 = await song(cid)
  const path = name ?? generatePath(song1)
  await downloadTo(song1, path, progress)
  return path
}

export async function dlIn(
  cid: string,
  name?: string,
  progress?: (buf: number, total: number) => boolean
) {
  const song1 = await song(cid)
  const path = name ?? generatePath(song1)
  if (await exists(path)) {
    if (progress?.(0, 0)) throw new Error("interrupted")
    return path
  }
  await downloadTo(song1, path, progress)
  return path
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

if (import.meta.main) {
  const { MultiBar: ProgressBar, Presets } = await import('npm:cli-progress')
  const bar = new ProgressBar({ hideCursor: true }, Presets.shades_classic)
  const status: (any | undefined)[] = Deno.args.map(_ => void 0)
  const tasks = Deno.args.map(async (cid, idx) => {
    let play = false
    if (cid.startsWith("play:")) {
      cid = cid.slice("play:".length)
      play = true
    }
    let progress = 0
    const path = await dlIn(cid, void 0, (buf, total) => {
      progress += buf
      if (!status[idx])
        status[idx] = bar.create(total, progress)
      else status[idx].update(progress)
      return false
    })
    if (play) return [path, ffplay(path)] as const
    return [path, void 0]
  })
  await Promise.all(tasks)
  bar.stop()
}
