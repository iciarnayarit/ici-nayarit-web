'use client';
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { Copy } from "lucide-react";

interface VerseInputProps {
    verse: string | null;
    setVerse: (verse: string | null) => void;
}

export default function VerseInput({ verse, setVerse }: VerseInputProps) {
    const handleCopy = () => {
        if (verse) {
            navigator.clipboard.writeText(verse);
        }
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg relative">
            <label htmlFor="verse-input" className="block text-sm font-medium text-gray-700">CONTENIDO DEL VERSÍCULO</label>
            <Textarea
                id="verse-input"
                placeholder="Escribe o pega aquí el versículo sagrado..."
                className="mt-1 pr-10"
                value={verse || ""}
                onChange={(e) => setVerse(e.target.value)}
            />
            <Button onClick={handleCopy} size="icon" variant="ghost" className="absolute top-1/2 right-5 -translate-y-1/2">
                <Copy className="h-5 w-5" />
            </Button>
            <div className="flex justify-between items-center mt-2">
                <div>
                    <Button variant="outline" size="sm" className="mr-2">Salmos 23:1</Button>
                    <Button variant="outline" size="sm">Juan 3:16</Button>
                </div>
                <Button variant="ghost" size="sm">Buscar en la Biblia</Button>
            </div>
        </div>
    );
}
