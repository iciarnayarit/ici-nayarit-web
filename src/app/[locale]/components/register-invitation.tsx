'use client';
import { useState } from 'react';
import { Button } from '@/app/[locale]/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/[locale]/components/ui/dialog";
import { Input } from "@/app/[locale]/components/ui/input";
import { Label } from "@/app/[locale]/components/ui/label";
import { useToast } from '@/app/[locale]/hooks/use-toast';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function RegisterInvitation() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('RegisterInvitation');

  const handleRegister = () => {
    // Placeholder for registration logic
    toast({
      title: t('registration_success_title'),
      description: t('registration_success_desc'),
    });
    setIsModalOpen(false);
  };

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32">
      <Image
        src="https://i.imgur.com/7pNpUbt.png"
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <div className="relative container mx-auto px-4 md:px-6 text-center text-white z-20">
        <h2 className="text-3xl font-bold font-headline mb-4">{t('title')}</h2>
        <p className="text-lg mb-8">
          {t('description')}
        </p>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="lg" onClick={() => setIsModalOpen(true)}>
              {t('register_free')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('create_account')}</DialogTitle>
              <DialogDescription>
                {t('create_account_desc')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t('name_label')}
                </Label>
                <Input id="name" placeholder={t('name_placeholder')} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" type="email" placeholder="tu@email.com" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  {t('password_label')}
                </Label>
                <Input id="password" type="password" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleRegister}>{t('register')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
