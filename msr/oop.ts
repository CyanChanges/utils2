import * as meta from './meta.ts'
import { albumDetailOf, songOf } from "./raw.ts";

export class AlbumDetail {
  data: typeof meta.AlbumDetail.infer

  constructor(data: typeof meta.AlbumDetail.inferIn) {
    this.data = meta.AlbumDetail.assert(data)
  }

  static async fromCid(cid: string) {
    const detail = await albumDetailOf(cid)
    return new AlbumDetail(detail)
  }

  get cid() {
    return this.data.cid
  }

  get name() {
    return this.data.name
  }

  get intro() {
    return this.data.intro
  }

  get belong() {
    return this.data.belong
  }

  get coverUrl() {
    return this.data.coverUrl
  }

  get coverDeUrl() {
    return this.data.coverDeUrl
  }

  get songs() {
    return this.data.songs
  }

  keys() {
    return this.data.songs.map(x => x.cid)
  }

  values() {
    return this.data.songs.map(x => x)
  }

  entries() {
    return this.data.songs.map(x => [x.cid, x] as const)
  }
}

export class Song {
  data: typeof meta.Song.infer

  constructor(data: typeof meta.Song.inferIn) {
    this.data = meta.Song.assert(data)
  }

  static async fromCid(cid: string) {
    const detail = await songOf(cid);
    return new Song(detail)
  }

  get sourceUrl() {
    return this.data.sourceUrl
  }

  get lyricUrl() {
    return this.data.lyricUrl
  }

  get mvUrl() {
    return this.data.mvUrl
  }

  get mvCoverUrl() {
    return this.data.mvCoverUrl
  }

  get artists() {
    return this.data.artists
  }
}
