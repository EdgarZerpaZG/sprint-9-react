export type ContentStatus = "draft" | "published";

export type BlockType =
  | "title"
  | "paragraph"
  | "image"
  | "richtext"
  | "hero"
  | "columns"
  | "divider";

export type BlockBase = {
  id: string;
  type: BlockType;
};

/* ──────────────────────────────
   Basic block
   ────────────────────────────── */

// Title block
export type TitleBlock = BlockBase & {
  type: "title";
  data: {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
    align?: "left" | "center" | "right";
  };
};

// Simple paragraph
export type ParagraphBlock = BlockBase & {
  type: "paragraph";
  data: {
    text: string;
    align?: "left" | "center" | "right";
  };
};

// Single image block
export type ImageBlock = BlockBase & {
  type: "image";
  data: {
    path: string;
    alt?: string;
  };
};

// Rich text block
export type RichTextBlock = BlockBase & {
  type: "richtext";
  data: {
    content: string;
  };
};

// Divider Block
export type DividerBlock = BlockBase & {
  type: "divider";
  data: {};
};

/* ──────────────────────────────
   Hero Block
   ────────────────────────────── */

export type HeroBlock = BlockBase & {
  type: "hero";
  data: {
    title: string;
    subtitle?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    align?: "left" | "center" | "right";
    backgroundImagePath?: string | null;
  };
};

/* ──────────────────────────────
   Columns Block
   ────────────────────────────── */

export type ColumnItem = {
  id: string;
  blocks: Block[];
};

export type ColumnsBlock = BlockBase & {
  type: "columns";
  data: {
    columns: ColumnItem[];
  };
};

/* ──────────────────────────────
   Blocks
   ────────────────────────────── */

export type Block =
  | TitleBlock
  | ParagraphBlock
  | ImageBlock
  | RichTextBlock
  | HeroBlock
  | ColumnsBlock
  | DividerBlock;

/* ──────────────────────────────
   SEO
   ────────────────────────────── */

export type SeoData = {
  title?: string;
  description?: string;
  keywords?: string[];
};

/* ──────────────────────────────
   Pages types
   ────────────────────────────── */

export type PageType =
  | "home"
  | "main"
  | "collection"
  | "content"
  | "footer";

/* ──────────────────────────────
   Supabase
   ────────────────────────────── */

export type PageRow = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: ContentStatus;
  type: PageType;
  parent_collection_id: string | null;
  blocks: Block[];
  seo: SeoData;
  cover_image_path: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  show_title?: boolean;
};

export type PostRow = PageRow & {
  category?: string | null;
};