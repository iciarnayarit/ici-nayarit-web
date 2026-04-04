export type TempleDirectoryEntry = {
  id: number;
  name: string;
  slug: string;
  location: string;
  image: string;
  status: string;
  statusColor: string;
  featured: boolean;
};

export const templeDirectory: TempleDirectoryEntry[] = [
  {
    id: 1,
    name: 'Salt Lake Temple',
    slug: 'salt-lake',
    location: '50 N West Temple St, Salt Lake City, UT 84150',
    image: 'https://images.unsplash.com/photo-1548625361-24838421ccec',
    status: 'Open until 9:00 PM',
    statusColor: 'bg-green-500',
    featured: true,
  },
  {
    id: 2,
    name: 'Rome Italy Temple',
    slug: 'rome-italy',
    location: 'Via di Settebagni, 376, 00138 Roma RM, Italy',
    image: 'https://images.unsplash.com/photo-1533667688223-955a02e6c52a',
    status: 'Open until 8:30 PM',
    statusColor: 'bg-green-500',
    featured: false,
  },
  {
    id: 3,
    name: 'San Diego Temple',
    slug: 'san-diego',
    location: '7474 Charmant Dr, San Diego, CA 92122',
    image: 'https://images.unsplash.com/photo-1544485549-3733c713b1ab',
    status: 'Closing soon',
    statusColor: 'bg-yellow-500',
    featured: false,
  },
  {
    id: 4,
    name: 'London England Temple',
    slug: 'london-england',
    location: 'West Park Rd, Newchapel, Lingfield RH7 6HW, UK',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
    status: 'Open until 9:30 PM',
    statusColor: 'bg-green-500',
    featured: false,
  },
  {
    id: 5,
    name: 'São Paulo Brazil Temple',
    slug: 'sao-paulo',
    location: 'Av. Prof. Francisco Morato, 2430 - Caxingui, Brazil',
    image: 'https://images.unsplash.com/photo-1518063319800-4775d7b579de',
    status: 'Open until 9:00 PM',
    statusColor: 'bg-green-500',
    featured: true,
  },
  {
    id: 6,
    name: 'Washington D.C. Temple',
    slug: 'washington-dc',
    location: '9900 Stoneybrook Dr, Kensington, MD 20895',
    image: 'https://images.unsplash.com/photo-1584989679124-bca5de5bfa4a',
    status: 'Closed for Maintenance',
    statusColor: 'bg-gray-400',
    featured: false,
  },
];

export function getTempleBySlug(slug: string): TempleDirectoryEntry | undefined {
  return templeDirectory.find(t => t.slug === slug);
}
