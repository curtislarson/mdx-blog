/** @jsx h */
import { h } from "../../deps.ts";
import PrettyDate from "./PrettyDate.tsx";

export interface PostCardProps {
  readonly title: string;
  readonly href: string;
  readonly date?: Date;
  readonly preview?: string;
  readonly tags?: string[];
}

export default function PostCard(props: PostCardProps) {
  return (
    <div class="mt-8 first:mt-0 px-8 py-8 bg-white shadow-xl shadow-slate-700/10 ring-1 ring-gray-900/5">
      <h3 class="text-2xl font-bold">{props.title}</h3>
      <p class="text-gray-500/80">{props.date && <div>{props.date}</div>}</p>
      <p class="mt-3 text-gray-600 dark:text-gray-400">{props.preview}</p>
      <div class="mt-8 flex flex-row">
        <div class="basis-1/4">
          <a
            class="leading-tight  text-gray-900 dark:text-gray-100 border-b-1 border-gray-600 hover:text-gray-500 hover:border-gray-500 transition-colors"
            href={props.href}
            title={`Read "${props.title}"`}
          >
            Read More
          </a>
        </div>
        <div class="basis-1/2">
          {props.tags &&
            props.tags.map((tag) => (
              <div key={tag} class="inline-flex items-center justify-center h-5 text-sm px-2 border-1 rounded-md mx-2">
                {tag}
              </div>
            ))}
        </div>
        <div class="basis-1/4 text-right">
          {props.date && (
            <p class="text-gray-600 dark:text-gray-400">
              <PrettyDate date={props.date} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
