import { h } from "../../deps.ts";

export default function c() {
  return (
    <footer class="mt-20 pb-16">
      <p class="text-center gap-2.5 text-gray-400/800 dark:text-gray-500/800 text-sm">
        <span>
          Created By{" "}
          <a
            class="tems-center gap-1 underline hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            href="https://quack.software"
          >
            QuackWare
          </a>
        </span>
      </p>
    </footer>
  );
}
