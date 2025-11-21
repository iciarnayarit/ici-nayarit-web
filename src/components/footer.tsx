import Link from 'next/link';
import { BookHeart, Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ICIAR Nayarit. Todos los derechos reservados.
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <Link href="#" className="text-muted-foreground hover:text-foreground" aria-label="Twitter">
            <Twitter className="h-5 w-5" />
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground" aria-label="Facebook">
            <Facebook className="h-5 w-5" />
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground" aria-label="Instagram">
            <Instagram className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
