"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback } from "react";

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Write something..." }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "underline" } }),
      Image.configure({ HTMLAttributes: { class: "max-w-full rounded" } }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none text-foreground [&_h1]:font-serif [&_h1]:text-2xl [&_h2]:font-serif [&_h2]:text-xl [&_a]:text-foreground",
      },
    },
  });

  const setLink = useCallback(() => {
    const url = window.prompt("URL");
    if (!url) {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const btnCls = (active: boolean) =>
    `px-2 py-1 text-xs border ${active ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:border-foreground"} transition-colors`;

  return (
    <div className="border border-border">
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/30">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnCls(editor.isActive("bold"))}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnCls(editor.isActive("italic"))}>I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnCls(editor.isActive("heading", { level: 1 }))}>H1</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnCls(editor.isActive("heading", { level: 2 }))}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnCls(editor.isActive("heading", { level: 3 }))}>H3</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnCls(editor.isActive("bulletList"))}>UL</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnCls(editor.isActive("orderedList"))}>OL</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnCls(editor.isActive("blockquote"))}>&#8220;&#8221;</button>
        <button type="button" onClick={setLink} className={btnCls(editor.isActive("link"))}>Link</button>
        <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} className={btnCls(false)} disabled={!editor.isActive("link")}>Unlink</button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnCls(false)}>&#8212;</button>
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btnCls(false)} disabled={!editor.can().undo()}>Undo</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btnCls(false)} disabled={!editor.can().redo()}>Redo</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
