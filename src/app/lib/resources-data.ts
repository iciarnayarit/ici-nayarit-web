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
        category: 'DOCUMENTO - PLAN',
        title: 'Plan de Predicación 2026',
        description: 'Calendario y temas sugeridos para la exposición de la Palabra durante el año 2026.',
        imageUrl: 'https://i.imgur.com/pIdxDkl.jpeg',
        actionLabel: 'Descargar PDF',
        actionIcon: DownloadCloud,
        link: '/recursos/Plan de predicación - 2026.pdf',
        badge: 'PDF',
        content: 'Este plan de predicación ha sido diseñado para guiar a nuestras congregaciones en un estudio sistemático y profundo de las Escrituras durante todo el año 2026, asegurando que cubramos los temas doctrinales y prácticos esenciales para la vida cristiana.'
    },
    {
        category: 'DOCUMENTO - Evangelismo',
        title: 'El Mejor Regalo',
        description: 'Material de evangelismo 2025 para compartir las buenas nuevas de salvación.',
        imageUrl: '/images/announcements/cross-reflection.png',
        actionLabel: 'Descargar PDF',
        actionIcon: DownloadCloud,
        link: '/recursos/Tract 2025_El Mejor Fortaleza.pdf',
        badge: 'PDF',
        content: 'Un mensaje corto y potente diseñado para ser compartido con aquellos que aún no conocen a Cristo, recordándoles que Él es nuestra fortaleza en todo tiempo.'
    },
    {
        category: 'DOCUMENTO - Evangelismo',
        title: 'Fortaleza para el Alma',
        description: 'Tract especial para la temporada de reflexión en el Día de Muertos.',
        imageUrl: '/images/announcements/holy-week.png',
        actionLabel: 'Descargar PDF',
        actionIcon: DownloadCloud,
        link: '/recursos/Tract Día de Muertos 2025 FORTALEZA PARA EL ALMA-1.pdf',
        badge: 'PDF',
        content: 'Material evangelístico diseñado específicamente para llevar esperanza y verdad bíblica acerca de la vida eterna durante las fechas de conmemoración tradicional.'
    },
    {
        category: 'HERRAMIENTA - BÍBLICA',
        title: 'Biblia Paralela',
        description: 'Herramienta integral para comparar diferentes traducciones y profundizar en el estudio del texto sagrado.',
        imageUrl: 'https://i.imgur.com/ZrwSADZ.png',
        actionLabel: 'Acceder',
        actionIcon: ExternalLink,
        link: 'https://bibliaparalela.com/',
        badge: 'WEB',
        content: 'Accede a una amplia gama de herramientas de estudio, incluyendo concordancias, diccionarios y comentarios integrados en una sola plataforma multilingüe.'
    },
    {
        category: 'HERRAMIENTA - DICCIONARIO',
        title: 'Concordancia Strong',
        description: 'Diccionario especializado en el significado original de las palabras en hebreo y griego.',
        imageUrl: '/images/announcements/congress.png',
        actionLabel: 'Buscar Original',
        actionIcon: ExternalLink,
        link: 'https://bibliaparalela.com/hebrew/strongs_430.htm',
        badge: 'H/G',
        content: 'Explora la raíz etimológica de los términos bíblicos para una comprensión exegética más profunda de las enseñanzas doctrinales.'
    },
    {
        category: 'HERRAMIENTA - ESTUDIO',
        title: 'Biblia Interlineal y Léxico',
        description: 'Gramática detallada, léxico y texto original hebreo/griego palabra por palabra.',
        imageUrl: '/images/announcements/palm-sunday.png',
        actionLabel: 'Ver Interlineal',
        actionIcon: ExternalLink,
        link: 'https://www.bibliatodo.com/interlineal/genesis-1-1',
        badge: 'ORIGINAL',
        content: 'Analiza la estructura gramatical y la sintaxis original del texto bíblico para una interpretación fiel de las Escrituras.'
    },
    {
        category: 'HERRAMIENTA - COMENTARIO',
        title: 'Comentarios Bíblicos Avanzados',
        description: 'Análisis detallado de teólogos y académicos sobre cada versículo y capítulo.',
        imageUrl: '/images/announcements/meeting.png',
        actionLabel: 'Leer Comentarios',
        actionIcon: BookOpen,
        link: 'https://bibliaparalela.com/comentario/genesis/1-1.htm',
        badge: 'ESTUDIO',
        content: 'Accede a las perspectivas de experimentados teólogos y eruditos bíblicos a través de Biblia Paralela y BibliaPlus para enriquecer tu formación ministerial.'
    },
    {
        category: 'HERRAMIENTA - VERSIONES',
        title: 'BibleGateway (Múltiples Versiones)',
        description: 'Acceso a cientos de traducciones de la Biblia en diversos idiomas y formatos.',
        imageUrl: 'https://i.imgur.com/PvDorVd.png',
        actionLabel: 'Explorar Versiones',
        actionIcon: ExternalLink,
        link: 'https://www.biblegateway.com/passage/?search=Genesis%201&version=RVR1960',
        badge: 'RVR1960',
        content: 'Compara y estudia distintas versiones bíblicas, desde la Reina Valera 1960 hasta traducciones contemporáneas y lenguas originales.'
    },
    {
        category: 'HERRAMIENTA - SOFTWARE',
        title: 'Software Bíblico Logos',
        description: 'La plataforma de software para el estudio de la Biblia más avanzada del mundo.',
        imageUrl: 'https://i.imgur.com/Ttvfam9.png',
        actionLabel: 'Planes Logos',
        actionIcon: ExternalLink,
        link: 'https://es.logos.com/configure/subscriptions?trackId=193',
        badge: 'LOGOS',
        content: 'Herramientas de nivel profesional para pastores, seminaristas y estudiantes serios de las Escrituras.'
    },
    /*{
        category: 'DESCARGA - LOGOTIPO',
        title: 'Identidad Visual ICIAR',
        description: 'Logos en alta resolución, fuentes y manual de uso para congregaciones.',
        imageUrl: '/images/logo-iciar.png',
        actionLabel: 'Kit de Marca',
        actionIcon: Download,
        link: '/images/logo-iciar.png',
        content: 'Mantengamos la unidad visual como concilio. En este paquete encontrarás logos en vectores, manual de identidad y plantillas base para presentaciones.'
    }*/
];
