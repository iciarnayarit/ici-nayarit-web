"use client";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu";
import { templeLocations } from "@/app/lib/temples-data";
import { ClipboardCopy, Share2 } from "lucide-react";

export const TempleList = () => {

    const openInNewTab = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleShareInteraction = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="flex flex-col space-y-4">
            {templeLocations.map((temple, index) => {
                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${temple.lat},${temple.lng}`;
                const shareDetails = `Templo: ${temple.nameKey}\nDirección: ${temple.addressKey}`;
                const shareText = `¡Echa un vistazo a este templo!\n\n${shareDetails}`;
                const whatsappText = `${shareText}\n\nVer en Google Maps: ${googleMapsUrl}`;
                const twitterText = `¡Echa un vistazo a este templo! ${temple.nameKey}`;
                const textToCopy = `Templo: ${temple.nameKey}\nDirección: ${temple.addressKey}\nGoogle Maps: ${googleMapsUrl}`;

                return (
                    <Card key={index}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-grow pr-4">
                                    <h3 className="font-bold">{temple.nameKey}</h3>
                                    <p className="text-sm text-gray-500">{temple.addressKey}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={handleShareInteraction}>
                                            <Share2 className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent onClick={handleShareInteraction}>
                                        <DropdownMenuItem onClick={() => openInNewTab(googleMapsUrl)}>
                                            Google Maps
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => openInNewTab(`https://waze.com/ul?ll=${temple.lat},${temple.lng}&navigate=yes`)}>
                                            Waze
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => openInNewTab(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(googleMapsUrl)}&quote=${encodeURIComponent(shareText)}`)}>
                                            Facebook
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => openInNewTab(`https://twitter.com/intent/tweet?url=${encodeURIComponent(googleMapsUrl)}&text=${encodeURIComponent(twitterText)}`)}>
                                            Twitter
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => openInNewTab(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`)}>
                                            WhatsApp
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleCopy(textToCopy)}>
                                            <ClipboardCopy className="mr-2 h-4 w-4" />
                                            <span>Copiar</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="mt-4">
                                <iframe
                                    src={temple.embedUrl}
                                    width="100%"
                                    height="300"
                                    style={{ border: 0 }}
                                    allowFullScreen={false}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );
};
