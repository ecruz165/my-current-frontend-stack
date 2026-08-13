import { mergeAttributes, Node } from '@tiptap/core';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extensions';
import { PluginKey } from '@tiptap/pm/state';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Suggestion, { type SuggestionProps } from '@tiptap/suggestion';
import { useEffect } from 'react';
import { Markdown, type MarkdownStorage } from 'tiptap-markdown';
import { Button } from '@/components/ui/button';
import { users } from '@/mocks/fixtures';
import type { User } from '@/schemas/user';

// Inline atom node for @-mentions of fixture users, wired to
// @tiptap/suggestion. The picker popup is positioned manually from
// props.clientRect (no positioning library installed — demo-grade).
const UserMention = Node.create({
  name: 'mention',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return { id: { default: null }, label: { default: null } };
  },
  parseHTML() {
    return [{ tag: 'span[data-mention-id]' }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-mention-id': node.attrs.id,
        class: 'rounded bg-secondary px-1 font-medium',
      }),
      `@${node.attrs.label}`,
    ];
  },
  renderText({ node }) {
    return `@${node.attrs.label}`;
  },
  addStorage() {
    return {
      markdown: {
        serialize(
          state: { write: (text: string) => void },
          node: { attrs: { label: string } },
        ) {
          state.write(`@${node.attrs.label}`);
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion<User>({
        editor: this.editor,
        char: '@',
        pluginKey: new PluginKey('userMention'),
        items: ({ query }) =>
          users
            .filter((user) =>
              user.name.toLowerCase().includes(query.toLowerCase()),
            )
            .slice(0, 5),
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              { type: 'mention', attrs: { id: props.id, label: props.name } },
              { type: 'text', text: ' ' },
            ])
            .run();
        },
        render: () => {
          let popup: HTMLDivElement | null = null;

          const paint = (props: SuggestionProps<User>) => {
            if (!popup) return;
            popup.innerHTML = '';
            for (const item of props.items) {
              const button = document.createElement('button');
              button.type = 'button';
              button.textContent = item.name;
              button.className =
                'block w-full px-2 py-1 text-left text-sm hover:bg-accent';
              button.addEventListener('click', () => props.command(item));
              popup.appendChild(button);
            }
            const rect = props.clientRect?.();
            if (rect) {
              popup.style.left = `${rect.left + window.scrollX}px`;
              popup.style.top = `${rect.bottom + window.scrollY + 4}px`;
            }
          };

          return {
            onStart: (props) => {
              popup = document.createElement('div');
              popup.className =
                'absolute z-50 rounded-md border bg-popover text-popover-foreground shadow-md';
              popup.setAttribute('data-mention-popup', '');
              document.body.appendChild(popup);
              paint(props);
            },
            onUpdate: paint,
            onKeyDown: ({ event }) => {
              if (event.key === 'Escape') {
                popup?.remove();
                popup = null;
                return true;
              }
              return false;
            },
            onExit: () => {
              popup?.remove();
              popup = null;
            },
          };
        },
      }),
    ];
  },
});

interface RichTextEditorProps {
  initialMarkdown?: string;
  onMarkdownChange?: (markdown: string) => void;
  // Test/story hook: jsdom cannot type into contenteditable, so consumers
  // drive the editor through its command API instead.
  onReady?: (editor: Editor) => void;
}

export function RichTextEditor({
  initialMarkdown = '',
  onMarkdownChange,
  onReady,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: 'Write something… try @ to mention',
      }),
      Markdown,
      UserMention,
    ],
    content: initialMarkdown,
    editorProps: {
      attributes: {
        class:
          'prose-sm min-h-[16rem] max-w-none rounded-md border p-4 outline-none',
      },
    },
    onUpdate: ({ editor: instance }) => {
      // tiptap-markdown 0.9 doesn't augment tiptap v3's typed Storage
      // registry, so the storage slot needs an explicit cast.
      const storage = instance.storage as unknown as {
        markdown: MarkdownStorage;
      };
      onMarkdownChange?.(storage.markdown.getMarkdown());
    },
  });

  useEffect(() => {
    if (editor) onReady?.(editor);
  }, [editor, onReady]);

  if (!editor) return null;

  const marks = [
    {
      label: 'Bold',
      run: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive('bold'),
    },
    {
      label: 'Italic',
      run: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive('italic'),
    },
    {
      label: 'Underline',
      run: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive('underline'),
    },
    {
      label: 'Link',
      // Demo-grade link toggle: applies a fixed href to the selection (a
      // real app would collect the URL in a popover).
      run: () =>
        editor.isActive('link')
          ? editor.chain().focus().unsetLink().run()
          : editor
              .chain()
              .focus()
              .setLink({ href: 'https://tanstack.com' })
              .run(),
      active: editor.isActive('link'),
    },
    {
      label: 'Undo',
      run: () => editor.chain().focus().undo().run(),
      active: false,
    },
  ];

  return (
    <div className="space-y-2">
      <div role="toolbar" aria-label="Formatting" className="flex gap-1">
        {marks.map((mark) => (
          <Button
            key={mark.label}
            type="button"
            variant={mark.active ? 'secondary' : 'ghost'}
            size="sm"
            aria-pressed={mark.active}
            onClick={mark.run}
          >
            {mark.label}
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
