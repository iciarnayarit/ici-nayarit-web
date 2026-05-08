import { GENERATED_IMAGE_BLUR_PLACEHOLDERS } from '@/lib/generated-image-placeholders';

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildBlurPlaceholder(primary: string, secondary: string): string {
  return svgToDataUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 18' preserveAspectRatio='none'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stop-color='${primary}' />
          <stop offset='1' stop-color='${secondary}' />
        </linearGradient>
      </defs>
      <rect width='32' height='18' fill='url(#g)' />
    </svg>`
  );
}

// Fallback neutro para blur-up cuando no existe asset específico.
export const BLUR_PLACEHOLDER_BASE64 = buildBlurPlaceholder('#e2e8f0', '#d1d5db');

// Placeholders afinados por asset para un blur-up más natural.
export const IMAGE_BLUR_PLACEHOLDERS = {
  iciarLogo: buildBlurPlaceholder('#f2efe7', '#9a8460'),
  pacificoLogo: buildBlurPlaceholder('#efe8dc', '#6e6258'),
  pdrLogo: buildBlurPlaceholder('#f0f2f5', '#62768d'),
  scriptureEarthLogo: buildBlurPlaceholder('#ece9de', '#8f7b54'),
  contactBackground: buildBlurPlaceholder('#2f2f2f', '#6f5b4c'),
} as const;

/**
 * Obtiene placeholder por `src` local de `public/...`.
 * Si no existe generado, cae al fallback neutro.
 */
export function getAutoBlurPlaceholder(src: string): string {
  return GENERATED_IMAGE_BLUR_PLACEHOLDERS[src] ?? BLUR_PLACEHOLDER_BASE64;
}

