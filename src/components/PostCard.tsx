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
    <div class="card w-[28rem] bg-base-300 shadow-xl mb-6">
      <div class="card-body">
        <h3 class="card-title text-2xl text-secondary">{props.title}</h3>
        <div class="mt-2 flex flex-col">
          <div class="flex flex-row">
            <div class="basis-1/4 text-right">
              {props.date && (
                <p class="text-gray-500">
                  <PrettyDate date={props.date} />
                </p>
              )}
            </div>
            <div class="ml-2 text-sm">
              {props.tags &&
                props.tags.map((tag) => (
                  <div key={tag} class="badge badge-accent badge-outline ml-2">
                    {tag}
                  </div>
                ))}
            </div>
          </div>
          <p class="mt-3 text-base">{props.preview}</p>
          <div class="card-actions mt-4">
            <a class="btn btn-primary" href={props.href} title={`Read "${props.title}"`}>
              Read More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
