
import { TempleList } from "@/app/components/TempleList";

export default function TemplosPage() {

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ubicaciones de la Iglesia</h1>
        <p className="mt-4 text-lg text-foreground/80">
            A continuación se muestran los detalles y la ubicación de cada una de nuestras iglesias.
        </p>
      </div>
      <TempleList />
    </div>
  );
}
