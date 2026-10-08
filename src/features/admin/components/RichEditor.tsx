'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

function ToolButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-9 h-9 px-2 rounded-md text-sm font-semibold border border-line ${
        active
          ? 'bg-lime! text-[#081004]! border-lime! font-bold!'
          : 'bg-surface2 text-[#cbd5cd]'
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const addLink = () => {
    const url = window.prompt('URL do link (vazio para remover):', '');
    if (url === null) return;
    if (url === '') editor.chain().focus().unsetLink().run();
    else
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run();
  };

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border-b border-line bg-surface rounded-t-xl">
      <ToolButton
        title="Negrito"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <b>B</b>
      </ToolButton>
      <ToolButton
        title="Itálico"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i>I</i>
      </ToolButton>
      <ToolButton
        title="Título"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolButton>
      <ToolButton
        title="Subtítulo"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolButton>
      <ToolButton
        title="Lista"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        •
      </ToolButton>
      <ToolButton
        title="Lista numerada"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1.
      </ToolButton>
      <ToolButton
        title="Citação"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        ❝
      </ToolButton>
      <ToolButton
        title="Link"
        active={editor.isActive('link')}
        onClick={addLink}
      >
        🔗
      </ToolButton>
    </div>
  );
}

/**
 * Editor WYSIWYG (TipTap) que produz HTML. O site interpreta esse HTML já
 * sanitizado (DOMPurify) na página da notícia.
 */
export function RichEditor({
  initialHTML,
  onChange,
}: {
  initialHTML: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: initialHTML,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'max-w-none min-h-[220px] px-3.5 py-3 outline-none text-[15px] leading-[1.7] text-app-text [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-line [&_blockquote]:pl-3 [&_blockquote]:text-muted [&_a]:text-lime [&_a]:underline',
      },
    },
  });

  if (!editor) {
    return (
      <div
        className={`${/* same frame while loading */ ''} border border-line rounded-xl min-h-[270px] grid place-items-center text-muted text-sm bg-[#080e0a]`}
      >
        Carregando editor…
      </div>
    );
  }

  return (
    <div className="border border-line rounded-xl overflow-hidden bg-[#080e0a]">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
