
import Footer from "@/app/components/footer";
import Header from "@/app/components/header";
import DefinicionesIci from "../components/definiciones-ici";
import TextBible from "../components/text-bible";

export default function DoctrinaPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Doctrina de la Iglesia</h1>
            <p className="mt-4 text-lg text-foreground/80">
              Conoce los fundamentos de nuestra Fe.
            </p>
          </div>
        </div>

        <TextBible />

        <div className="container mx-auto px-4 pb-12">
          <section className="py-12">
            <h2 className="text-5xl font-serif text-yellow-600 text-center mb-16 italic">Misión y Visión</h2>
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold tracking-widest text-foreground/90 border-b-2 border-yellow-500 pb-2 inline-block">MISIÓN</h3>
                </div>
                <p className="mb-6 text-foreground/80">Sustentada total y absolutamente en la Palabra de Dios teniendo cuatro vertientes:</p>
                <ul className="space-y-4 text-foreground/80">
                  <li className="flex items-start">
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mt-1.5 mr-4 flex-shrink-0"></span>
                    <span>A un mundo perdido, la predicación del evangelio para el perdón de pecados.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mt-1.5 mr-4 flex-shrink-0"></span>
                    <span>A la sociedad necesitada, un auxilio real en el nombre de Nuestro Señor Jesucristo.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mt-1.5 mr-4 flex-shrink-0"></span>
                    <span>A la Iglesia, la salvaguarda de todos sus recursos.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mt-1.5 mr-4 flex-shrink-0"></span>
                    <span>A Dios, nuestra obediencia y Adoración por siempre.</span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold tracking-widest text-foreground/90 border-b-2 border-yellow-500 pb-2 inline-block">VISIÓN</h3>
                </div>
                <p className="mb-6 text-foreground/80">México y las naciones para Cristo.</p>
                <div className="overflow-hidden rounded-lg shadow-xl">
                  <img src="https://i.imgur.com/eRZkrEE.jpeg" alt="Interior de una iglesia con bancas y altar" className="w-full h-auto object-cover"/>
                </div>
              </div>
            </div>
            <p className="m-4 text-center text-foreground/80">Una iglesia unida, en constante oración y crecimiento espiritual, impactando vidas a través del amor de Dios.</p>
          </section>
        </div>

        <div className="flex-1">
          <section className="py-12 bg-[#3a4a5a]">
            <div className="container mx-auto px-4">
              <h2 className="text-5xl font-serif text-yellow-500 text-center mb-4 italic">Plan de Salvación</h2>
              <p className="text-center text-xl italic mb-12">4 pasos indispensables para una vida FELIZ</p>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 text-lg">
                <div className="flex items-start">
                  <div className="text-4xl font-bold text-yellow-500 mr-4">1</div>
                  <p>Reconozca que Dios le ama y tiene un plan maravilloso para su vida.</p>
                </div>
                <div className="flex items-start">
                  <div className="text-4xl font-bold text-yellow-500 mr-4">2</div>
                  <p>Reconozca que el hombre es pecador.</p>
                </div>
                <div className="flex items-start">
                  <div className="text-4xl font-bold text-yellow-500 mr-4">3</div>
                  <p>Considere que el Señor Jesucristo es la única forma que Dios ha provisto para reconciliar al hombre con Él.</p>
                </div>
                <div className="flex items-start">
                  <div className="text-4xl font-bold text-yellow-500 mr-4">4</div>
                  <p>Experimente el Amor y el plan de Dios para su vida.</p>
                </div>
              </div>
              <p className="text-center text-2xl italic mt-12 font-serif">¿Quiere usted abrir la puerta de su corazón a Jesucristo?</p>
            </div>
          </section>
          
          <div className="container mx-auto px-4">
            <section className="bg-[#f7f5f2] rounded-lg p-12 my-12">
            <h2 className="text-5xl font-serif text-yellow-600 text-center mb-16 italic">8 Puntos Doctrinales</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-5xl font-serif text-yellow-600 mb-4">1</p>
                <p>La personalidad de Dios.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-5xl font-serif text-yellow-600 mb-4">2</p>
                <p>La Biblia es la palabra de Dios inspirada divinamente y por lo tanto, la única regla de nuestra fe y conducta y a la debe debe ajustarse nuestra vida.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-5xl font-serif text-yellow-600 mb-4">3</p>
                <p>Cristo Jesús es el único salvador de las almas.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-5xl font-serif text-yellow-600 mb-4">4</p>
                <p>La Santificación. Una parte integrante de la experiencia de la salvación, es indispensable para ver a Dios y vivir eternamente con él.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-5xl font-serif text-yellow-600 mb-4">5</p>
                <p>El bautismo con Él Espiritu Santo y fuego concedido por el Señor Jesucristo, es una experiencia necesaria para el progreso de la vida divina en el creyente y para llenarle de poder.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-5xl font-serif text-yellow-600 mb-4">6</p>
                <p>Creemos que el Señor Jesucristo es el sanador de nuestros cuerpos mortales cuando estamos enfermos.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-5xl font-serif text-yellow-600 mb-4">7</p>
                <p>Creemos en la Segunda Venida de nuestro Señor Jesucristo.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-5xl font-serif text-yellow-600 mb-4">8</p>
                <p>La Resurrección e Inmortalidad del creyente.</p>
              </div>
            </div>
          </section>
          </div>
        </div>

        <DefinicionesIci />

        <div className="container mx-auto px-4">
            <section className="bg-[#f7f5f2] rounded-lg p-12 my-12">
            <h2 className="text-5xl font-serif text-yellow-600 text-center mb-16 italic"></h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-3xl font-serif text-yellow-600 mb-4">Arrepentimiento</p>
                <p>Es un cambio de mente, de actitud, de propósito y de hechos.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-3xl font-serif text-yellow-600 mb-4">Justificación</p>
                <p>Es el acto de Dios por el cual el pecador es declarado justo.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-3xl font-serif text-yellow-600 mb-4">Regeneración</p>
                <p>Es el acto del Espíritu Santo por el cual el pecador recibe vida espiritual.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-3xl font-serif text-yellow-600 mb-4">Dios</p>
                <p>Dios es el Espíritu infinitamente perfecto, que existe por Sí mismo, y de quien todo lo creado recibe la existencia y la subsistencia.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-3xl font-serif text-yellow-600 mb-4">Divina Trinidad</p>
                <p>Llamamos Divina Trinidad a Dios, confesando que en la unidad del Ser Divino hay tres Personas diferentes: Padre, Hijo y Espíritu Santo, quienes son consubstanciales, coeternos y coiguales.</p>
              </div>
            </div>
          </section>
          </div>
      </main>
      <Footer />
    </>
  );
}
