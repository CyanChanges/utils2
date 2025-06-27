import {
  download,
  generatePath,
  LocalSongMeta,
  readMeta,
  songs, writeMeta,
} from "./msr.ts";
import { encodeBase64 } from "jsr:@std/encoding";
import { MultiProgressBar } from "jsr:@deno-library/progress";

const BATCH_COUNT = 10;

const allSongs = await songs();

const songDetails = await Promise.all(allSongs.map((song) => song.detail()));

const meta = readMeta();

const tasks: Promise<void>[] = [];

for (const detail of songDetails) {
  using metaInfo: typeof LocalSongMeta.inferOut & { [Symbol.dispose](): void } =
    {
      cid: detail.cid,
      data: detail.data,
      path: generatePath(detail),
      b3sum: null as string | null,
      [Symbol.dispose]() {
        meta.entries[detail.cid] = this;
      },
    };
  const dl = async () => {
    console.log("Requesting [%s] %s", detail.cid, detail.name)
    const resp = await fetch(detail.sourceUrl);
    if (resp.status !== 200) {
      throw new Error("unexpected status", {
        cause: new Error(`Expect status to be 200, got ${resp.status}`),
      });
    }
    console.log("Downloading [%s] %s", detail.cid, detail.name)
    const blob = await resp.blob()
    console.log("Writing     [%s] %s", detail.cid, detail.name)
    await Deno.writeFile(metaInfo.path!, await blob.bytes())
    console.log("Checksum    [%s] %s", detail.cid, detail.name)
    const digest = await crypto.subtle.digest(
      "BLAKE3",
      await Deno.readFile(metaInfo.path!),
    );
    metaInfo.b3sum = encodeBase64(digest);
    metaInfo[Symbol.dispose]();
  };
  tasks.push(dl());
  if (tasks.length > BATCH_COUNT) {
    await Promise.all(tasks);
    tasks.length = 0;
  }
}

writeMeta(meta)
