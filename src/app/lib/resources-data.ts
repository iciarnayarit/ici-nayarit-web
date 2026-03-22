import { ArrowRight, DownloadCloud, ExternalLink, Download, BookOpen, Scissors, Headphones } from 'lucide-react';

export const slugify = (text: string) => {
  return text.toString().toLowerCase()
    .normalize('NFD') // remove diacritics
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const resourceItems = [
    {
        category: 'MULTIMEDIA - SERMÓN',
        title: 'Viviendo en Santidad',
        description: 'Serie de sermones sobre el caminar diario del creyente en el mundo con un enfoque práctico y vivencial.',
        imageUrl: 'https://i.imgur.com/PvDorVd.png',
        actionLabel: 'Ver ahora',
        actionIcon: ArrowRight,
        link: '#',
        badge: '48:20',
        content: 'Este sermón forma parte de nuestra serie "Caminando en la Verdad". Exploramos Romanos 12 y descubrimos juntos lo que significa presentar nuestros cuerpos como sacrificio vivo. Acompáñanos a profundizar en la Palabra y aplicar estas enseñanzas milenarias a nuestros retos modernos.'
    },
    {
        category: 'DOCUMENTO - GUÍA',
        title: 'Guía de Estudio Bíblico',
        description: 'Material complementario para el estudio personal de la epístola a los Efesios.',
        imageUrl: 'https://i.imgur.com/pIdxDkl.jpeg',
        actionLabel: 'Descargar',
        actionIcon: DownloadCloud,
        link: '#',
        badge: 'PDF',
        content: 'Una guía diseñada detalladamente para acompañar tus devocionales matutinos. Contiene preguntas de reflexión, contexto histórico y aplicación práctica para la vida diaria. ¡Imprescindible para tu crecimiento espiritual!'
    },
    {
        category: 'HERRAMIENTA - INTERACTIVA',
        title: 'Línea del Tiempo Bíblica',
        description: 'Explora los eventos clave de la Biblia de manera cronológica y visual.',
        imageUrl: 'https://i.imgur.com/iR823lO.jpeg',
        actionLabel: 'Acceder',
        actionIcon: ExternalLink,
        link: '#',
        content: 'Un recurso visual que mapea los principales eventos desde Génesis hasta Apocalipsis. Perfecto para entender el hilo conductor de la redención y cómo todas las historias se conectan maravillosamente en Cristo.'
    },
    {
        category: 'DESCARGA - DISEÑO',
        title: 'Wallpapers ICIAR',
        description: 'Fondos de pantalla oficiales para tu celular y computadora con versículos inspiradores.',
        imageUrl: 'https://i.imgur.com/Ttvfam9.png',
        actionLabel: 'Descargar Pack',
        actionIcon: Download,
        link: '#',
        content: 'Lleva la Palabra contigo y comparte tu fe, incluso en tu teléfono. Descarga estos hermosos diseños gratuitos y compártelos con tus amigos. Actualizamos los fondos de pantalla periódicamente.'
    },
    {
        category: 'DOCUMENTO - BOLETÍN',
        title: 'Boletín Mensual Mayo',
        description: 'Noticias, eventos y planes de oración para el mes de Mayo en Nayarit.',
        imageUrl: 'https://i.imgur.com/YWlQCbQ.png',
        actionLabel: 'Leer Boletín',
        actionIcon: BookOpen,
        link: '#',
        content: 'Nuestro boletín oficial donde encontrarás reportes de misiones, próximos bautismos, testimonios impactantes y la agenda completa de ministerios locales.'
    },
    {
        category: 'DESCARGA - LOGOS',
        title: 'Identidad Visual ICIAR',
        description: 'Logos en alta resolución, fuentes y manual de uso para congregaciones.',
        imageUrl: 'https://i.imgur.com/ZrwSADZ.png',
        actionLabel: 'Kit de Marca',
        actionIcon: Download,
        link: '#',
        content: 'Mantengamos la unidad visual como concilio. En este paquete encontrarás logos en vectores, manual de identidad y plantillas base para presentaciones.'
    },
    {
        category: 'HERRAMIENTA - GENERADOR',
        title: 'Creador de Imágenes',
        description: 'Herramienta web para crear versículos visuales con el logo oficial.',
        imageUrl: 'https://i.imgur.com/NZYoeBJ.jpeg',
        actionLabel: 'Abrir Creador',
        actionIcon: Scissors,
        link: '#',
        content: 'Crea tu propio contenido cristiano listo para Instagram y Facebook con unos pocos clics. Solo pega tu versículo, elige el fondo y genera tu imagen.'
    },
    {
        category: 'MULTIMEDIA - AUDIO',
        title: 'Podcast: Fe y Cultura',
        description: 'Conversaciones semanales sobre cómo vivir la fe en la cultura nayarita.',
        imageUrl: 'https://i.imgur.com/iR823lO.jpeg',
        actionLabel: 'Escuchar Audio',
        actionIcon: Headphones,
        link: '#',
        content: 'Acompaña al Pastor en estos episodios donde abordamos los temas actuales bajo la lente de las Escrituras. Ideal para escuchar camino al trabajo o la escuela.'
    }
];
