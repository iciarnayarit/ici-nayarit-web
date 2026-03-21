'use client';
import { Button } from "@/app/components/ui/button";
import { Upload, Wand2, Palette } from "lucide-react";

interface ControlsProps {
    setTextColor: (color: string) => void;
    setOutlineColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
    setBackgroundImage: (image: string) => void;
    setHighlightColor: (color: string) => void;
    highlightColor: string;
    verse: string | null;
    setVerse: (verse: string | null) => void;
}

export default function Controls({
    setTextColor,
    setOutlineColor,
    setBackgroundColor,
    setBackgroundImage,
    setHighlightColor,
    highlightColor,
    verse,
    setVerse,
}: ControlsProps) {
    const applyHighlight = () => {
        const selection = window.getSelection();
        if (selection && selection.toString() && verse) {
            const highlightedText = `<span style="background-color: ${highlightColor}">${selection.toString()}</span>`;
            const newVerse = verse.replace(selection.toString(), highlightedText);
            setVerse(newVerse);
        }
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid gap-4">
                <div>
                    <h3 className="font-bold">FONDO DE IMAGEN</h3>
                    <div className="flex gap-2 mt-2">
                        <Button variant="outline" className="w-full flex-col h-20">
                            <Upload className="h-5 w-5" />
                            <span>SUBIR</span>
                        </Button>
                        <Button variant="outline" className="w-full flex-col h-20">
                            <Wand2 className="h-5 w-5" />
                            <span>GENERAR</span>
                        </Button>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold">ESTILO DE TEXTO</h3>
                    <div className="flex gap-2 mt-2">
                        <Button variant="outline">Regular</Button>
                        <Button>Negrita</Button>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon">=</Button>
                            <Button variant="ghost" size="icon">=</Button>
                            <Button variant="ghost" size="icon">=</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                            <label className="text-sm">TAMAÑO</label>
                            <select className="w-full border-gray-300 rounded-md">
                                <option>Mediano</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm">COLOR</label>
                            <input type="color" onChange={(e) => setTextColor(e.target.value)} className="w-full" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="font-bold">RESALTAR TEXTO</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <input type="color" value={highlightColor} onChange={(e) => setHighlightColor(e.target.value)} className="w-1/2" />
                            <Button onClick={applyHighlight} className="flex items-center gap-1">
                                <Palette className="h-4 w-4"/>
                                Aplicar
                            </Button>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold">COMPOSICIÓN Y FILTROS</h3>
                    <div className="grid gap-2 mt-2">
                        <div>
                            <label className="text-sm">TINTE DE CAPA</label>
                            <input type="range" className="w-full" />
                        </div>
                        <div>
                            <label className="text-sm">CONTRASTE SAGRADO</label>
                            <input type="range" className="w-full" />
                        </div>
                        <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-800 cursor-pointer" onClick={() => setBackgroundColor("#2E7D32")}></div>
                            <div className="w-8 h-8 rounded-full bg-brown-800 cursor-pointer" onClick={() => setBackgroundColor("#5D4037")}></div>
                            <div className="w-8 h-8 rounded-full bg-blue-800 cursor-pointer" onClick={() => setBackgroundColor("#1565C0")}></div>
                            <div className="w-8 h-8 rounded-full bg-black cursor-pointer" onClick={() => setBackgroundColor("#000000")}></div>
                        </div>
                    </div>
                </div>
                <Button className="w-full">Generar Imagen</Button>
            </div>
        </div>
    );
}
