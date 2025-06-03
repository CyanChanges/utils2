import { type } from 'arktype'

export const OkResponseTemplate = <T>(t: T) => ({
  code: type("0").describe("okay code") as unknown as '0',
  msg: "string",
  data: t
} as const);
export const Album = type({
  cid: "string",
  name: "string",
  coverUrl: "string.url",
  artistes: 'string[]'
})
export const Albums = type(Album, '[]')
export const AlbumSong = type({
  cid: "string",
  name: "string",
  artistes: 'string[]'
})
export const AlbumDetail = type({
  cid: "string",
  name: "string",
  intro: "string",
  belong: "string",
  coverUrl: "string.url",
  coverDeUrl: "string.url",
  songs: type(AlbumSong, '[]')
})
export const Song = type({
  cid: "string",
  name: "string",
  albumCid: "string",
  sourceUrl: 'string.url',
  lyricUrl: 'string.url | null',
  mvUrl: 'string.url | null',
  mvCoverUrl: 'string.url | null',
  artists: 'string[]'
})
export const AlbumsResponse = type(OkResponseTemplate(Albums))
  .describe("okay response")
export const AlbumDetailResponse = type(OkResponseTemplate(AlbumDetail))
  .describe("okay response")
export const SongResponse = type(OkResponseTemplate(Song))
  .describe("okay response")
