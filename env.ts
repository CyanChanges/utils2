import { join } from "jsr:@std/path";

export const HOME = Deno.env.get("HOME")!;

export const OHMYPOSH_CONFIG = join(HOME, ".config/ohmyposh/config.toml");
