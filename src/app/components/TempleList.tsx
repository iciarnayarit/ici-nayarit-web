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
import { useState } from "react";
import { useIsMobile } from "@/app/hooks/use-mobile";

export const TempleList = () => {
    const [selectedTemple, setSelectedTemple] = useState(templeLocations[0]);
    const isMobile = useIsMobile();

    const handleShareInteraction = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedTemple.lat},${selectedTemple.lng}`;
    const shareDetails = `Templo: ${selectedTemple.nameKey}\nDirección: ${selectedTemple.addressKey}`;
    const shareText = `¡Echa un vistazo a este templo!\n\n${shareDetails}`;
    const whatsappText = `${shareText}\n\nVer en Google Maps: ${googleMapsUrl}`;
    const twitterText = `¡Echa un vistazo a este templo! ${selectedTemple.nameKey}`;
    const textToCopy = `Templo: ${selectedTemple.nameKey}\nDirección: ${selectedTemple.addressKey}\nGoogle Maps: ${googleMapsUrl}`;

    if (isMobile) {
        return (
            <div className="flex flex-col space-y-4">
                {templeLocations.map((temple, index) => (
                    <Card key={index} onClick={() => setSelectedTemple(temple)} className="cursor-pointer">
                        <CardContent className="p-4">
                            <h3 className="font-bold">{temple.nameKey}</h3>
                            <p className="text-sm text-gray-500">{temple.addressKey}</p>
                            {selectedTemple.nameKey === temple.nameKey && (
                                <div className="mt-4">
                                    <iframe
                                        key={selectedTemple.nameKey}
                                        src={selectedTemple.embedUrl}
                                        width="100%"
                                        height="300"
                                        style={{ border: 0 }}
                                        allowFullScreen={false}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 flex flex-col space-y-4">
                {templeLocations.map((temple, index) => (
                    <Card key={index} onClick={() => setSelectedTemple(temple)} className={`cursor-pointer ${selectedTemple.nameKey === temple.nameKey ? 'border-primary' : ''}`}>
                        <CardContent className="p-4">
                            <h3 className="font-bold">{temple.nameKey}</h3>
                            <p className="text-sm text-gray-500">{temple.addressKey}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="md:col-span-8 sticky top-20 self-start">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-grow pr-4">
                                <h3 className="font-bold">{selectedTemple.nameKey}</h3>
                                <p className="text-sm text-gray-500">{selectedTemple.addressKey}</p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={handleShareInteraction}>
                                        <Share2 className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent onClick={handleShareInteraction}>
                                    <DropdownMenuItem asChild>
                                        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full cursor-pointer">
                                            Google Maps
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href={`https://waze.com/ul?ll=${selectedTemple.lat},${selectedTemple.lng}&navigate=yes`} target="_blank" rel="noopener noreferrer" className="w-full h-full cursor-pointer">
                                            Waze
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(googleMapsUrl)}&quote=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="w-full h-full cursor-pointer">
                                            Facebook
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(googleMapsUrl)}&text=${encodeURIComponent(twitterText)}`} target="_blank" rel="noopener noreferrer" className="w-full h-full cursor-pointer">
                                            Twitter
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noopener noreferrer" className="w-full h-full cursor-pointer">
                                            WhatsApp
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleCopy(textToCopy)} className="cursor-pointer">
                                        <ClipboardCopy className="mr-2 h-4 w-4" />
                                        <span>Copiar</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="mt-4">
                            <iframe
                                key={selectedTemple.nameKey}
                                src={selectedTemple.embedUrl}
                                width="100%"
                                height="450"
                                style={{ border: 0 }}
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
