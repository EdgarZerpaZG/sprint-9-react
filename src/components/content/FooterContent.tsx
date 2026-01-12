import BlocksRenderer from "./BlocksRenderer";
import { usePublicFooter } from "../../features/content/hooks/usePublicFooter";

export default function FooterContent() {
  const { blocks, loading, error } = usePublicFooter();

  if (loading) return null;
  if (error) {
    console.error("[PublicFooter] error:", error);
    return null;
  }
  if (!blocks || blocks.length === 0) return null;

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <BlocksRenderer blocks={blocks} />
      </div>
    </footer>
  );
}