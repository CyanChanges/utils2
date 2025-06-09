import { type Type, type } from "arktype";

/**
 * Ok Response Template for MSR APIs
 * @param t
 * @constructor
 */
export const OkResponseTemplate: <T>(t: T) => OkResponseTemplate<T> = <T>(
  t: T,
) => ({
  code: type.unit(0).describe("okay code") as unknown as "0",
  msg: type.string,
  data: t,
} as const);
export type OkResponseTemplate<T> = {
  code: "0";
  msg: Type<string>;
  data: T;
};
type OkTemplateInferT<T> = Type<{
  code: 0;
  msg: string;
  data: T;
}>;
/**
 * Album
 */
export const Album: Type<{
  cid: string;
  name: string;
  coverUrl: string;
  artistes: string[];
}> = type({
  cid: "string",
  name: "string",
  coverUrl: "string.url",
  artistes: "string[]",
});
/**
 * Albums (`Album[]`)
 */
export const Albums: Type<(typeof Album.infer)[]> = type(Album, "[]");
/**
 * Song representation in an `AlbumDetail`
 */
export const AlbumSong: Type<{
  cid: string;
  name: string;
  artistes: string[];
}> = type({
  cid: "string",
  name: "string",
  artistes: "string[]",
});
/**
 * AlbumDetail
 */
export const AlbumDetail: Type<{
  cid: string;
  name: string;
  intro: string;
  belong: string;
  coverUrl: string;
  coverDeUrl: string;
  songs: (typeof AlbumSong.infer)[];
}> = type({
  cid: "string",
  name: "string",
  intro: "string",
  belong: "string",
  coverUrl: "string.url",
  coverDeUrl: "string.url",
  songs: type(AlbumSong, "[]"),
});
/**
 * Song
 */
export const Song: Type<{
  cid: string;
  name: string;
  albumCid: string;
  artists: string[];
}> = type({
  cid: "string",
  name: "string",
  albumCid: "string",
  artists: "string[]",
});
export const Songs: Type<(typeof Song.infer)[]> = type(Song, "[]");
/**
 * Song (detail)
 */
export const SongDetail: Type<{
  cid: string;
  name: string;
  albumCid: string;
  sourceUrl: string;
  lyricUrl: string | null;
  mvUrl: string | null;
  mvCoverUrl: string | null;
  artists: string[];
}> = type({
  cid: "string",
  name: "string",
  albumCid: "string",
  sourceUrl: "string.url",
  lyricUrl: "string.url | null",
  mvUrl: "string.url | null",
  mvCoverUrl: "string.url | null",
  artists: "string[]",
});
/**
 * Okay Response for /albums
 */
export const AlbumsResponse: OkTemplateInferT<typeof Albums.infer> = type(
  OkResponseTemplate(Albums),
)
  .describe("okay response");
/**
 * Okay Response for /album/:cid/detail
 */
export const AlbumDetailResponse: OkTemplateInferT<typeof AlbumDetail.infer> =
  type(OkResponseTemplate(AlbumDetail))
    .describe("okay response");
/**
 * Okay Response for /songs
 */
export const SongsResponse: OkTemplateInferT<typeof Songs.infer> = type(
  OkResponseTemplate(Songs),
)
  .describe("okay response");
/**
 * Okay Response for /song/:cid
 */
export const SongResponse: OkTemplateInferT<typeof SongDetail.infer> = type(
  OkResponseTemplate(SongDetail),
)
  .describe("okay response");
