import type { Block } from "../../types/contentTypes";
import { getPublicImageUrl } from "../../utils/images";

type Props = {
  blocks: Block[];
};

export default function BlocksRenderer({ blocks }: Props) {
  if (!blocks || blocks.length === 0) {
    return <p className="text-slate-400 text-sm">No content yet.</p>;
  }

  return (
    <div className="space-y-4">
      {blocks.map((block) => {
        if (block.type === "heading") {
          const level = block.data.level ?? 2;
          const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;

          return (
            <Tag key={block.id} className="font-semibold mt-4">
              {block.data.text}
            </Tag>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={block.id} className="text-base leading-relaxed">
              {block.data.text}
            </p>
          );
        }

        if (block.type === "image") {
          const url = getPublicImageUrl(block.data.path);
          return (
            <figure key={block.id} className="my-4">
              <img
                src={url}
                alt={block.data.alt || ""}
                loading="lazy"
                className="max-w-full rounded-md"
              />
              {block.data.alt && (
                <figcaption className="text-xs text-slate-500 mt-1">
                  {block.data.alt}
                </figcaption>
              )}
            </figure>
          );
        }

        // Fallback for unknown block types (should not happen)
        return null;
      })}
    </div>
  );
}