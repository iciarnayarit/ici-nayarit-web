'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleWhatsAppClick = () => {
    const message = "Hola, tengo una duda sobre las ubicaciones de los templos.";
    const whatsappUrl = `https://wa.me/message/FRG3AOJMUKQOD1?text=${encodeURIComponent(message)}`;
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
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold font-headline mb-4">¿Tienes más dudas?</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Ponte en contacto con nosotros a través de correo electrónico o WhatsApp.
        </p>
        <div className="flex justify-center gap-4">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            {
              /*
              <DialogTrigger asChild>
              <Button onClick={() => setIsModalOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Enviar Correo
              </Button>
            </DialogTrigger>
              * */
            }
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
          <Button onClick={handleWhatsAppClick} variant="outline">
            <MessageCircle className="mr-2 h-4 w-4" />
            Enviar WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
