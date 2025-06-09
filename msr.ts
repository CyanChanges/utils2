import { song } from './msr/api.ts'
export * from "./msr/api.ts";
export * from "./msr/oop.ts";
export * as meta from "./msr/meta.ts";
import { resolve, extname } from 'jsr:@std/path'
import { exists } from 'jsr:@std/fs'
import { Song } from "./msr/oop.ts";
import { ensureDir } from "jsr:@std/fs/ensure-dir";
import { type } from 'arktype'
import { crypto } from 'jsr:@std/crypto'
import { SongDetail } from "./msr/meta.ts";
import { ensureFile } from "jsr:@std/fs/ensure-file";
import { encodeBase64 } from 'jsr:@std/encoding'

export const DOWNLOAD_PATH = resolve(Deno.env.get("HOME") ?? './', 'Music/', 'msr/')
export const META_PATH = resolve(DOWNLOAD_PATH, "metadata.json");

export const LocalSongMeta = type({
  cid: 'string',
  data: SongDetail,
  path: 'string | null',
  b3sum: 'string | null'
})
export const Meta = type({
  version: '0',
  entries: type({ "[string]": LocalSongMeta })
})

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
  song_: Song | string,
  name?: string,
  progress?: (buf: number, total: number) => boolean
) {
  if (typeof song_ === 'string') song_ = await song(song_)
  const path = name ?? generatePath(song_)
  await downloadTo(song_, path, progress)
  return path
}

export async function dlIn(
  song_: Song | string,
  name?: string,
  progress?: (buf: number, total: number) => boolean
) {
  if (typeof song_ === 'string') song_ = await song(song_)
  const path = name ?? generatePath(song_)
  if (await exists(path)) {
    if (progress?.(0, 0)) throw new Error("interrupted")
    return path
  }
  await downloadTo(song_, path, progress)
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
  await ensureDir(DOWNLOAD_PATH)
  await ensureFile(META_PATH)
  const { MultiBar: ProgressBar, Presets } = await import('npm:cli-progress')
  const bar = new ProgressBar({ hideCursor: true }, Presets.shades_classic)
  const meta: typeof Meta.infer = (() => {
    const state = Deno.readTextFileSync(META_PATH)
    try {
      return Meta.assert(JSON.parse(state))
    } catch (e) {
      if (state.trim().length) {
        console.error(e)
      }
      return {
        version: 0,
        entries: {}
      } satisfies typeof Meta.infer
    }
  })()
  const status: (any | undefined)[] = Deno.args.map(_ => void 0)
  const tasks = Deno.args.map(async (cid, idx) => {
    let play = false
    if (cid.startsWith("play:")) {
      cid = cid.slice("play:".length)
      play = true
    }
    const song_metadata: typeof LocalSongMeta.infer = await (async () => {
      if (meta.entries[cid]) return meta.entries[cid]
      const metadata = {
        cid: cid,
        data: (await song(cid)).data,
        path: null,
        b3sum: null
      }
      return meta.entries[cid] = metadata
    })()
    let progress = 0
    const progressFn = (buf: number, total: number) => {
      if (total === -1) return true
      progress += buf
      if (!status[idx])
        status[idx] = bar.create(total, progress)
      else status[idx].update(progress)
      return false
    }
    if (!song_metadata.path)
      song_metadata.path = await download(new Song(song_metadata.data), void 0, progressFn)
    else
      song_metadata.path = await dlIn(new Song(song_metadata.data), void 0, progressFn)
    const digest = await crypto.subtle.digest("BLAKE3", await Deno.readFile(song_metadata.path))
    const digestB64 = encodeBase64(digest)
    if (song_metadata.b3sum !== digestB64 && song_metadata.b3sum !== null) {
      console.info(`%cChecksum failed for ${cid}, redownloading`, 'color: aqua;')
      song_metadata.path = await download(new Song(song_metadata.data), void 0, progressFn)
    }
    if (play) return [song_metadata, ffplay(song_metadata.path)] as const
    return [song_metadata, void 0]
  })
  await Promise.all(tasks)
  await Deno.writeTextFile(META_PATH, JSON.stringify(meta, void 0, 2))
  bar.stop()
}
