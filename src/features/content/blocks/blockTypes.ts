export type BlockType = "heading" | "paragraph" | "image";

export type BaseBlock = {
  id: string;
  type: BlockType;
};

export type HeadingBlock = BaseBlock & {
  type: "heading";
  level: 1 | 2 | 3;
  text: string;
};

export type ParagraphBlock = BaseBlock & {
  type: "paragraph";
  text: string;
};

export type ImageBlock = BaseBlock & {
  type: "image";
  path: string;
  alt?: string;
};

export type DividerBlock = BaseBlock & {
  type: "divider";
};

export type Block = HeadingBlock | ParagraphBlock | ImageBlock | DividerBlock;