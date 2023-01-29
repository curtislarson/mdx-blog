/** @jsx h */
import { h } from "../../deps.ts";

export interface PostCardProps {
  readonly title: string;
  readonly href: string;
  readonly date?: Date;
  readonly preview?: string;
  readonly tags?: string[];
}

export default function PostCard(props: PostCardProps) {
  return (
    <a key={props.title} href={props.href}>
      <div class="pt-12 first:pt-0">
        <h3 class="text-2xl font-bold">{props.title}</h3>
        {props.tags && props.tags.map((t) => <span>{t}</span>)}
        <p class="text-gray-500/80">{props.date && <div>{props.date}</div>}</p>
        <p class="mt-3 text-gray-600 dark:text-gray-400">{props.preview}</p>
        <p class="mt-3">
          <a
            class="leading-tight text-gray-900 dark:text-gray-100 inline-block border-b-1 border-gray-600 hover:text-gray-500 hover:border-gray-500 transition-colors"
            href={props.href}
            title={`Read "${props.title}"`}
          >
            Read More
          </a>
        </p>
      </div>
    </a>
  );
}
