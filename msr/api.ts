import { Album, Song } from "./oop.ts";
import { Collapse } from "@cyans/common/collapse";
import type * as meta from "./meta.ts";
import * as raw from "./raw.ts";

/**
 * Collapsable Album
 *
 * Could asynchronously collapse to an `Album`
 */
class AlbumDetailCollapse extends Collapse<Album> {
  constructor(public _data: typeof meta.Album.infer) {
    super(async () => await Album.fromCid(_data.cid));
  }

  /**
   * The cid of the album
   */
  get cid(): string {
    return this._data.cid;
  }

  /**
   * Name of the album
   */
  get name(): string {
    return this._data.name;
  }

  /**
   * Cover URL of the album
   */
  get coverUrl(): string {
    return this._data.coverUrl;
  }

  /**
   * Artistes of the album
   */
  get artistes(): string[] {
    return this._data.artistes;
  }

  /**
   * Collapse to `Album`
   */
  detail(): Promise<Album> {
    throw new Collapse.Transform((x) => x as Album);
  }
}

/**
 * Collapse Song
 *
 * Could asynchronously collapse to an `Song`
 */
class SongDetailCollapse extends Collapse<Song> {
  constructor(public _data: typeof meta.Song.infer) {
    super(async () => await Song.fromCid(_data.cid));
  }

  /**
   * The cid of the song
   */
  get cid(): string {
    return this._data.cid;
  }

  /**
   * Name of the song
   */
  get name(): string {
    return this._data.name;
  }

  /**
   * The cid of the album this song belongs to
   */
  get albumCid(): string {
    return this._data.albumCid;
  }

  /**
   * Artistes of the song
   */
  get artists(): string[] {
    return this._data.artists;
  }

  /**
   * Collapse to `Song`
   */
  detail(): Promise<Song> {
    throw new Collapse.Transform((x) => x as Song);
  }
}

/**
 * Get all albums in MSR
 *
 * @example Fetch all albums
 * ```ts
 * import { albums } from '@msr/msr/api'
 * const albums = await albums()
 * albums[0]
 * // AlbumDetailCollapse {
 * //   _data: {
 * //     cid: "1010",
 * //     name: "Grow on My Time",
 * //     coverUrl: "https://web.hycdn.cn/siren/pic/20250606/02da85b2cc73f426ef6cfec4910d31d9.jpg",
 * //     artistes: [ "塞壬唱片-MSR" ]
 * //   }
 * // }
 * albums[0].name // "Grow on My Time"
 */
export async function albums(): Promise<AlbumDetailCollapse[]> {
  const albums = await raw.albums();
  return albums.map((x) => new AlbumDetailCollapse(x));
}

/**
 * Album (detail) from cid or raw `Album` structure or an object with cid
 *
 * @example Album from cid
 * ```ts
 * import { album } from '@msr/msr/api'
 * import { assertEquals } from '@std/assert'
 *
 * const favAlbum = await album("1010")
 * assertEquals(favAlbum.name, "Grow on My Time")
 * ```
 *
 * @example Song from AlbumSong
 * ```ts
 * import { song, album } from '@msr/msr/api'
 * import * as raw from '@msr/msr/raw'
 * import { assertEquals } from '@std/assert'
 *
 * const rawAlbums = await raw.albums()
 * const favAlbum = await album(rawAlbums[0])
 * assertEquals(favAlbum.name, "Grow on My Time")
 * ```
 */
export async function album(value: { cid: string | number } | typeof meta.Album.infer | string | number): Promise<Album> {
  if (typeof value === "string" || typeof value === "number")
    return await Album.fromCid(`${value}`)
  return await Album.fromRawAlbum(value as typeof meta.Album.infer)
}

/**
 * Get all albums in MSR
 *
 * @example Fetch all songs
 * ```ts
 * import { songs } from '@msr/msr/api'
 * const albums = await songs()
 * songs[0]
 * // {
 * //   "cid": "125042",
 * //   "name": "Sanctuary Inside",
 * //   "albumCid": "5194",
 * //   "artists": [
 * //     "塞壬唱片-MSR"
 * //   ]
 * // },
 * albums[0].name // "Sanctuary Inside"
 */
export async function songs(): Promise<SongDetailCollapse[]> {
  const songs = await raw.songs();
  return songs.map((x) => new SongDetailCollapse(x));
}

/**
 * Song (detail) from cid or `AlbumSong` structure or an object with cid
 *
 * @example Song from cid
 * ```ts
 * import { song } from '@msr/msr/api'
 * import { assertEquals } from '@std/assert'
 *
 * const favSong = await song("697699")
 * assertEquals(favSong.name, "Grow on My Time")
 * ```
 *
 * @example Song from AlbumSong
 * ```ts
 * import { song, album } from '@msr/msr/api'
 * import { assertEquals } from '@std/assert'
 *
 * const favAlbum = await album("1010")
 * const favSong = await song(favAlbum.songs[0])
 * assertEquals(favSong.name, "Grow on My Time")
 * ```
 */
export async function song(value: { cid: string | number } | typeof meta.AlbumSong.infer | string | number): Promise<Song> {
  if (typeof value === "string" || typeof value === "number")
    return await Song.fromCid(`${value}`)
  return await Song.fromAlbumSong(value as typeof meta.AlbumSong.infer)
}
