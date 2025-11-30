import { Facebook, Instagram, Twitter, Link as LinkIcon, Map } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/app/[locale]/hooks/use-toast';

export function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 12a4 4 0 1 0 4 4V8" />
            <path d="M12 12a4 4 0 1 0 4 4V4" />
        </svg>
    );
}

export function SocialIcons({ shareUrl, quote, lat, lng }: { shareUrl: string, quote: string, lat?: number, lng?: number }) {
    const { toast } = useToast();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`${quote} ${shareUrl}`);
        toast({
            title: "Copiado",
            description: "El versículo y el enlace han sido copiados al portapapeles.",
        });
    };

    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(quote)}`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(quote)}`;
    const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(quote)}%20${encodeURIComponent(shareUrl)}`;
    const wazeShareUrl = lat && lng ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes` : '#';

    return (
        <div className="flex justify-center gap-6">
            <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="h-8 w-8" />
            </a>
            <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer">
                <Facebook className="h-8 w-8 text-gray-500 hover:text-gray-700" />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-8 w-8 text-gray-500 hover:text-gray-700" />
            </a>
            <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">
                <TikTokIcon className="h-8 w-8 text-gray-500 hover:text-gray-700" />
            </a>
            <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">
                <Twitter className="h-8 w-8 text-gray-500 hover:text-gray-700" />
            </a>
            {lat && lng && (
                <a href={wazeShareUrl} target="_blank" rel="noopener noreferrer">
                    <Map className="h-8 w-8 text-gray-500 hover:text-gray-700" />
                </a>
            )}
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
                <LinkIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
            </Button>
        </div>
    );
}
