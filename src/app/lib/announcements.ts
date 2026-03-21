export const featuredAnnouncement = {
  category: 'Destacado',
  date: '24 May 2024',
  title: 'Pentecostés',
  description: 'Celebremos juntos la venida del Espíritu Santo. Un día de renovación y poder espiritual para toda la iglesia.',
  location: 'Templo Central, Tepic',
  time: '10:00 hrs',
  imageUrl: 'https://i.imgur.com/iR823lO.jpeg',
};

export const recentAnnouncements = [
  {
    category: 'Celebración',
    date: '5-12 Abr 2025',
    title: 'Semana de la Pasión, Muerte y Resurrección',
    description: 'Acompáñanos en esta semana de reflexión y conmemoración. Estado: Pendiente.',
    link: 'Ver detalles',
    imageUrl: 'https://i.imgur.com/Ttvfam9.png',
    location: 'Lugar por confirmar', 
    time: 'Hora pendiente'
  },
  {
    category: 'Evento',
    date: '02 Abr 2025',
    title: 'Mesa del Señor en Tijuanita',
    description: 'Participa en este tiempo de comunión y recordatorio. Estado: Pendiente.',
    link: 'Ver detalles',
    imageUrl: 'https://i.imgur.com/YWlQCbQ.png',
    location: 'Tijuanita', 
    time: 'Hora pendiente'
  },
    {
    category: 'Celebración',
    date: '05 Abr 2025',
    title: 'Domingo de Resurrección',
    description: '¡Cristo ha resucitado! Celebremos juntos la victoria. Estado: Pendiente.',
    link: 'Ver detalles',
    imageUrl: 'https://i.imgur.com/iR823lO.jpeg',
    location: 'Lugar por confirmar', 
    time: 'Hora pendiente'
  },
  {
    category: 'Comunidad',
    date: '25-26 Abr 2025',
    title: 'Mesa de Trabajo en Tijuanita (Abril)',
    description: 'Reunión para organizar las próximas actividades. Estado: Pendiente.',
    link: 'Ver detalles',
    imageUrl: 'https/i.imgur.com/NZYoeBJ.jpeg',
    location: 'Tijuanita', 
    time: 'Hora pendiente'
  },
  {
    category: 'Celebración',
    date: '24 May 2025',
    title: 'Celebración de Pentecostés 2025',
    description: 'Celebración especial de Pentecostés. Estado: Pendiente.',
    link: 'Ver detalles',
    imageUrl: 'https://i.imgur.com/iR823lO.jpeg',
    location: 'Lugar por confirmar', 
    time: 'Hora pendiente'
  },
  {
    category: 'Misiones',
    date: '23-24 May 2025',
    title: 'Visita a los Hermanos en Cofradía',
    description: 'Llevaremos la palabra y ayuda a nuestros hermanos. Estado: Pendiente.',
    link: 'Ver detalles',
    imageUrl: 'https://i.imgur.com/ZrwSADZ.png',
    location: 'Cofradía', 
    time: 'Hora pendiente'
  },
  {
    category: 'Comunidad',
    date: '23-24 May 2025',
    title: 'Mesa de Trabajo en Cofradía',
    description: 'Reunión de planificación y organización. Estado: Pendiente.',
    link: 'Ver detalles',
    imageUrl: 'https://i.imgur.com/NZYoeBJ.jpeg',
    location: 'Cofradía', 
    time: 'Hora pendiente'
  },
  {
    category: 'Comunidad',
    date: 'May 2025',
    title: 'Semana de Actividades para Niños',
    description: 'Una semana llena de juegos y aprendizaje bíblico para los más pequeños. Estado: Pendiente.',
    link: 'Ver detalles',
    imageUrl: 'https://i.imgur.com/Ttvfam9.png',
    location: 'Lugar por confirmar', 
    time: 'Hora pendiente'
  },
  {
    category: 'Comunidad',
    date: '27-28 May 2025',
    title: 'Mesa de Trabajo en Tijuanita (Mayo)',
    description: 'Únete a nosotros para planificar los próximos eventos. Estado: Pendiente.',
    link: 'Ver detalles',
    imageUrl: 'https://i.imgur.com/NZYoeBJ.jpeg',
    location: 'Tijuanita', 
    time: 'Hora pendiente'
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