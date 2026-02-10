'use client';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { useToast } from '@/app/hooks/use-toast';
import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleWhatsAppClick = () => {
    const whatsappMessage = "Hola, tengo una duda sobre las ubicaciones de los templos."; // This could also be translated
    const whatsappUrl = `https://wa.me/message/FRG3AOJMUKQOD1?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = () => {
    if (!name.trim() || !message.trim() || !email.trim()) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, completa todos los campos.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        toast({
            title: "Email inválido",
            description: "Por favor, introduce un correo electrónico válido.",
            variant: "destructive",
        });
        return;
    }

    // Placeholder for email sending logic
    console.log("Formulario enviado:", { name, email, message });

    toast({
      title: "Formulario enviado",
      description: "Tu mensaje ha sido recibido.",
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
        <h2 className="text-3xl font-bold font-headline mb-4">¿Tienes más dudas?</h2>
        <p className="text-lg mb-8">
          Ponte en contacto con nosotros a través de correo electrónico o WhatsApp.
        </p>
        <div className="flex justify-center gap-4">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Contactar por Correo</DialogTitle>
                <DialogDescription>
                  Completa el formulario para enviarnos un correo.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input id="name" placeholder="Tu nombre" className="col-span-3" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input id="email" type="email" placeholder="tu@email.com" className="col-span-3" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="message" className="text-right">
                    Mensaje
                  </Label>
                  <Textarea id="message" placeholder="Escribe tu mensaje aquí." className="col-span-3" value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSubmit}>Enviar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleWhatsAppClick} style={{ backgroundColor: 'purple', color: 'white' }}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Enviar WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
