import { Suspense } from 'react';
import ImageGenerator from '@/app/components/image-generator';

export default function ImageGeneratorPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ImageGenerator />
        </Suspense>
    );
}
