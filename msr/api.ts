import { AlbumDetail } from "./oop.ts";
import { Collapse } from "../common/collapse.ts";
import * as meta from './meta.ts'
import * as raw from './raw.ts'

class AlbumDetailCollapse extends Collapse<AlbumDetail> {
  constructor(public _data: typeof meta.Album.inferOut) {
    super(async () => await AlbumDetail.fromCid(_data.cid));
  }

  get cid() {
    return this._data.cid
  }

  get name() {
    return this._data.name
  }

  get coverUrl() {
    return this._data.coverUrl
  }

  get artistes() {
    return this._data.artistes
  }

  detail() {
    throw new Collapse.CollapseTransform(x => x as AlbumDetail)
  }
}

export async function albums(): Promise<AlbumDetailCollapse[]> {
  const albums = await raw.albums()
  return albums.map(x => new AlbumDetailCollapse(x))
}
