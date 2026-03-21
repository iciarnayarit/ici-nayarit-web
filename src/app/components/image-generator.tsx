'use client';
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import html2canvas from "html2canvas";
import VerseInput from "@/app/components/verse-input";
import ImagePreview from "@/app/components/image-preview";
import Controls from "@/app/components/controls";

export default function ImageGenerator() {
    const searchParams = useSearchParams();
    const initialVerse = searchParams.get("verse");
    const reference = searchParams.get("reference");

    const [verse, setVerse] = useState(initialVerse);
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");
    const [textColor, setTextColor] = useState("#000000");
    const [outlineColor, setOutlineColor] = useState("#000000");
    const [highlightColor, setHighlightColor] = useState("#ffff00");
    const [aspectRatio, setAspectRatio] = useState("12:9");
    const [backgroundImage, setBackgroundImage] = useState("");
    const imageRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        if (imageRef.current) {
            html2canvas(imageRef.current).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.download = "verse-image.png";
                link.href = imgData;
                link.click();
            });
        }
    };

    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold">Crea tu Versículo</h1>
                    <p className="text-gray-500">Personaliza cada detalle de tu experiencia visual contemplativa.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="grid gap-8">
                            <VerseInput verse={verse} setVerse={setVerse} />
                            <ImagePreview
                                imageRef={imageRef}
                                verse={verse}
                                reference={reference}
                                textColor={textColor}
                                outlineColor={outlineColor}
                                backgroundColor={backgroundColor}
                                backgroundImage={backgroundImage}
                                aspectRatio={aspectRatio}
                                onDownload={handleDownload}
                            />
                        </div>
                    </div>
                    <div>
                        <Controls
                            setTextColor={setTextColor}
                            setOutlineColor={setOutlineColor}
                            setBackgroundColor={setBackgroundColor}
                            setBackgroundImage={setBackgroundImage}
                            setHighlightColor={setHighlightColor}
                            highlightColor={highlightColor}
                            verse={verse}
                            setVerse={setVerse}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
