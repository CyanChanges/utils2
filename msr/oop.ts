import * as meta from "./meta.ts";
import { albumDetailOf, songOf } from "./raw.ts";

/**
 * Album Object
 *
 * @example Fetch Album
 *
 * ```ts
 * import { Album } from "@msr/msr/oop"
 * import { assertEquals } from "@std/assert"
 *
 * const album = await Album.fromCid("1010")
 * assertEquals(album.cid, "1010")
 * assertEquals(album.name, "Grow on My Time")
 * assertEquals(album.songs[0], { cid: "697699", name: "Grow on My Time", artistes: [ "塞壬唱片-MSR" ] })
 * ```
 */
export class Album {
  data: typeof meta.AlbumDetail.infer;

  constructor(data: typeof meta.AlbumDetail.inferIn) {
    this.data = meta.AlbumDetail.assert(data);
  }

  /**
   * Fetch `Album` from album cid
   * @param cid the cid of the album
   *
   * @example
   *
   * ```ts ignore
   * import { Album } from "@msr/msr/oop"
   *
   * const album = await Album.fromCid("1010")
   * album.cid // "1010"
   * album.name // "Grow on My Time"
   * ```
   */
  static async fromCid(cid: string): Promise<Album> {
    const detail = await albumDetailOf(cid);
    return new Album(detail);
  }

  /**
   * Album from raw `Album`
   *
   * @param album raw `Album` from `raw.albums()` or elsewhere
   *
   * @example
   * ```ts ignore
   * import { Album } from '@msr/msr/oop'
   * import * as raw from '@msr/msr/raw'
   * import { assertEquals } from '@std/assert'
   *
   * const rawAlbums = await raw.albums()
   * const album = Album.fromRawAlbum(rawAlbums[0])
   * assertEquals(album.name, "Grow on My Time")
   */
  static async fromRawAlbum(album: typeof meta.Album.infer): Promise<Album> {
    return await Album.fromCid(album.cid);
  }

  /**
   * The cid of the album
   *
   * @example Get cid for album 1010
   * ```ts ignore
   * import { Album } from "@msr/msr/oop"
   *
   * const album = await Album.fromCid("1010")
   * console.log(album.cid) // "1010"
   * ```
   */
  get cid(): string {
    return this.data.cid;
  }

  /**
   * Name of the album
   *
   * @example Get name for album 1010
   * ```ts ignore
   * import { Album } from "@msr/msr/oop"
   *
   * const album = await Album.fromCid("1010")
   * console.log(album.name) // "Grow on My Time"
   * ```
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * Intro of the album
   *
   * @example Get intro for album 1010
   * ```ts ignore
   * import { Album } from "@msr/msr/oop"
   *
   * const album = await Album.fromCid("1010")
   * console.log(a1010.intro) // "傍晚的风送来远空的呢喃，\n教室窗外的花木披上茜色，\n我们沿着长廊舒展步调，\n明天的可能性还在生长。"
   * ```
   */
  get intro(): string {
    return this.data.intro;
  }

  /**
   * Belonging of the album
   */
  get belong(): string {
    return this.data.belong;
  }

  /**
   * Cover URL of the album (square)
   *
   * @example Get Cover URL for album 1010
   * ```ts ignore
   * import { Album } from "@msr/msr/oop"
   *
   * const album = await Album.fromCid("1010")
   * console.log(a1010.coverUrl) // "https://web.hycdn.cn/siren/pic/20250606/02da85b2cc73f426ef6cfec4910d31d9.jpg"
   * ```
   */
  get coverUrl(): string {
    return this.data.coverUrl;
  }

  /**
   * Cover URL for the album (horizontal)
   *
   * @example Get Cover (De) URL for album 1010
   * ```ts ignore
   * import { Album } from "@msr/msr/oop";
   *
   * const album = await Album.fromCid("1010")
   * console.log(a1010.coverDeUrl) // "https://web.hycdn.cn/siren/pic/20250606/7b821a38645a038f902b10e33e9939f6.jpg"
   * ```
   */
  get coverDeUrl(): string {
    return this.data.coverDeUrl;
  }

  /**
   * All Song in the album
   *
   * @example Get All song for album 1010
   * ```ts ignore
   * import { Album } from "@msr/msr/oop"
   *
   * const album = await Album.fromCid("1010")
   * assertEquals(a1010.songs, [
   *   { cid: "697699", name: "Grow on My Time", artistes: [ "塞壬唱片-MSR" ] },
   *   {
   *     cid: "232234",
   *     name: "Grow on My Time (Instrumental)",
   *     artistes: [ "塞壬唱片-MSR" ]
   *   }
   * ])
   * ```
   */
  get songs(): (typeof meta.AlbumSong.infer)[] {
    return this.data.songs;
  }

  /**
   * All Song cid in the album
   */
  keys(): string[] {
    return this.data.songs.map((x) => x.cid);
  }

  /**
   * All Song in the album
   */
  values(): (typeof meta.AlbumSong.infer)[] {
    return this.data.songs.map((x) => x);
  }

  /**
   * All Song entries in the album (`[cid, AlbumSong]`)
   */
  entries(): [string, typeof meta.AlbumSong.infer][] {
    return this.data.songs.map((x) => [x.cid, x] as const);
  }
}

/**
 * Song Object
 *
 * @example Fetch Song
 * ```ts
 * import { Song } from '@msr/msr/oop'
 * import { assertEquals } from "@std/assert"
 *
 * const song = await Song.fromCid("697699")
 * assertEquals(song.cid, "697699")
 * assertEquals(song.albumCid, "1010")
 * assertEquals(song.name, "Grow on My Time")
 * ```
 */
export class Song {
  data: typeof meta.SongDetail.infer;

  constructor(data: typeof meta.SongDetail.inferIn) {
    this.data = meta.SongDetail.assert(data);
  }

  /**
   * Song from `AlbumSong`
   *
   * @param albumSong AlbumSong from Album::songs or elsewhere
   *
   * @example
   * ```ts ignore
   * import { Album, Song } from '@msr/msr/oop'
   * import { assertEquals } from '@std/assert'
   *
   * const favAlbum = await Album.fromCid("1010")
   * const song = Song.fromAlbumSong(favAlbum.songs[0])
   * assertEquals(song.name, "Grow on My Time")
   */
  static async fromAlbumSong(
    albumSong: typeof meta.AlbumSong.infer,
  ): Promise<Song> {
    return await Song.fromCid(albumSong.cid);
  }

  /**
   * Fetch `Song` from song cid
   * @param cid the cid of the song
   *
   * @example
   *
   * ```ts ignore
   * import { Song } from "@msr/msr/oop"
   *
   * const song = await Song.fromCid("697699")
   * song.cid // "697699"
   * song.name // "Grow on My Time"
   * ```
   */
  static async fromCid(cid: string): Promise<Song> {
    const detail = await songOf(cid);
    return new Song(detail);
  }

  /**
   * Name of the song
   *
   * @example
   * ```ts ignore
   * import { Song } from '@msr/msr/oop'
   * import { assertEquals } from '@std/assert'
   *
   * const song = await Song.fromCid("697699")
   * assertEquals(song.name, "Grow on My Time")
   */
  get name(): string {
    return this.data.name;
  }

  /**
   * The cid of the song
   *
   * @example
   * ```ts ignore
   * import { Song } from '@msr/msr/oop'
   * import { assertEquals } from '@std/assert'
   *
   * const song = await Song.fromCid("697699")
   * assertEquals(song.cid, "697699")
   */
  get cid(): string {
    return this.data.cid;
  }

  /**
   * The cid of the album this song belongs to
   *
   * @example
   * ```ts ignore
   * import { Song } from "@msr/msr/oop"
   * import { assertEquals } from "@std/assert"
   *
   * const song = await Song.fromCid("697699")
   * assertEquals(song.albumCid, "1010")
   * ```
   */
  get albumCid(): string {
    return this.data.albumCid;
  }

  /**
   * Song source URL
   */
  get sourceUrl(): string {
    return this.data.sourceUrl;
  }

  /**
   * Song lyric URL
   */
  get lyricUrl(): string | null {
    return this.data.lyricUrl;
  }

  /**
   * Song MV URL
   */
  get mvUrl(): string | null {
    return this.data.mvUrl;
  }

  /**
   * Song MV cover URL
   */
  get mvCoverUrl(): string | null {
    return this.data.mvCoverUrl;
  }

  /**
   * Song artists
   *
   * @example Artists for song 697699
   * ```ts ignore
   * import { Song } from '@msr/msr/oop'
   * import { assert } from "@std/assert"
   *
   * const song = await Song.fromCid("697699")
   * song.artists // [ "塞壬唱片-MSR" ]
   * assert(song.artists.includes("塞壬唱片-MSR"))
   */
  get artists(): string[] {
    return this.data.artists;
  }
}
