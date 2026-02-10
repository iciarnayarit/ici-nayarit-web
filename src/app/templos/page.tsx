import ContactSection from "@/app/components/contact-section";
import TempleMap from "@/app/components/temple-map";

export default function TemplosPage() {

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Eres muy bienvenido a aprender y acercarte más a Dios</h1>
        <p className="mt-4 text-lg text-foreground/80">
            Ubica nuestros templos y congregaciones en el estado de Nayarit.
        </p>
      </div>
      <TempleMap />
      <ContactSection />
    </div>
  );
}
