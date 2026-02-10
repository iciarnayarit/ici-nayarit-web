import Footer from '@/app/components/footer';
import Header from '@/app/components/header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ICIAR Nayarit',
  description: 'Somos una Iglesia Cristiana Interdenominacional comprometida con compartir el amor de Cristo en Nayarit.',
  keywords: [
    'Cristianismo',
    'ICIAR Iglesia Central - Portales',
    'Doctrina',
    'Himno',
    'Logotipo',
    'Himnario',
    'Dios',
    'Oración',
    'Escuela dominical',
    'Iglesia',
    'Vida',
    'Biblia',
    'Himnario ICIAR',
    'Rector',
    'RISING',
    'iglesia iciar',
    'iciar portales',
    'tabernáculo la mansión iciar',
    'puntos doctrinales iciar',
    'ici makis',
    'ici hot',
    'ici puebla',
    'ici radio canada',
    'ici tou tv',
    'ici rdi',
    'ici tout tv',
    'bryan adams ma place est ici',
    'ici première',
    'cici',
    'ici tele',
    'ici rdi en direct',
    'ici télé',
    'ici tout.tv',
  ],
};

type Props = {
  children: React.ReactNode;
};

export default function BibliaLayout({children}: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
