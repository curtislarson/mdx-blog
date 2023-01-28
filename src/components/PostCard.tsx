/** @jsx h */
import { h } from "../../deps.ts";

export interface PostCardProps {
  readonly title: string;
  readonly href: string;
  readonly preview: string;
  readonly tags?: string[];
}

export default function PostCard(props: PostCardProps) {
  return (
    <div key={props.title} class="card w-96 bg-base-300 shadow-xl">
      <a href={props.href}>
        <div class="card-body">
          <h2 class="text-xl text-secondary card-title">{props.title}</h2>
          <p class="mt-3 text-base">{props.preview}</p>
          <div class="mt-4 flex items-center">
            <div class="flex space-x-1 text-sm">
              {props.tags &&
                props.tags.map((tag) => (
                  <div key={tag} class="badge badge-accent badge-outline mx-1">
                    {tag}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
