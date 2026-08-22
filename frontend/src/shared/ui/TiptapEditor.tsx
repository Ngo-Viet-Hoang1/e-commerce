import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TextAlign from '@tiptap/extension-text-align'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect, useState } from 'react'

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Redo,
  Undo,
  Unlink,
} from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/utils'

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'default' : 'ghost'}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={cn(
        'h-7 w-7 p-0 rounded cursor-pointer',
        active && 'bg-primary text-primary-foreground hover:bg-primary/90',
      )}
    >
      {children}
    </Button>
  )
}

interface TiptapEditorProps {
  value?: string
  onChange?: (html: string) => void
  disabled?: boolean
  minHeight?: string
  maxHeight?: string
}

export default function TiptapEditor({
  value = '',
  onChange,
  disabled = false,
  minHeight = 'min-h-[110px]',
  maxHeight = 'max-h-[280px]',
}: TiptapEditorProps) {
  const [, forceUpdate] = useState({})

  const editor = useEditor({
    editable: !disabled,
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: { class: 'max-w-full h-auto rounded' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: 'border-collapse table-auto w-full' },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: { class: 'border border-gray-300 px-3 py-2' },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-3 py-2 bg-gray-100 font-bold',
        },
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML())
    },
    onSelectionUpdate() {
      forceUpdate({})
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) return null

  const addImageFromFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const src = event.target?.result as string
          editor.chain().focus().setImage({ src }).run()
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  return (
    <div className="rounded-lg border bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
      {/* Compact Toolbar */}
      <div className="bg-muted/40 flex flex-wrap items-center gap-0.5 border-b p-1 px-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Đậm (Ctrl+B)"
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Nghiêng (Ctrl+I)"
        >
          <Italic size={14} />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-4" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive('heading', { level: 1 })}
          title="Tiêu đề 1"
        >
          <Heading1 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive('heading', { level: 2 })}
          title="Tiêu đề 2"
        >
          <Heading2 size={14} />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-4" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Căn trái"
        >
          <AlignLeft size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Căn giữa"
        >
          <AlignCenter size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Căn phải"
        >
          <AlignRight size={14} />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-4" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Danh sách gạch đầu dòng"
        >
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Danh sách số"
        >
          <ListOrdered size={14} />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-4" />

        <ToolbarButton
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href
            const url = window.prompt('Nhập đường dẫn URL:', previousUrl)
            if (url === null) return
            if (url === '') {
              editor.chain().focus().extendMarkRange('link').unsetLink().run()
              return
            }
            editor
              .chain()
              .focus()
              .extendMarkRange('link')
              .setLink({ href: url })
              .run()
          }}
          active={editor.isActive('link')}
          title="Chèn liên kết"
        >
          <LinkIcon size={14} />
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Gỡ liên kết"
          >
            <Unlink size={14} />
          </ToolbarButton>
        )}

        <ToolbarButton onClick={addImageFromFile} title="Chèn ảnh vào mô tả">
          <ImageIcon size={14} />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-4" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Làm lại (Ctrl+Y)"
        >
          <Redo size={14} />
        </ToolbarButton>
      </div>

      {/* Dynamic Height Editor Content */}
      <div
        className={cn(
          'cursor-text p-3 text-sm prose prose-sm max-w-none dark:prose-invert overflow-y-auto focus:outline-none',
          minHeight,
          maxHeight,
          disabled && 'cursor-not-allowed opacity-60',
        )}
        onClick={() => !disabled && editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
