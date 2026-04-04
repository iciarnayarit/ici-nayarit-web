'use client';

import type { Components } from 'react-markdown';
import Markdown from 'react-markdown';

function isSafeHttpUrl(href: string | undefined): href is string {
  if (!href || href.trim() === '') return false;
  try {
    const u = new URL(href);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function reflectionUrlTransform(url: string): string {
  if (isSafeHttpUrl(url)) return url;
  try {
    const u = new URL(url, 'https://example.invalid');
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.href;
  } catch {
    /* ignore */
  }
  return '';
}

const components: Components = {
  a: ({ href, children }) =>
    isSafeHttpUrl(href) ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
      >
        {children}
      </a>
    ) : (
      <span className="font-medium text-blue-600 underline decoration-blue-200">{children}</span>
    ),
  p: ({ children }) => (
    <p className="mb-3 whitespace-pre-wrap text-base leading-relaxed text-gray-800 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
  ul: ({ children }) => <ul className="mb-3 list-disc pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal pl-5 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-4 border-gray-200 pl-4 text-base italic leading-relaxed text-gray-600">
      {children}
    </blockquote>
  ),
  img: ({ src, alt }) =>
    src && isSafeHttpUrl(src) ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ''} className="mt-4 max-w-full rounded-xl border border-gray-100" loading="lazy" />
    ) : null,
};

export type ReflectionMarkdownPreviewProps = {
  markdown: string;
  title?: string;
};

export function ReflectionMarkdownPreview({ markdown, title }: ReflectionMarkdownPreviewProps) {
  const titleTrim = title?.trim() ?? '';
  const emptyBody = !markdown.trim();

  if (emptyBody && !titleTrim) {
    return (
      <p className="text-base leading-relaxed text-gray-400">
        Escribe en la pestaña <span className="font-semibold text-gray-500">Escribir</span>; aquí verás el título, negritas,
        listas, citas e imágenes con formato.
      </p>
    );
  }

  return (
    <div className="max-w-none text-base">
      {titleTrim ? <h2 className="mb-4 text-2xl font-bold text-gray-900">{titleTrim}</h2> : null}
      {emptyBody ? (
        <p className="text-gray-400">Añade el cuerpo de la reflexión en <span className="font-semibold text-gray-500">Escribir</span>.</p>
      ) : (
        <Markdown components={components} urlTransform={reflectionUrlTransform}>
          {markdown}
        </Markdown>
      )}
    </div>
  );
}
