'use client';
import { DialogTitle } from '@radix-ui/react-dialog';
import { MenuIcon, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

function useDarkMode() {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const storedTheme = window.sessionStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        window.sessionStorage.setItem('theme', theme);
    }, [theme]);

    return { theme, setTheme };
}

function ThemeToggle() {
    const { theme, setTheme } = useDarkMode();

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            <Sun className="h-6 w-6 scale-100 rotate-0 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-6 w-6 scale-0 rotate-90 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Cambiar tema</span>
        </Button>
    );
}

export default function Header() {
  const [isPlanesMenuOpen, setIsPlanesMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl font-headline">ICIAR Nayarit</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/biblia" className="text-foreground/80 hover:text-foreground transition-colors">
            Biblia
          </Link>
          <Link href="/planes" className="text-foreground/80 hover:text-foreground transition-colors">
            Planes
          </Link>
          <Link href="/doctrina" className="text-foreground/80 hover:text-foreground transition-colors">
            Doctrina
          </Link>
          <Link href="/templos" className="text-foreground/80 hover:text-foreground transition-colors">
            Templos
          </Link>
          {/* <Link href="/videos" className="text-foreground/80 hover:text-foreground transition-colors">
            Videos
          </Link> */}
          <Link href="/radio" className="text-foreground/80 hover:text-foreground transition-colors">
            Radio
          </Link>
          <Link href="/#download" className="text-foreground/80 hover:text-foreground transition-colors">
            App
          </Link>
          <ThemeToggle />
        </nav>
        <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Cambiar menú de navegación</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <DialogTitle className="sr-only">Menú de navegación</DialogTitle>
                <Link href="/" className="flex items-center gap-2 py-6">
                <span className="font-bold text-lg">ICIAR Nayarit</span>
                </Link>
                <div className="grid gap-2 py-6">
                <Link href="/biblia" className="flex w-full items-center py-2 text-lg font-semibold">
                    Biblia
                </Link>
                <Link href="/planes" className="flex w-full items-center py-2 text-lg font-semibold">
                    Planes
                </Link>
                <Link href="/doctrina" className="flex w-full items-center py-2 text-lg font-semibold">
                    Doctrina
                </Link>
                <Link href="/templos" className="flex w-full items-center py-2 text-lg font-semibold">
                    Templos
                </Link>
                {/* <Link href="/videos" className="flex w-full items-center py-2 text-lg font-semibold">
                    Videos
                </Link> */}
                <Link href="/radio" className="flex w-full items-center py-2 text-lg font-semibold">
                    Radio
                </Link>
                <Link href="/#download" className="flex w-full items-center py-2 text-lg font-semibold">
                    App
                </Link>
                </div>
            </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
