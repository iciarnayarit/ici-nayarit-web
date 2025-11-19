import { Card, CardContent } from "@/components/ui/card";

export default function VideosPage() {
  const videos = [
    { id: "LL6bSle2a4Y", title: "Video 1" },
    { id: "LL6bSle2a4Y", title: "Video 2" },
    { id: "LL6bSle2a4Y", title: "Video 3" },
    { id: "LL6bSle2a4Y", title: "Video 4" },
    { id: "LL6bSle2a4Y", title: "Video 5" },
    { id: "LL6bSle2a4Y", title: "Video 6" },
  ];

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <h1 className="mb-8 text-center text-4xl font-bold font-headline">Videos</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
