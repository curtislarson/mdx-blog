/** @jsx h */
import { h } from "../../deps.ts";

export interface PostProps {
  children: any;
  title?: string;
  preview?: string;
}

export default function Post(props: PostProps) {
  return (
    <div class="py-8 flex flex-col justify-center relative overflow-hidden lg:py-12">
      <div class="relative w-full px-6 py-12 bg-base-300 shadow-xl shadow-slate-700/10 ring-gray-900/5 md:max-w-3xl md:mx-auto lg:max-w-4xl lg:pt-16 lg:pb-28">
        <div class="flex flex-col">
          {props.title && <h1 class="flex-1 text-4xl font-bold text-secondary text-center">{props.title}</h1>}
          <article class="flex-1 text-base prose prose-white lg:text-lg mt-4">
            {props.preview && <h4>{props.preview}</h4>}
            {props.children}
          </article>
        </div>
      </div>
    </div>
  );
}
