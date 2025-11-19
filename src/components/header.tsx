import Link from 'next/link';
import { BookHeart } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BookHeart className="h-7 w-7 text-primary" />
          <span className="font-bold text-xl font-headline">ICIAR Nayarit</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/biblia" className="text-foreground/80 hover:text-foreground transition-colors">
            Biblia
          </Link>
          <Link href="/planes" className="text-foreground/80 hover:text-foreground transition-colors">
            Planes
          </Link>
          <Link href="/videos" className="text-foreground/80 hover:text-foreground transition-colors">
            Videos
          </Link>
          <Link href="/#download" className="text-foreground/80 hover:text-foreground transition-colors">
            Descargar
          </Link>
        </nav>
      </div>
    </header>
  );
}
