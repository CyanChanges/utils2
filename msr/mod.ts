/**
 * Easy-to-use Monster Siren Kit
 *
 * ```ts ignore
 * import { albums, album, song } from '@msr/msr'
 * import { assertEquals } from '@std/assert'
 *
 * const allAlbums = await albums() // All albums
 * const favAlbum = await album("1010") // album by cid
 * const favSong = await song("697699") // song by cid
 * const sameSong = await song(favAlbum.songs[0]) // song by AlbumSong
 *
 * assertEquals(favAlbum.name, "Grow on My Time")
 * assertEquals(favSong.name, "Grow on My Time")
 * assertEquals(favSong.name, sameSong.name)
 *
 * // Download the song
 * const favSongResp = await fetch(favSong.sourceUrl)
 * const ab = favSongResp.arrayBuffer()
 *
 * // Yay!~
 * await Deno.writeFile("./s697699_Grow_on_My_Time.wav", new Uint8Array(ab))
 * ```
 *
 * @module
 */

export * from "./api.ts";
export * from "./oop.ts";
export * as meta from "./meta.ts";
