import { decode, encode } from "https://deno.land/std@0.177.0/encoding/base64.ts";
import { deflate, Foras, inflate } from "https://raw.githubusercontent.com/hazae41/foras/2.0.8/src/deno/mod.ts";

export function compressAndBase64(data: string) {
  Foras.initSyncBundledOnce();
  const bytes = new TextEncoder().encode(data);
  const compressed = deflate(bytes);
  return encode(compressed);
}

export function decompressFromBase64(base64: string) {
  Foras.initSyncBundledOnce();
  const inflated = inflate(decode(base64));
  return new TextDecoder().decode(inflated);
}
