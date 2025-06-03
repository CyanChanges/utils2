import { MONSTER_SIREN_API } from "./constants.ts";
import { AlbumsResponse, AlbumDetailResponse, SongResponse } from "./meta.ts";

export function albumsUrl() {
  return `${MONSTER_SIREN_API}/albums`
}

export async function albums() {
  const resp = await fetch(albumsUrl(), {
    headers: {
      'accept': 'application/json'
    }
  })
  const { data } = AlbumsResponse.assert(await resp.json())
  return data
}

export function albumDetailUrl(cid: string) {
  return `${MONSTER_SIREN_API}/album/${cid}/detail`
}

export async function albumDetailOf(cid: string) {
  const resp = await fetch(albumDetailUrl(cid), {
    headers: {
      'accept': 'application/json'
    }
  })
  const { data } = AlbumDetailResponse.assert(await resp.json())
  return data
}

export function songUrl(cid: string) {
  return `${MONSTER_SIREN_API}/song/${cid}`
}

export async function songOf(cid: string) {
  const resp = await fetch(songUrl(cid), {
    headers: {
      'accept': 'application/json'
    }
  })
  const { data } = SongResponse.assert(await resp.json())
  return data
}
