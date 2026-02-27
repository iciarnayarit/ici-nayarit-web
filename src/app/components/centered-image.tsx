import Image from 'next/image';

interface CenteredImageProps {
  imageUrl: string;
  altText: string;
  width?: number;
  height?: number;
}

export default function CenteredImage({ imageUrl, altText, width = 48, height = 48 }: CenteredImageProps) {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 flex justify-center items-center bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative mx-auto" style={{ width: `${width}px`, height: `${height}px` }}>
          <Image
            src={imageUrl}
            alt={altText}
            width={width}
            height={height}
          />
        </div>
      </div>
    </section>
  );
}
