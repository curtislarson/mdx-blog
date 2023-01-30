/** @jsx h */
import { h } from "../../deps.ts";

export interface PrettyDateProps {
  date: Date;
}

export default function PrettyDate({ date }: PrettyDateProps) {
  const isoString = date.toISOString();
  return <time dateTime={isoString}>{isoString.split("T")[0]}</time>;
}
