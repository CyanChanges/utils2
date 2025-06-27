import * as constants from "./constants.ts";
import {
  AlbumDetailResponse,
  AlbumsResponse,
  SongResponse,
  SongsResponse,
} from "./meta.ts";
import type * as meta from "./meta.ts";

// deno-lint-ignore prefer-const
export let endpoint = constants.MONSTER_SIREN_API;

function assertStatus(resp: Response) {
  if (resp.status !== 200) {
    throw new Error(`request failed with status ${resp.status}`);
  }
}

/**
 * albums url
 *
 * @description /albums
 */
export function albumsUrl(): URL {
  return new URL("albums", endpoint);
}

/**
 * fetch albums
 *
 * @description fetch /albums
 */
export async function albums(): Promise<typeof meta.Albums.infer> {
  const resp = await fetch(albumsUrl(), {
    headers: {
      "accept": "application/json",
    },
  });
  assertStatus(resp);
  const { data } = AlbumsResponse.assert(await resp.json());
  return data;
}

/**
 * album detail url
 *
 * @description /album/:cid/detail
 */
export function albumDetailUrl(cid: string): URL {
  return new URL(`album/${cid}/detail`, endpoint);
}

/**
 * fetch album detail
 *
 * @description fetch /album/:cid/detail
 */
export async function albumDetailOf(
  cid: string,
): Promise<typeof meta.AlbumDetail.infer> {
  const resp = await fetch(albumDetailUrl(cid), {
    headers: {
      "accept": "application/json",
    },
  });
  assertStatus(resp);
  const { data } = AlbumDetailResponse.assert(await resp.json());
  return data;
}

/**
 * song url
 *
 * @description /song/:cid
 */
export function songUrl(cid: string): URL {
  return new URL(`song/${cid}`, endpoint);
}

/**
 * fetch song (detail)
 *
 * @description fetch /song/:cid
 */
export async function songOf(
  cid: string,
): Promise<typeof meta.SongDetail.infer> {
  const resp = await fetch(songUrl(cid), {
    headers: {
      "accept": "application/json",
    },
  });
  assertStatus(resp);
  const { data } = SongResponse.assert(await resp.json());
  return data;
}

/**
 * songs url
 *
 * @description /songs
 */
export function songsUrl(): URL {
  return new URL("songs", endpoint);
}

/**
 * fetch songs
 *
 * @description fetch /songs
 */
export async function songs(): Promise<typeof meta.Songs.infer> {
  const resp = await fetch(songsUrl(), {
    headers: {
      "accept": "application/json",
    },
  });
  assertStatus(resp);
  const { data: { list } } = SongsResponse.assert(await resp.json());
  return list;
}
