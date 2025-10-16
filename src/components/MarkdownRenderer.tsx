import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const [renderedContent, setRenderedContent] = useState('');

  useEffect(() => {
    // Ensure we're running on the client-side before using DOMPurify
    if (typeof window !== 'undefined') {
      // Configure marked options to enable tables
      marked.setOptions({
        gfm: true, // GitHub Flavored Markdown
        tables: true, // Enable tables
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false
      });
      
      console.log('Processing markdown content:', content?.substring(0, 200) + '...');
      const dirtyHtml = marked.parse(content || '') as string;
      console.log('Marked HTML output:', dirtyHtml.substring(0, 500) + '...');
      const cleanHtml = DOMPurify.sanitize(dirtyHtml);
      console.log('Clean HTML output:', cleanHtml.substring(0, 500) + '...');
      setRenderedContent(cleanHtml);
    }
  }, [content]);

  return (
    <div
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
      style={{
        lineHeight: '1.6',
        fontSize: '14px'
      }}
    />
  );
}