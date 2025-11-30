'use client';
import { useState, useEffect } from 'react';
import { Share2, Mail } from 'lucide-react';
import { Button } from '@/app/[locale]/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/app/[locale]/components/ui/dialog";
import { Input } from "@/app/[locale]/components/ui/input";
import { Label } from "@/app/[locale]/components/ui/label";
import { SocialIcons } from './social-icons';
import { useTranslations } from 'next-intl';

const dailyVerses = [
    {
      text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
      reference: "Juan 3:16"
    },
    {
      text: "El Señor es mi pastor; nada me faltará.",
      reference: "Salmo 23:1"
    },
    {
      text: "Todo lo puedo en Cristo que me fortalece.",
      reference: "Filipenses 4:13"
    },
    {
      text: "Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios.",
      reference: "Efesios 2:8"
    },
    {
      text: "El amor es sufrido, es benigno; el amor no tiene envidia, el amor no es jactancioso, no se envanece.",
      reference: "1 Corintios 13:4"
    },
    {
        text: "Porque la paga del pecado es muerte, mas la dádiva de Dios es vida eterna en Cristo Jesús Señor nuestro.",
        reference: "Romanos 6:23"
    },
    {
        text: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.",
        reference: "Mateo 6:33"
    },
    {
        text: "Fíate de Jehová de todo tu corazón, Y no te apoyes en tu propia prudencia.",
        reference: "Proverbios 3:5"
    },
    {
        text: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.",
        reference: "Jeremías 29:11"
    },
    {
        text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.",
        reference: "Romanos 8:28"
    }
  ];

export default function DailyVerse() {
    const [verse, setVerse] = useState({ text: '', reference: '' });
    const [shareUrl, setShareUrl] = useState('');
    const t = useTranslations('DailyVerse');

    useEffect(() => {
        const getDayOfYear = (date: Date) => {
            const start = new Date(date.getFullYear(), 0, 0);
            const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
            const oneDay = 1000 * 60 * 60 * 24;
            return Math.floor(diff / oneDay);
        };

        const dayOfYear = getDayOfYear(new Date());
        const verseIndex = dayOfYear % dailyVerses.length;
        setVerse(dailyVerses[verseIndex]);
        setShareUrl(window.location.href);
    }, []);


  return (
    <section id="verse" className="w-full py-20 md:py-32 lg:py-40 bg-background">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            {t('title')}
          </h2>
          <blockquote className="text-2xl font-headline font-bold text-foreground md:text-4xl lg:text-5xl tracking-tight">
            “{verse.text}”
          </blockquote>
          <p className="mt-6 text-lg text-muted-foreground font-body">
            {verse.reference}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  {t('share')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t('share_on_social')}</DialogTitle>
                  <DialogDescription>
                    {t('share_description')}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <SocialIcons shareUrl={shareUrl} quote={`${verse.text} - ${verse.reference}`} />
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('subscribe_title')}</DialogTitle>
                        <DialogDescription>
                            {t('subscribe_description')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                {t('email_label')}
                            </Label>
                            <Input id="email" type="email" placeholder={t('email_placeholder')} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="submit">{t('submit')}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </section>
  );
}
