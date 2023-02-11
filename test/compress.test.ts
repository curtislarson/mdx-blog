import { compressAndBase64, decompressFromBase64 } from "../src/compress.ts";
import { assert, assertEquals } from "./test-deps.ts";

Deno.test("compress", async (t) => {
  await t.step("compress then decompress and verify same", () => {
    const data = Deno.readTextFileSync(new URL("../assets/daisyui.css", import.meta.url));
    const compressed = compressAndBase64(data);
    assert(typeof compressed === "string");
    assert(compressed.length < data.length);

    const decompressed = decompressFromBase64(compressed);
    assertEquals(data, decompressed);
  });
});
