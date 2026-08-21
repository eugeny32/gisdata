/**
 * Help — the user guide, rendered inside the app.
 *
 * The guide lives in ONE place (РУКОВОДСТВО.md at the repo root) and is
 * inlined into the bundle with Vite's `?raw` import, so the in-app help and
 * the file in the repository can never drift apart — and the help works
 * offline, without a docs site.
 *
 * The renderer below covers exactly what the guide uses: headings, tables,
 * lists, rules, bold and inline code. It is deliberately ~60 lines instead
 * of a markdown dependency.
 */
import guideSource from '../РУКОВОДСТВО.md?raw';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Inline span pass: `code` and **bold**, applied after escaping. */
function inline(s: string): string {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
}

function tableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

export function renderMarkdown(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  let para: string[] = [];

  const closeList = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };
  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(' '))}</p>`);
      para = [];
    }
  };
  const flush = () => {
    flushPara();
    closeList();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();

    if (!t) {
      flush();
      continue;
    }
    if (/^#{1,4}\s/.test(t)) {
      flush();
      const level = t.match(/^#+/)![0].length;
      out.push(`<h${level}>${inline(t.replace(/^#+\s*/, ''))}</h${level}>`);
      continue;
    }
    if (/^---+$/.test(t)) {
      flush();
      out.push('<hr />');
      continue;
    }
    // Table: header row, separator row, then body rows.
    if (t.startsWith('|') && (lines[i + 1] ?? '').trim().startsWith('|-')) {
      flush();
      const head = tableRow(t);
      out.push('<table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>');
      i += 2;
      for (; i < lines.length && lines[i].trim().startsWith('|'); i++) {
        out.push('<tr>' + tableRow(lines[i]).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>');
      }
      i--;
      out.push('</tbody></table>');
      continue;
    }
    const bullet = t.match(/^[-*]\s+(.*)$/);
    const numbered = t.match(/^\d+\.\s+(.*)$/);
    if (bullet || numbered) {
      flushPara();
      const want = bullet ? 'ul' : 'ol';
      if (list !== want) {
        closeList();
        out.push(`<${want}>`);
        list = want;
      }
      out.push(`<li>${inline((bullet ?? numbered)![1])}</li>`);
      continue;
    }
    // Continuation of a list item wrapped onto the next source line.
    if (list && /^\s{2,}\S/.test(line)) {
      const last = out.pop() ?? '';
      out.push(last.replace(/<\/li>$/, ` ${inline(t)}</li>`));
      continue;
    }
    closeList();
    para.push(t);
  }
  flush();
  return out.join('\n');
}

export const GUIDE_HTML = renderMarkdown(guideSource);
