// "use client";

// import { useEffect, useState } from "react";
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import { Toggle } from "./ui/toggle";
// import {
//   Bold,
//   Italic,
//   List,
//   ListOrdered,
//   Undo,
//   Redo,
//   Heading1,
//   Heading2,
//   Pilcrow,
//   Minus,
//   TextQuote,
//   UnderlineIcon,
// } from "lucide-react";

// interface TiptapProps {
//   value: string;
//   onChange: (value: string) => void;
// }

// const MenuBar = ({ editor }: { editor: any }) => {
//   if (!editor) return null;

//   const btn = (
//     onClick: () => void,
//     disabled: boolean,
//     label: string,
//     children: React.ReactNode,
//   ) => (
//     <button
//       type="button"
//       aria-label={label}
//       disabled={disabled}
//       onClick={onClick}
//       className="p-1.5 text-muted-foreground hover:bg-muted rounded disabled:opacity-40 transition-colors"
//     >
//       {children}
//     </button>
//   );

//   return (
//     <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-input bg-muted/30 rounded-t-md">
//       <Toggle
//         size="sm"
//         pressed={editor.isActive("heading", { level: 1 })}
//         onPressedChange={() =>
//           editor.chain().focus().toggleHeading({ level: 1 }).run()
//         }
//         aria-label="Heading 1"
//       >
//         <Heading1 className="h-4 w-4" />
//       </Toggle>
//       <Toggle
//         size="sm"
//         pressed={editor.isActive("heading", { level: 1 })}
//         onPressedChange={() =>
//           editor.chain().focus().toggleHeading({ level: 2 }).run()
//         }
//         aria-label="Heading 2"
//       >
//         <Heading2 className="h-4 w-4" />
//       </Toggle>

//       <div className="w-px h-4 bg-border mx-1" />

//       <Toggle
//         size="sm"
//         pressed={editor.isActive("bold")}
//         onPressedChange={() => editor.chain().focus().toggleBold().run()}
//         aria-label="Bold"
//       >
//         <Bold className="h-4 w-4" />
//       </Toggle>
//       <Toggle
//         size="sm"
//         pressed={editor.isActive("italic")}
//         onPressedChange={() => editor.chain().focus().toggleItalic().run()}
//         aria-label="Italic"
//       >
//         <Italic className="h-4 w-4" />
//       </Toggle>

//       {/* Add this */}
//       <Toggle
//         size="sm"
//         pressed={editor.isActive("underline")}
//         onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
//         aria-label="Underline"
//       >
//         <UnderlineIcon className="h-4 w-4" />
//       </Toggle>

//       <div className="w-px h-4 bg-border mx-1" />

//       <Toggle
//         size="sm"
//         pressed={editor.isActive("bulletList")}
//         onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
//         aria-label="Bullet list"
//       >
//         <List className="h-4 w-4" />
//       </Toggle>
//       <Toggle
//         size="sm"
//         pressed={editor.isActive("orderedList")}
//         onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
//         aria-label="Ordered list"
//       >
//         <ListOrdered className="h-4 w-4" />
//       </Toggle>

//       <div className="w-px h-4 bg-border mx-1" />

//       <Toggle
//         size="sm"
//         pressed={editor.isActive("blockquote")}
//         onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
//         aria-label="Blockquote"
//       >
//         <TextQuote className="h-4 w-4" />
//       </Toggle>
//       {btn(
//         () => editor.chain().focus().setHorizontalRule().run(),
//         false,
//         "Horizontal rule",
//         <Minus className="h-4 w-4" />,
//       )}

//       <div className="w-px h-4 bg-border mx-1" />

//       {btn(
//         () => editor.chain().focus().undo().run(),
//         !editor.can().undo(),
//         "Undo",
//         <Undo className="h-4 w-4" />,
//       )}
//       {btn(
//         () => editor.chain().focus().redo().run(),
//         !editor.can().redo(),
//         "Redo",
//         <Redo className="h-4 w-4" />,
//       )}
//     </div>
//   );
// };

// const Tiptap = ({ value, onChange }: TiptapProps) => {
//   const [, forceUpdate] = useState(0);

//   const editor = useEditor({
//     extensions: [
//       StarterKit.configure({
//         bulletList: { keepMarks: true, keepAttributes: false },
//         orderedList: { keepMarks: true, keepAttributes: false },
//         listItem: {},
//         heading: { levels: [1, 2] },
//         // blockquote: {},
//         horizontalRule: {},
//         bold: {},
//         italic: {},
//         // history: {},
//       }),
//     ],
//     content: value,
//     immediatelyRender: false,
//     editorProps: {
//       attributes: {
//         class:
//           "min-h-[140px] w-full bg-transparent px-4 py-3 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
//       },
//     },
//     onSelectionUpdate: () => forceUpdate((n) => n + 1),
//     onTransaction: () => forceUpdate((n) => n + 1),
//     onUpdate: ({ editor }) => {
//       const html = editor.getHTML();
//       const isEmpty = editor.getText().trim().length === 0;
//       onChange(isEmpty ? "" : html);
//     },
//   });

//   useEffect(() => {
//     if (!editor) return;
//     const currentHtml = editor.getHTML();
//     if (value !== currentHtml && !(value === "" && currentHtml === "<p></p>")) {
//       editor.commands.setContent(value);
//     }
//   }, [value, editor]);

//   return (
//     <div className="flex flex-col rounded-md border border-input bg-white shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:border-primary transition-colors overflow-hidden">
//       <MenuBar editor={editor} />
//       <div className="tiptap-content">
//         <EditorContent editor={editor} />
//       </div>
//     </div>
//   );
// };

// export default Tiptap;

"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Underline as UnderlineIcon } from "lucide-react";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Toggle } from "./ui/toggle";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Pilcrow,
  Minus,
  TextQuote,
  Table as TableIcon,
  Trash2,
  Plus,
} from "lucide-react";
import { Table } from "@tiptap/extension-table";

interface TiptapProps {
  value: string;
  onChange: (value: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const btn = (
    onClick: () => void,
    disabled: boolean,
    label: string,
    children: React.ReactNode,
  ) => (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="p-1.5 text-muted-foreground hover:bg-muted rounded disabled:opacity-40 transition-colors"
    >
      {children}
    </button>
  );

  const isInTable = editor.isActive("table");

  return (
    <div className="flex flex-col border-b border-input bg-muted/30 rounded-t-md">
      {/* Main toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5">
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 1 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          aria-label="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          aria-label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>

        <div className="w-px h-4 bg-border mx-1" />

        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>

        <div className="w-px h-4 bg-border mx-1" />

        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          aria-label="Bullet list"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          aria-label="Ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>

        <div className="w-px h-4 bg-border mx-1" />

        <Toggle
          size="sm"
          pressed={editor.isActive("blockquote")}
          onPressedChange={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
          aria-label="Blockquote"
        >
          <TextQuote className="h-4 w-4" />
        </Toggle>
        {btn(
          () => editor.chain().focus().setHorizontalRule().run(),
          false,
          "Horizontal rule",
          <Minus className="h-4 w-4" />,
        )}

        <div className="w-px h-4 bg-border mx-1" />

        {/* Insert table button */}
        {btn(
          () =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run(),
          isInTable,
          "Insert table",
          <TableIcon className="h-4 w-4" />,
        )}

        <div className="w-px h-4 bg-border mx-1" />

        {btn(
          () => editor.chain().focus().undo().run(),
          !editor.can().undo(),
          "Undo",
          <Undo className="h-4 w-4" />,
        )}
        {btn(
          () => editor.chain().focus().redo().run(),
          !editor.can().redo(),
          "Redo",
          <Redo className="h-4 w-4" />,
        )}
      </div>

      {/* Contextual table toolbar — only shows when cursor is inside a table */}
      {isInTable && (
        <div className="flex flex-wrap items-center gap-0.5 px-1.5 pb-1.5 border-t border-input/50">
          <span className="text-xs text-muted-foreground mr-1 pl-0.5">
            Table:
          </span>
          {btn(
            () => editor.chain().focus().addColumnBefore().run(),
            false,
            "Add column before",
            <span className="text-xs flex items-center gap-0.5">
              <Plus className="h-3 w-3" /> Col ←
            </span>,
          )}
          {btn(
            () => editor.chain().focus().addColumnAfter().run(),
            false,
            "Add column after",
            <span className="text-xs flex items-center gap-0.5">
              <Plus className="h-3 w-3" /> Col →
            </span>,
          )}
          {btn(
            () => editor.chain().focus().deleteColumn().run(),
            false,
            "Delete column",
            <span className="text-xs flex items-center gap-0.5">
              <Trash2 className="h-3 w-3" /> Col
            </span>,
          )}
          <div className="w-px h-4 bg-border mx-1" />
          {btn(
            () => editor.chain().focus().addRowBefore().run(),
            false,
            "Add row before",
            <span className="text-xs flex items-center gap-0.5">
              <Plus className="h-3 w-3" /> Row ↑
            </span>,
          )}
          {btn(
            () => editor.chain().focus().addRowAfter().run(),
            false,
            "Add row after",
            <span className="text-xs flex items-center gap-0.5">
              <Plus className="h-3 w-3" /> Row ↓
            </span>,
          )}
          {btn(
            () => editor.chain().focus().deleteRow().run(),
            false,
            "Delete row",
            <span className="text-xs flex items-center gap-0.5">
              <Trash2 className="h-3 w-3" /> Row
            </span>,
          )}
          <div className="w-px h-4 bg-border mx-1" />
          {btn(
            () => editor.chain().focus().toggleHeaderRow().run(),
            false,
            "Toggle header row",
            <span className="text-xs">Header</span>,
          )}
          {btn(
            () => editor.chain().focus().mergeOrSplit().run(),
            false,
            "Merge or split cells",
            <span className="text-xs">Merge</span>,
          )}
          {btn(
            () => editor.chain().focus().deleteTable().run(),
            false,
            "Delete table",
            <span className="text-xs flex items-center gap-0.5 text-destructive">
              <Trash2 className="h-3 w-3" /> Table
            </span>,
          )}
        </div>
      )}
    </div>
  );
};

const Tiptap = ({ value, onChange }: TiptapProps) => {
  const [, forceUpdate] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        listItem: {},
        heading: { levels: [1, 2] },
        blockquote: {},
        horizontalRule: {},
        bold: {},
        italic: {},
        // history: {},
      }),
      Underline,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[140px] w-full bg-transparent px-4 py-3 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      },
    },
    onSelectionUpdate: () => forceUpdate((n) => n + 1),
    onTransaction: () => forceUpdate((n) => n + 1),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const isEmpty = editor.getText().trim().length === 0;
      onChange(isEmpty ? "" : html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml && !(value === "" && currentHtml === "<p></p>")) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="flex flex-col rounded-md border border-input bg-white shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:border-primary transition-colors overflow-hidden">
      <MenuBar editor={editor} />
      <div className="tiptap-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Tiptap;
