'use client';
import Image from 'next/image';

export default function TextBible() {

  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32">
      <Image
        src="https://i.imgur.com/Ttvfam9.png" // Re-using image for now
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <div className="relative container mx-auto px-4 md:px-6 text-center text-white z-20">
        <h2 className="text-3xl font-bold font-headline mb-4">Todo lo puedo en Cristo que me fortalece. Orando sin cesar venceremos</h2>
        <p className="text-lg mb-8">
          Bienvenidos a su casa espiritual
        </p>
      </div>
    </section>
  );
}
