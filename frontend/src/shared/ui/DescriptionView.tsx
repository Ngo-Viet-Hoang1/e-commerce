import DOMPurify from 'dompurify'

interface DescriptionViewProps {
  content: string
}

export default function DescriptionView({ content }: DescriptionViewProps) {
  return (
    <div className="prose dark:prose-invert max-w-full">
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
    </div>
  )
}
