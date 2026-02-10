'use client';
import { Facebook, Youtube } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            © {year} ICIAR Nayarit. Todos los derechos reservados.
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <Link href="https://www.facebook.com/ici.nayarit" target="_blank"  className="text-muted-foreground hover:text-foreground" aria-label="Facebook">
            <Facebook className="h-5 w-5" />
          </Link>
          <Link href="https://www.youtube.com/@iciarnayarit" target="_blank"  className="text-muted-foreground hover:text-foreground" aria-label="Youtube">
            <Youtube className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
