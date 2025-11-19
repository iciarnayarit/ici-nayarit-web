import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function VideosPage() {
  const videos = [
    {
      id: "dQw4w9WgXcQ",
      title: "The Christmas Series",
      thumbnail: "/placeholder-1.jpg",
      source: "Eyewitness"
    },
    {
      id: "L-2r_IqCrm0",
      title: "Jesus",
      thumbnail: "/placeholder-2.jpg",
      source: "From the Gospel of Luke"
    },
    {
      id: "G0-201-68s",
      title: "Torah Series",
      thumbnail: "/placeholder-3.jpg",
      source: "BibleProject"
    },
    {
      id: "e_s_p3A_1A8",
      title: "Four Gospels",
      thumbnail: "/placeholder-4.jpg",
      source: "Lumo"
    },
    {
      id: "XzLeYdht3Ag",
      title: "New Testament",
      thumbnail: "/placeholder-5.jpg",
      source: "BibleProject"
    },
    {
      id: "iL3oGf2-f7c",
      title: "BibleProject: How To Read The Bible",
      thumbnail: "/placeholder-6.jpg",
      source: "BibleProject"
    },
    {
      id: "c8cs81fDH4g",
      title: "The Gospel of Mark",
      thumbnail: "/placeholder-7.jpg",
      source: "BibleProject"
    },
    {
      id: "j6ffO3EwP-I",
      title: "Life of Jesus (Gospel of John)",
      thumbnail: "/placeholder-8.jpg",
      source: "Gospel of John"
    },
    {
      id: "EAbdoDftsr4",
      title: "BibleProject: Old Testament",
      thumbnail: "/placeholder-9.jpg",
      source: "BibleProject"
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <h1 className="mb-8 text-center text-4xl font-bold font-headline">Videos</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden group">
            <CardContent className="p-0">
              <div className="aspect-video relative">
                 <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </CardContent>
             <div className="p-4">
              <h3 className="font-bold">{video.title}</h3>
              <p className="text-sm text-muted-foreground">{video.source}</p>
            </div>
          </Card>
        ))}
      </div>
       <div className="mt-12 text-center">
        <Button size="lg" variant="outline">Ver más</Button>
      </div>
    </div>
  );
}
