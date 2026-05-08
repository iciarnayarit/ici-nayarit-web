import { track } from '@vercel/analytics';

export type LandingBucket = 'a' | 'b';

/** Una vez por visita a la home con la variante asignada (útil para denominador de CTR). */
export function trackLandingVariantImpression(bucket: LandingBucket) {
  track('landing_variant_impression', { bucket });
}

/** Clic en el CTA principal del hero (numerador de CTR por bucket). */
export function trackLandingVariantCtaClick(bucket: LandingBucket, ctaLabel: string) {
  track('landing_variant_cta_click', { bucket, cta_label: ctaLabel });
}
