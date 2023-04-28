export interface PostFrontmatter extends Record<string, unknown> {
  title: string;
  preview?: string;
  date?: string | Date;
  author?: string;
  tags?: string[];
}

export interface ManifestEntry {
  filePath: string;
  stat: Deno.FileInfo;
}

export interface RecentPost extends ManifestEntry, Record<string, unknown> {
  title: string;
  href: string;
  preview?: string;
  tags?: string[];
  author?: string;
  date?: Date;
  frontmatter?: PostFrontmatter | null;
}
