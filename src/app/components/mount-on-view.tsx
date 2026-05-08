'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback: ReactNode;
  /** Margen extra antes de montar (p. ej. precarga cercana al viewport). */
  rootMargin?: string;
};

/**
 * Monta hijos solo cuando el contenedor entra en el viewport (o cerca, vía rootMargin).
 * Útil para diferir hidratación/listados pesados sin cambiar la ruta a Server Components.
 */
export function MountOnView({ children, fallback, rootMargin = '240px 0px' }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || isVisible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setIsVisible(true);
          observer.disconnect();
          break;
        }
      },
      { rootMargin, threshold: 0.01 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return <div ref={ref}>{isVisible ? children : fallback}</div>;
}
