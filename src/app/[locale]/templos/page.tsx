import TempleMap from "@/app/[locale]/components/temple-map";
import ContactSection from "@/app/[locale]/components/contact-section";
import { useTranslations } from "next-intl";

export default function TemplosPage() {
  const t = useTranslations('TempleMap');

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t('title')}</h1>
        <p className="mt-4 text-lg text-foreground/80">
            {t('description')}
        </p>
      </div>
      <TempleMap />
      <ContactSection />
    </div>
  );
}
