// Minimal, dependency-free Markdown -> HTML renderer for previewing blog
// content. HTML is escaped FIRST, then a small subset of Markdown is applied,
// so author input cannot inject markup. Kept intentionally small (headings,
// bold/italic/code, links, unordered/ordered lists, paragraphs) — the mobile
// app renders the same source with a full markdown widget.
const escapeHtml = (input: string): string =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const renderInline = (text: string): string =>
  text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')

export const renderMarkdown = (source: string): string => {
  const escaped = escapeHtml(source || '')
  const lines = escaped.split(/\r?\n/)
  const html: string[] = []
  let listType: 'ul' | 'ol' | null = null
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      html.push(`<p>${renderInline(paragraph.join(' '))}</p>`)
      paragraph = []
    }
  }

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`)
      listType = null
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === '') {
      flushParagraph()
      closeList()
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed)
    if (heading) {
      flushParagraph()
      closeList()
      const level = heading[1]!.length
      html.push(`<h${level}>${renderInline(heading[2]!)}</h${level}>`)
      continue
    }

    const unordered = /^[-*]\s+(.*)$/.exec(trimmed)
    if (unordered) {
      flushParagraph()
      if (listType !== 'ul') {
        closeList()
        listType = 'ul'
        html.push('<ul>')
      }
      html.push(`<li>${renderInline(unordered[1]!)}</li>`)
      continue
    }

    const ordered = /^\d+\.\s+(.*)$/.exec(trimmed)
    if (ordered) {
      flushParagraph()
      if (listType !== 'ol') {
        closeList()
        listType = 'ol'
        html.push('<ol>')
      }
      html.push(`<li>${renderInline(ordered[1]!)}</li>`)
      continue
    }

    closeList()
    paragraph.push(trimmed)
  }

  flushParagraph()
  closeList()
  return html.join('\n')
}
