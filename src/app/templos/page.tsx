import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TemplosPage() {
  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nuestros Templos</h1>
        <p className="mt-4 text-lg text-foreground/80">
          Encuentra nuestras ubicaciones en el estado de Nayarit.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Ubicaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-[16/9] w-full rounded-md overflow-hidden">
            <iframe
              src="https://www.google.com/maps/d/embed?mid=1_K4-3_1j4p7_Z_u-p_q_X_y-z_A&ehbc=2E312F"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Templo ICIAR Central, Tepic</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Dirección: Calle Principal 123, Tepic, Nayarit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Templo ICIAR, Xalisco</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Dirección: Avenida Siempre Viva 456, Xalisco, Nayarit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Templo ICIAR, Santiago Ixcuintla</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Dirección: Calle de la Iglesia 789, Santiago Ixcuintla, Nayarit</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}