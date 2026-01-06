import { useEffect, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {$getRoot, $createParagraphNode, $createTextNode, type EditorState} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const theme = {
  paragraph: "mb-2",
};

function onError(error: Error) {
  console.error("[Lexical] Editor error:", error);
}

function InitialTextPlugin({ text }: { text: string }) {
  const [editor] = useLexicalComposerContext();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(text));
      root.append(paragraph);
    });
  }, [editor, text]);

  return null;
}

export default function RichTextBlockEditor({ value, onChange }: Props) {
  const initialConfig = {
    namespace: "block-paragraph",
    theme,
    onError,
    nodes: [],
  };

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const text = root.getTextContent();
      onChange(text);
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border border-slate-700 rounded bg-slate-950 px-3 py-2 text-sm">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-20 focus:outline-none" />
          }
          placeholder={
            <div className="text-xs text-slate-500">
              Write paragraph content...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
        <InitialTextPlugin text={value} />
      </div>
    </LexicalComposer>
  );
}