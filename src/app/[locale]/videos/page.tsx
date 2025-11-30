import { useTranslations } from "next-intl";

export default function VideosPage() {
  const t = useTranslations('VideosPage');

  const videos = [
    {
      id: '1',
      youtubeId: 'NswZcM_iSvc',
      titleKey: 'video_1_title',
    },
    {
      id: '2',
      youtubeId: 'dQw4w9WgXcQ', // Placeholder YouTube ID
      titleKey: 'video_2_title',
    },
    {
      id: '3',
      youtubeId: 'someOtherVideoId', // Placeholder YouTube ID
      titleKey: 'video_3_title',
    },
    {
      id: '4',
      youtubeId: 'anotherVideoId', // Placeholder YouTube ID
      titleKey: 'video_4_title',
    },
    {
      id: '5',
      youtubeId: 'yetAnotherVideoId', // Placeholder YouTube ID
      titleKey: 'video_5_title',
    },
    {
      id: '6',
      youtubeId: 'lastVideoId', // Placeholder YouTube ID
      titleKey: 'video_6_title',
    },
    {
      id: '7',
      youtubeId: 'finalVideoId', // Placeholder YouTube ID
      titleKey: 'video_7_title',
    },
    {
      id: '8',
      youtubeId: 'ultimateVideoId', // Placeholder YouTube ID
      titleKey: 'video_8_title',
    },
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t('title')}</h1>
        <p className="mt-4 text-lg text-foreground/80">
            {t('description')}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {videos.map((video) => (
          <div key={video.id} className="bg-muted rounded-lg aspect-video overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${video.youtubeId}`}
              title={t(video.titleKey)}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <h2 className="text-lg font-bold text-center mt-2">{t(video.titleKey)}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
