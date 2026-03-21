'use client';

import { Card, CardContent } from "@/app/components/ui/card";
import { Download, Share2 } from "lucide-react";
import { Button } from "./ui/button";

interface ImagePreviewProps {
    imageRef: React.RefObject<HTMLDivElement>;
    verse: string | null;
    reference: string | null;
    textColor: string;
    outlineColor: string;
    backgroundColor: string;
    backgroundImage: string;
    aspectRatio: string;
    onDownload: () => void;
}

export default function ImagePreview({
    imageRef,
    verse,
    reference,
    textColor,
    outlineColor,
    backgroundColor,
    backgroundImage,
    aspectRatio,
    onDownload,
}: ImagePreviewProps) {
    const getAspectRatioClass = () => {
        if (aspectRatio === "9:12") {
            return "aspect-[9/12]";
        } else if (aspectRatio === "12:9") {
            return "aspect-[12/9]";
        } else {
            return "";
        }
    };

    const textShadow = `-1px -1px 0 ${outlineColor}, 1px -1px 0 ${outlineColor}, -1px 1px 0 ${outlineColor}, 1px 1px 0 ${outlineColor}`;

    return (
        <div className="relative">
            <div
                ref={imageRef}
                style={{
                    backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
                    color: textColor,
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
                className={`p-8 rounded-lg ${getAspectRatioClass()}`}>
                <Card className="h-full flex flex-col justify-center bg-transparent border-none">
                    <CardContent className="p-6 md:p-8 text-center">
                        <p
                            className="text-2xl font-serif text-center"
                            style={{ textShadow }}
                            dangerouslySetInnerHTML={{ __html: verse || "" }}
                        />
                        <p className="text-center text-lg" style={{ textShadow }}>{reference}</p>
                    </CardContent>
                </Card>
            </div>
            <div className="absolute bottom-4 right-4 flex gap-2">
                <Button onClick={onDownload} size="icon" variant="secondary">
                    <Download className="h-5 w-5" />
                </Button>
                <Button onClick={() => { /* Implement share functionality */ }} size="icon" variant="secondary">
                    <Share2 className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
