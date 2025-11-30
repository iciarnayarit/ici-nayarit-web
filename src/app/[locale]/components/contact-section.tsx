'use client';
import { useState } from 'react';
import { Button } from '@/app/[locale]/components/ui/button';
import { MessageCircle } from 'lucide-react';
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
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import { useToast } from '@/app/[locale]/hooks/use-toast';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('ContactSection');

  const handleWhatsAppClick = () => {
    const whatsappMessage = "Hola, tengo una duda sobre las ubicaciones de los templos."; // This could also be translated
    const whatsappUrl = `https://wa.me/message/FRG3AOJMUKQOD1?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = () => {
    if (!name.trim() || !message.trim() || !email.trim()) {
      toast({
        title: t('incomplete_fields_title'),
        description: t('incomplete_fields_description'),
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        toast({
            title: t('invalid_email_title'),
            description: t('invalid_email_description'),
            variant: "destructive",
        });
        return;
    }

    // Placeholder for email sending logic
    console.log("Formulario enviado:", { name, email, message });

    toast({
      title: t('form_sent_title'),
      description: t('form_sent_description'),
    });

    setIsModalOpen(false);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32">
      <Image
        src="https://i.imgur.com/pIdxDkl.jpeg"
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
        <div className="flex justify-center gap-4">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('contact_email_title')}</DialogTitle>
                <DialogDescription>
                  {t('contact_email_description')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    {t('name_label')}
                  </Label>
                  <Input id="name" placeholder={t('name_placeholder')} className="col-span-3" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    {t('email_label')}
                  </Label>
                  <Input id="email" type="email" placeholder={t('email_placeholder')} className="col-span-3" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="message" className="text-right">
                    {t('message_label')}
                  </Label>
                  <Textarea id="message" placeholder={t('message_placeholder')} className="col-span-3" value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSubmit}>{t('submit')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleWhatsAppClick} style={{ backgroundColor: 'purple', color: 'white' }}>
            <MessageCircle className="mr-2 h-4 w-4" />
            {t('send_whatsapp')}
          </Button>
        </div>
      </div>
    </section>
  );
}
