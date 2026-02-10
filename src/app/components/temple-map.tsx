'use client';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Share2 } from 'lucide-react';
import { SocialIcons } from './social-icons';

interface TempleLocation {
  nameKey: string;
  addressKey: string;
  embedUrl: string;
  shareMapUrl: string; // Direct link to Google Maps for sharing
  lat: number;
  lng: number;
}

const templeLocations: TempleLocation[] = [
  {
    nameKey: "Templo La Nueva Jerusalen",
    addressKey: "Hierro 233, Valle de Matatipac, 63195 Tepic, Nay.",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d333.9191988880581!2d-104.86976599584307!3d21.46997991749337!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842737354cd064b3%3A0xa6f2bbbe2601b518!2sHierro%20233%2C%20Valle%20de%20Matatipac%2C%2063195%20Tepic%2C%20Nay.!5e0!3m2!1ses!2smx!4v1763710351754!5m2!1ses!2smx",
    shareMapUrl: "https://maps.app.goo.gl/UxbpUuo75ZHD8oBTA", // Replace with actual share link
    lat: 21.4699799,
    lng: -104.869766,
  },
  {
    nameKey: "Templo Getsemaní",
    addressKey: "Tijuanita, Valparaíso, 63625 Ruiz, Nay.",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7400.839893463428!2d-105.13056705962508!3d21.9568400204033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x869e022a9f73cbe7%3A0x9a314fed2090d1a6!2sTemplo%20%22GETSEMANI%22%20Iglesia%20Cristiana%20Interdenominacional%20A.R!5e0!3m2!1ses!2smx!4v1763710254004!5m2!1ses!2smx",
    shareMapUrl: "https://maps.app.goo.gl/8wicjsPaJa8HDjuWA", // Replace with actual share link
    lat: 21.95684,
    lng: -105.1305671,
  },
  {
    nameKey: "Templo en El Limón",
    addressKey: "El Limón, Nayarit",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4846.632995966584!2d-104.48899732105933!3d22.026281709578207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x869d89007f903937%3A0xae23955c2988a9e1!2sEl%20Lim%C3%B3n%20Nayarit!5e0!3m2!1ses!2smx!4v1763710166525!5m2!1ses!2smx",
    shareMapUrl: "https://maps.app.goo.gl/225tfwZ7PJ2rt8Z66", // Replace with actual share link
    lat: 22.0262817,
    lng: -104.4889973,
  },
  {
    nameKey: "Misión en Aguamilpa",
    addressKey: "Aguamilpa, Nayarit",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7453.561566843972!2d-105.03338325973698!3d20.921137494355136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8426ccb965d837ef%3A0x64f1ead2843143d2!2s63739%20Aguamilpa%2C%20Nay.!5e0!3m2!1ses!2smx!4v1763710077433!5m2!1ses!2smx",
    shareMapUrl: "https://maps.app.goo.gl/MN4TYvg9T9nTejdy7", // Replace with actual share link
    lat: 20.9211375,
    lng: -105.0333833,
  },
  {
    nameKey: "Misión en El Naranjo",
    addressKey: "El Naranjo, Sierra del Nayar, Nayarit",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d59174.41541516735!2d-104.5952352!3d22.0342524!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x869d893269200aeb%3A0x20906214d015f3eb!2sEl%20naranjo!5e0!3m2!1ses!2smx!4v1763709976781!5m2!1ses!2smx",
    shareMapUrl: "https://maps.app.goo.gl/jkVHbG9zE2TwWu5s7", // Replace with actual share link
    lat: 22.0342524,
    lng: -104.5952352,
  },
  {
    nameKey: "Iglesia en Cofradia de Pericos",
    addressKey: "Cofradia de Pericos, Sierra del Nayar, Nayarit",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7395.734919633707!2d-104.5427297!3d22.054665!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x869d894a7a5e3af9%3A0x739326f339c6c8!2sCofradia%20de%20Pericos!5e0!3m2!1ses!2smx!4v1763709737246!5m2!1ses!2smx",
    shareMapUrl: "https://maps.app.goo.gl/fqCA8UDdwX9z7fuV8", // Replace with actual share link
    lat: 22.054665,
    lng: -104.5427297,
  },
  {
    nameKey: "Misión en Los Cuervitos",
    addressKey: "Los Cuervitos, Sierra del Nayar, Nayarit",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d29591.6100875233!2d-104.4385575!3d22.0131784!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x869d87abb706cd7d%3A0x51089336861455cd!2s63536%20Los%20Cuervitos%2C%20Nay.!5e0!3m2!1ses!2smx!4v1763709660173!5m2!1ses!2smx",
    shareMapUrl: "https://maps.app.goo.gl/QdScKMiQPf5GryzK7", // Replace with actual share link
    lat: 22.0131784,
    lng: -104.4385575,
  },
  {
    nameKey: "Misión en San Miguel Huaixtita",
    addressKey: "San Miguel Huaixtita, Sierra del Nayar, Nayarit",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3697.4613685403947!2d-104.32004819999999!3d22.0701906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x869d818f6dfe14d3%3A0x4515dbc95402cbff!2s46070%20San%20Miguel%2C%20Jal.!5e0!3m2!1ses!2smx!4v1763709595370!5m2!1ses!2smx",
    shareMapUrl: "https://maps.app.goo.gl/yYYZSFDQ8udHGdTQA", // Replace with actual share link
    lat: 22.0701906,
    lng: -104.3200482,
  },
  {
    nameKey: "Misión en Ixtlán del Río",
    addressKey: "Ixtlán del Río, Nayarit",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29791.18621917855!2d-104.3684997!3d21.036755799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8426f74af4a3504d%3A0x1e108935d279898b!2zSXh0bMOhbiBkZWwgUsOtbywgTmF5Lg!5e0!3m2!1ses!2smx!4v1763709531797!5m2!1ses!2smx",
    shareMapUrl: "https://maps.app.goo.gl/Qyjb9dyrMxKHEceUA", // Replace with actual share link
    lat: 21.0367558,
    lng: -104.3684997,
  },
  {
    nameKey: "Misión en Puerta Azul",
    addressKey: "Puerta Azul, Santiago Ixcuintla, Nayarit",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14814.806821448752!2d-105.1766387!3d21.8304533!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8420a927203d987b%3A0x14927855209720d3!2s63552%20Puerta%20Azul%2C%20Nay.!5e0!3m2!1ses!2smx!4v1763709465050!5m2!1ses!2smx",
    shareMapUrl: "https://maps.app.goo.gl/fe5uMoB6XR61CES97", // Replace with actual share link
    lat: 21.8304533,
    lng: -105.1766387,
  },
  {
    nameKey: "Templo en la Col. el Ahualamo",
    addressKey: "Col. el Ahualamo, Santa María del Oro, Nayarit",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7441.208505856926!2d-104.62683190971086!3d21.16814197700565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8426e057bc105ffd%3A0x89da5529da195b11!2s63870%20Col.%20el%20Ahualamo%2C%20Nay.!5e0!3m2!1ses-419!2smx!4v1763709342228!5m2!1ses-419!2smx",
    shareMapUrl: "https://maps.app.goo.gl/Z2Li4f2EYBdXEoPH9", // Replace with actual share link
    lat: 21.168132,
    lng: -104.6268319,
  },
  {
    nameKey: "Misión en El Saucito",
    addressKey: "El Saucito, sierra del Nayar, Nayarit",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3690.547248908512!2d-104.38288757413066!3d22.332956328541545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x869d98b4607b52a7%3A0xc1d44904518980ec!2s63535%20El%20Saucito%20Peyot%C3%A1n%2C%20Nay.!5e0!3m2!1ses!2smx!4v1763710819478!5m2!1ses!2smx",
    shareMapUrl: "https://maps.app.goo.gl/VSoJAdTLk38bPbxVA", // Replace with actual share link
    lat: 22.3329563,
    lng: -104.3828876,
  },
  {
    nameKey: "Misión en Rancho Viejo",
    addressKey: "Rancho Viejo, sierra del Nayar, Nayarit",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9671.457354755836!2d-104.4417034166469!3d22.342735356417677!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x869d9876fb3487cd%3A0x58e722e4999baab7!2s63535%20Rancho%20Viejo%2C%20Nay.!5e0!3m2!1ses!2smx!4v1763711175400!5m2!1ses!2smx",
    shareMapUrl: "https://maps.app.goo.gl/hQf6fXetMcjmPKAp8", // Replace with actual share link
    lat: 22.3427354,
    lng: -104.4417034,
  },
  {
    nameKey: "Misión en El Pintadeño",
    addressKey: "El Pintadeño, San Blas, Nayarit",
    embedUrl: "https://www.google.com/maps/embed?pb=!3m2!1ses!2smx!4v1763711322823!5m2!1ses!2smx!6m8!1m7!1sosy0v3outZLlP8e5rTxodQ!2m2!1d21.57411347025059!2d-105.0832009926285!3f246.8519213215272!4f-7.082200459552325!5f0.7820865974627469",
    shareMapUrl: "https://maps.app.goo.gl/2wrGeavx6TeyDd9NA", // Replace with actual share link
    lat: 22.3427354,
    lng: -104.4417034,
  }
];

export default function TempleMap() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {templeLocations.map((location, index) => (
            <Card key={index} className="overflow-hidden relative">
              <CardHeader>
                <CardTitle>{location.nameKey}</CardTitle>
                <CardDescription>{location.addressKey}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-64 w-full mb-4">
                  <iframe
                    src={location.embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Mapa de ${location.nameKey}`}
                  ></iframe>
                </div>
              </CardContent>
              <div className="absolute top-4 right-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Compartir ubicación</DialogTitle>
                      <DialogDescription>
                        {`Selecciona una plataforma para compartir la ubicación de ${location.nameKey}.`}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <SocialIcons
                        shareUrl={location.shareMapUrl}
                        quote={`Ubicación del templo ${location.nameKey}: ${location.addressKey}`} 
                        lat={location.lat}
                        lng={location.lng}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
