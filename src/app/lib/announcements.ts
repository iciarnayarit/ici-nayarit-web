export const featuredAnnouncement = {
  category: 'Destacado',
  date: '20 Oct 2023',
  title: 'Gran Convocatoria de Oración Regional',
  description: 'Este viernes nos reuniremos todas las iglesias de la zona para interceder por nuestra comunidad, las familias y el crecimiento espiritual de Nayarit. ¡Tu presencia es vital!',
  location: 'Templo Central, Tepic',
  time: '19:00 hrs',
  imageUrl: 'https://i.imgur.com/iR823lO.jpeg',
};

export const recentAnnouncements = [
  {
    category: 'Comunidad',
    date: '18 Oct 2023',
    title: 'Inicio de Escuela Dominical',
    description: 'Iniciamos un nuevo ciclo de enseñanza para los más pequeños. Inscríbelos este domingo al finalizar el culto.',
    link: 'Ver detalles',
    imageUrl: 'https://i.imgur.com/Ttvfam9.png',
    location: 'Templo de Betania', 
    time: '10:00 hrs'
  },
  {
    category: 'Evento',
    date: '15 Oct 2023',
    title: 'Audiciones para el Coro',
    description: '¿Tienes talento para el canto? Te invitamos a participar en las audiciones para nuestro ministerio de alabanza.',
    link: 'Ver detalles',
    imageUrl: 'https://i.imgur.com/YWlQCbQ.png',
    location: 'Auditorio Principal', 
    time: '18:00 hrs'
  },
  {
    category: 'Misiones',
    date: '12 Oct 2023',
    title: 'Brigada de Ayuda en La Sierra',
    description: 'Estaremos visitando comunidades necesitadas el próximo mes. Estamos recolectando víveres y ropa en buen estado.',
    link: '¿Cómo ayudar?',
    imageUrl: 'https://i.imgur.com/ZrwSADZ.png',
    location: 'Centro de acopio', 
    time: 'Todo el día'
  },
  {
    category: 'Aviso',
    date: '10 Oct 2023',
    title: 'Cambio de Horario: Células',
    description: 'Informamos a todos los líderes que la reunión de capacitación mensual ha sido reprogramada para el lunes a las 20:00.',
    link: 'Ver horario',
    imageUrl: 'https://i.imgur.com/NZYoeBJ.jpeg',
    location: 'Salón de conferencias', 
    time: '20:00 hrs'
  },
];

export const allAnnouncements = [featuredAnnouncement, ...recentAnnouncements];

export const slugify = (text: string) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};