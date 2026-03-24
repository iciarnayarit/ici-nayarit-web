'use client';
import { useState, useRef, useEffect } from 'react';
import { Highlighter, Share, Copy, BookOpen, X, Book } from 'lucide-react';

const highlightColors = ['#FDD835', '#9CCC65', '#29B6F6', '#FFAB91', '#F48FB1'];

interface BibleData {
    abbrev: string;
    chapters: string[][];
    name: string;
}

export default function BibleReader() {
    const [selection, setSelection] = useState<{ verse: string; chapter: number; verseIndex: number } | null>(null);
    const [showToolbar, setShowToolbar] = useState(false);
    const [bibleData, setBibleData] = useState<BibleData | null>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/lib/bible_rvr/mt.json')
            .then(response => response.json())
            .then(data => setBibleData(data));
    }, []);

    const handleVerseClick = (verse: string, chapter: number, verseIndex: number) => {
        setSelection({ verse, chapter, verseIndex });
        setShowToolbar(true);
    };

    const handleHighlight = (color: string) => {
        if (selection) {
            const verseElement = document.getElementById(`verse-${selection.chapter}-${selection.verseIndex}`);
            if (verseElement) {
                verseElement.style.backgroundColor = color;
            }
            setShowToolbar(false);
        }
    };

    const handleCopy = () => {
        if (selection) {
            navigator.clipboard.writeText(selection.verse);
            setShowToolbar(false);
        }
    };

    if (!bibleData) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    const chapter = 27; // Chapter 28 (index 27)

    return (
        <div className="p-4 md:p-8 font-serif relative">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">{bibleData.name} {chapter + 1}</h2>
                <p className="text-sm text-gray-500">(Mr. 16.1-8; Lc. 24.1-12; Jn. 20.1-10)</p>
                <h3 className="text-xl font-semibold mt-4 uppercase">La resurrección</h3>
            </div>

            <div ref={textRef} className="max-w-4xl mx-auto text-lg leading-loose text-justify">
                {bibleData.chapters[chapter].map((verse, index) => (
                    <span
                        key={index}
                        id={`verse-${chapter + 1}-${index + 1}`}
                        className="mr-2 cursor-pointer hover:bg-gray-200 rounded-md p-1"
                        onClick={() => handleVerseClick(verse, chapter + 1, index + 1)}>
                        <sup className="font-bold text-sm text-gray-600">{index + 1}</sup> {verse}
                    </span>
                ))}
            </div>

            {showToolbar && selection && (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setShowToolbar(false)}></div>
            )}
            {showToolbar && selection && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-full max-w-sm p-4">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-semibold">Seleccionado:</p>
                        <button onClick={() => setShowToolbar(false)} className="text-gray-500 hover:text-gray-800">
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-lg font-bold mb-6">{bibleData.name} {selection.chapter}:{selection.verseIndex} RVR1960 &gt;</p>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Highlighter className="text-gray-700" size={24} />
                                <span className="font-semibold text-lg">Subrayar</span>
                            </div>
                            <div className="flex space-x-2">
                                {highlightColors.map(color => (
                                    <div key={color} onClick={() => handleHighlight(color)} style={{ backgroundColor: color }} className="w-7 h-7 rounded-full cursor-pointer border-2 border-transparent hover:border-gray-400"></div>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-100">
                            <Share className="text-gray-700" size={24} />
                            <span className="font-semibold text-lg">Compartir</span>
                        </div>
                        <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-100">
                            <BookOpen className="text-gray-700" size={24} />
                            <span className="font-semibold text-lg">Comparar</span>
                        </div>
                        <div onClick={handleCopy} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-100">
                            <Copy className="text-gray-700" size={24} />
                            <span className="font-semibold text-lg">Copiar</span>
                        </div>
                    </div>

                    <div className="border-t mt-6 pt-4">
                        <div className="bg-gray-100 p-3 rounded-lg flex items-center space-x-4">
                            <Book className="text-red-700" size={32} />
                            <div>
                                <p className="text-sm font-semibold">¿Quieres tener tus subrayados guardados en todos tus dispositivos?</p>
                                <a href="#" className="text-sm text-blue-600 font-bold underline">Registrate o inicia sesión</a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
