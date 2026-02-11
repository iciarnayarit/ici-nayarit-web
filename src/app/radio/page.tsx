
export default function RadioPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Radio en vivo</h1>
        <p className="mt-4 text-lg text-foreground/80">
            Escucha la radio en vivo y las predicaciones todos los días.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-1 mt-1">
        <div className="bg-muted rounded-lg aspect-video overflow-hidden">
            <iframe
                width="100%"
                height="100%"
                src="https://icipdrgdl.com/radio"
                title="transmisión en vivo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
      </div>
    </div>
  );
}
