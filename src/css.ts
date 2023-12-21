// Modified from https://github.com/ije/html/blob/main/plugins/unocss.ts
import { Preset, PurgeCSS, UnoGenerator, UserConfig, presetTypeography, presetUno } from "../deps.ts";
import { decompressFromBase64 } from "./assets/compress.ts";
import { DAISYUI_BASE64 } from "./assets/daisyui-base64.ts";
import { UNO_RESET_CSS } from "./assets/reset-css.ts";

export interface CSSConfig extends UserConfig {
  /** DaisyUI theme */
  theme?: string;
}

export function createCSSPurger() {
  const purgecss = new PurgeCSS();
  return async function purge(rawContent: string, rawCss: string[]) {
    return await purgecss.purge({
      content: [{ extension: "html", raw: rawContent }],
      css: rawCss.map((raw) => ({ raw })),
    });
  };
}

export function createCSSProcessor(config?: UserConfig) {
  const uno = new UnoGenerator({
    presets: [
      presetUno(),
      presetTypeography({
        cssExtend: {
          "h1": {
            color: "#BD93F9",
            "font-size": "1.75em",
          },
          "h2,h3,h4,h5": {
            color: "#BD93F9",
            "margin-top": ".5em",
          },
          "a": {
            color: "#8BE9FD",
            "text-decoration-line": "underline",
            cursor: "pointer",
          },
        },
      }),
    ] as unknown as Preset[],
    ...config,
  });
  const purge = createCSSPurger();
  const daisyUICss = decompressFromBase64(DAISYUI_BASE64);

  async function generate(body: string) {
    const { css } = await uno.generate(body);
    return [UNO_RESET_CSS, daisyUICss, css];
  }

  return {
    purge,
    generate,
  };
}
