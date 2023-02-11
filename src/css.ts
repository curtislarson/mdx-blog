// Modified from https://github.com/ije/html/blob/main/plugins/unocss.ts
import type { Preset, UserConfig } from "https://esm.quack.id/@unocss/core@0.49.0";
import { UnoGenerator } from "https://esm.quack.id/@unocss/core@0.49.0";
import presetTypeography from "https://esm.quack.id/@unocss/preset-typography@0.49.0?bundle";
import presetUno from "https://esm.quack.id/@unocss/preset-uno@0.49.0?bundle";
import { PurgeCSS } from "https://esm.quack.id/purgecss@5.0.0";
import { decompressFromBase64 } from "./compress.ts";
import { DAISYUI_BASE64 } from "./daisyui-base64.ts";

export interface CSSConfig extends UserConfig {
  /** DaisyUI theme */
  theme?: string;
}

const unoResetCSS = `/* reset */
*,:before,:after{box-sizing:border-box;border:0 solid}html{-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;line-height:1.5}body{line-height:inherit;margin:0}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-color:#0000;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{margin:0;padding:0;list-style:none}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}
`;

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
    return [unoResetCSS, daisyUICss, css];
  }

  return {
    purge,
    generate,
  };
}
