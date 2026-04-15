'use client';

import { Volume2 } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/app/components/ui/dialog';
import { cancelHuicholWordSpeech, speakHuicholPracticeWord } from '@/lib/huichol-word-speech';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Texto tal como aparece en el versículo */
    displayWord: string;
    /** Texto enviado al sintetizador (sin puntuación de borde) */
    speechText: string;
    reference: string;
};

export function HuicholWordPracticeDialog({ open, onOpenChange, displayWord, speechText, reference }: Props) {
    useEffect(() => {
        if (!open) cancelHuicholWordSpeech();
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[min(100vw-1.5rem,22rem)] rounded-2xl border border-orange-100/80 bg-gradient-to-b from-orange-50/90 to-white shadow-xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center font-sans text-lg text-gray-900 sm:text-left">
                        Practicar pronunciación
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-3 pt-1 text-left text-sm text-gray-600">
                            <p className="rounded-xl bg-white/80 px-3 py-2 font-mono text-xl font-semibold tracking-wide text-gray-900 ring-1 ring-orange-100">
                                {displayWord || speechText}
                            </p>
                            <p className="text-xs text-gray-500">{reference}</p>
                            <p className="text-[11px] leading-relaxed text-gray-500">
                                La voz del navegador no es wixárika; sirve como apoyo aproximado para repetir el sonido
                                de la palabra escrita.
                            </p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-gray-200 sm:w-auto"
                        onClick={() => onOpenChange(false)}
                    >
                        Cerrar
                    </Button>
                    <Button
                        type="button"
                        className="w-full gap-2 bg-[#B88A44] text-white hover:bg-[#a67b3d] sm:w-auto"
                        onClick={() => speakHuicholPracticeWord(speechText)}
                        disabled={!speechText.trim()}
                    >
                        <Volume2 className="h-4 w-4 shrink-0" aria-hidden />
                        Escuchar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
