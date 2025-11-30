'use client';
import { Link } from '@/navigation';
import { MenuIcon, Moon, Sun, Languages, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { DialogTitle } from '@radix-ui/react-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from '@/navigation'; // Import usePathname from '@/navigation'

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
    const t = useTranslations('Header');

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            <Sun className="h-6 w-6 scale-100 rotate-0 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-6 w-6 scale-0 rotate-90 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">{t('toggle_theme')}</span>
        </Button>
    );
}

function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname(); // This usePathname is from '@/navigation'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-6 w-6" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={pathname} locale="es" className="flex items-center">
            Español
            {locale === 'es' && <Check className="ml-2 h-4 w-4" />}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={pathname} locale="en" className="flex items-center">
            English
            {locale === 'en' && <Check className="ml-2 h-4 w-4" />}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const [isPlanesMenuOpen, setIsPlanesMenuOpen] = useState(false);
  const t = useTranslations('Header');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl font-headline">ICIAR Nayarit</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/biblia" className="text-foreground/80 hover:text-foreground transition-colors">
            {t('bible')}
          </Link>
          <DropdownMenu open={isPlanesMenuOpen} onOpenChange={setIsPlanesMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-foreground/80 hover:text-foreground transition-colors" onMouseEnter={() => setIsPlanesMenuOpen(true)}>
                {t('plans')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onMouseLeave={() => setIsPlanesMenuOpen(false)}>
              <DropdownMenuItem asChild>
                <Link href="/planes">{t('all_plans')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/planes/guardados">{t('saved_plans')}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/templos" className="text-foreground/80 hover:text-foreground transition-colors">
            {t('temples')}
          </Link>
          <Link href="/videos" className="text-foreground/80 hover:text-foreground transition-colors">
            {t('videos')}
          </Link>
          <Link href="/#download" className="text-foreground/80 hover:text-foreground transition-colors">
            {t('app')}
          </Link>
          <ThemeToggle />
          <LanguageSwitcher />
        </nav>
        <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <LanguageSwitcher />
            <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">{t('toggle_navigation')}</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <DialogTitle className="sr-only">{t('navigation_menu')}</DialogTitle>
                <Link href="/" className="flex items-center gap-2 py-6">
                <span className="font-bold text-lg">ICIAR Nayarit</span>
                </Link>
                <div className="grid gap-2 py-6">
                <Link href="/biblia" className="flex w-full items-center py-2 text-lg font-semibold">
                    {t('bible')}
                </Link>
                <Link href="/planes" className="flex w-full items-center py-2 text-lg font-semibold">
                    {t('all_plans')}
                </Link>
                <Link href="/planes/guardados" className="flex w-full items-center py-2 text-lg font-semibold">
                    {t('saved_plans')}
                </Link>
                <Link href="/templos" className="flex w-full items-center py-2 text-lg font-semibold">
                    {t('temples')}
                </Link>
                <Link href="/videos" className="flex w-full items-center py-2 text-lg font-semibold">
                    {t('videos')}
                </Link>
                <Link href="/#download" className="flex w-full items-center py-2 text-lg font-semibold">
                    {t('app')}
                </Link>
                </div>
            </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
