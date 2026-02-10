import Image from 'next/image';

interface CenteredImageProps {
  imageUrl: string;
  altText: string;
}

export default function CenteredImage({ imageUrl, altText }: CenteredImageProps) {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 flex justify-start items-center bg-background">
      <div className="container mx-auto px-2 md:px-4">
        <div className="relative w-[75px] h-[75px]">
          <Image
            src={imageUrl}
            alt={altText}
            width={75}
            height={75}
          />
        </div>
      </div>
    </section>
  );
}
