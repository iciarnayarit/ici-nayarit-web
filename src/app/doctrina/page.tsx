
import Footer from "@/app/components/footer";
import Header from "@/app/components/header";
import DefinicionesIci from "../components/definiciones-ici";
import TextBible from "../components/text-bible";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ICIAR - Doctrina',
  description: 'Conoce los fundamentos de nuestra Fe.',
  keywords: [
    'Cristianismo',
    'ICIAR Iglesia Central - Portales',
    'Doctrina',
    'Himno',
    'Logotipo',
    'Himnario',
    'Dios',
    'Oración',
    'Escuela dominical',
    'Iglesia',
    'Vida',
    'Biblia',
    'Himnario ICIAR',
    'Rector',
    'RISING',
    'iglesia iciar',
    'iciar portales',
    'tabernáculo la mansión iciar',
    'puntos doctrinales iciar',
    'ici makis',
    'ici hot',
    'ici puebla',
    'ici radio canada',
    'ici tou tv',
    'ici rdi',
    'ici tout tv',
    'bryan adams ma place est ici',
    'ici première',
    'cici',
    'ici tele',
    'ici rdi en direct',
    'ici télé',
    'ici tout.tv',
  ],
};

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
          <section className="py-8 md:py-12">
            <h2 className="text-3xl md:text-5xl font-serif text-yellow-600 text-center mb-8 md:mb-16 italic">Misión y Visión</h2>
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
              <div>
                <div className="mb-6">
                  <h3 className="text-xl md:text-2xl font-semibold tracking-widest text-foreground/90 border-b-2 border-yellow-500 pb-2 inline-block">MISIÓN</h3>
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
                  <h3 className="text-xl md:text-2xl font-semibold tracking-widest text-foreground/90 border-b-2 border-yellow-500 pb-2 inline-block">VISIÓN</h3>
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
          <section className="py-8 md:py-12 bg-[#3a4a5a]">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-5xl font-serif text-yellow-500 text-center mb-4 italic">Plan de Salvación</h2>
              <p className="text-center text-lg md:text-xl italic mb-8 md:mb-12">4 pasos indispensables para una vida FELIZ</p>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 text-base md:text-lg">
                <div className="flex items-start">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-500 mr-4">1</div>
                  <p>Reconozca que Dios le ama y tiene un plan maravilloso para su vida.</p>
                </div>
                <div className="flex items-start">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-500 mr-4">2</div>
                  <p>Reconozca que el hombre es pecador.</p>
                </div>
                <div className="flex items-start">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-500 mr-4">3</div>
                  <p>Considere que el Señor Jesucristo es la única forma que Dios ha provisto para reconciliar al hombre con Él.</p>
                </div>
                <div className="flex items-start">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-500 mr-4">4</div>
                  <p>Experimente el Amor y el plan de Dios para su vida.</p>
                </div>
              </div>
              <p className="text-center text-xl md:text-2xl italic mt-8 md:mt-12 font-serif">¿Quiere usted abrir la puerta de su corazón a Jesucristo?</p>
            </div>
          </section>
          
          <div className="container mx-auto px-4">
            <section className="bg-[#f7f5f2] rounded-lg p-6 md:p-12 my-8 md:my-12">
            <h2 className="text-3xl md:text-5xl font-serif text-yellow-600 text-center mb-8 md:mb-16 italic">8 Puntos Doctrinales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-4xl md:text-5xl font-serif text-yellow-600 mb-4">1</p>
                <p>La personalidad de Dios.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-4xl md:text-5xl font-serif text-yellow-600 mb-4">2</p>
                <p>La Biblia es la palabra de Dios inspirada divinamente y por lo tanto, la única regla de nuestra fe y conducta y a la debe debe ajustarse nuestra vida.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-4xl md:text-5xl font-serif text-yellow-600 mb-4">3</p>
                <p>Cristo Jesús es el único salvador de las almas.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-4xl md:text-5xl font-serif text-yellow-600 mb-4">4</p>
                <p>La Santificación. Una parte integrante de la experiencia de la salvación, es indispensable para ver a Dios y vivir eternamente con él.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-4xl md:text-5xl font-serif text-yellow-600 mb-4">5</p>
                <p>El bautismo con Él Espiritu Santo y fuego concedido por el Señor Jesucristo, es una experiencia necesaria para el progreso de la vida divina en el creyente y para llenarle de poder.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-4xl md:text-5xl font-serif text-yellow-600 mb-4">6</p>
                <p>Creemos que el Señor Jesucristo es el sanador de nuestros cuerpos mortales cuando estamos enfermos.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-4xl md:text-5xl font-serif text-yellow-600 mb-4">7</p>
                <p>Creemos en la Segunda Venida de nuestro Señor Jesucristo.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-4xl md:text-5xl font-serif text-yellow-600 mb-4">8</p>
                <p>La Resurrección e Inmortalidad del creyente.</p>
              </div>
            </div>
          </section>
          </div>
        </div>

        <DefinicionesIci />

        <div className="container mx-auto px-4">
            <section className="bg-[#f7f5f2] rounded-lg p-6 md:p-12 my-8 md:my-12">
            <h2 className="text-3xl md:text-5xl font-serif text-yellow-600 text-center mb-8 md:mb-16 italic"></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Arrepentimiento</p>
                <p>Es un cambio de mente, de actitud, de propósito y de hechos.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Justificación</p>
                <p>Es el acto de Dios por el cual el pecador es declarado justo.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Regeneración</p>
                <p>Es el acto del Espíritu Santo por el cual el pecador recibe vida espiritual.</p>
              </div> 
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Divina <br />Trinidad</p>
                <p>Llamamos Divina Trinidad a Dios, confesando que en la unidad del Ser Divino hay tres Personas diferentes: Padre, Hijo y Espíritu Santo, quienes son consubstanciales, coeternos y coiguales.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Doctrina</p>
                <p>Enseñanza o instrucción. Enseñanzas sistematizadas de las sagradas escrituras.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Doctrina <br />Cristiana</p>
                <p>Enseñanzas registradas en la Santa Biblia.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-2xl font-serif text-yellow-600 mb-4">Teología <br />Etimológicamente</p>
                <p>Tratado o discurso referente a Dios, así como a las cosas divinas.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Teología <br />como Ciencia</p>
                <p>Es aquella que trata de Dios, de sus atributos, de sus perfecciones, y que se ocupa de descubrir ese conocimiento que tenemos de Dios y de las relaciones que él tiene con los hombres.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Atributos de Dios<br /> Esenciales o inherentes</p>
                <p>Constituyen la esencia de las cosas y no pueden variar o desaparecer, sin que varíe o se altere la naturaleza del mismo.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Atributos de Dios<br /> Accidentales o contingentes</p>
                <p>Son los que pueden variar o desaparecer sin que se altere o varié la naturaleza de las cosas a que son referidos.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Atributos de Dios <br />Inalterables</p>
                <p>No pueden sufrir alguna alteración, puesto que Dios no puede sufrir mudanza o variación.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Atributos de Dios<br /> Inalienable</p>
                <p>No puede cederlos, ni pueden ser poseídos por alguien más.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Dios</p>
                <p>Dios es el Espíritu infinitamente perfecto, que existe por Sí mismo, y de quien todo lo creado recibe la existencia y la subsistencia.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Atributos Naturales</p>
                <p>Llamamos atributos naturales a aquellas cualidades o perfecciones divinas que pertenecen a la naturaleza de Dios. Son aquellas perfecciones que no expresan acción.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Omnisciencia</p>
                <p>Es el atributo por el cual Dios conoce de manera absolutamente perfecta todas las cosas pasadas, presentes y futuras, tanto respecto de sí mismo, como en relación de sus criaturas.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Omnipotencia</p>
                <p>Es el atributo por el cual Dios puede hacer de manera independiente, absoluta e ilimitada, todas las cosas posibles y consecuentes con su naturaleza perfecta.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Omnipresencia</p>
                <p>La Omnipresencia es el atributo por el cual Dios está presente en todas partes de manera constante, potencial y esencial, sin restricción alguna.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Eternidad</p>
                <p>La eternidad es el atributo por el cual Dios existe por sí mismo, sin principio ni fin, de manera uniforme y simultánea.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Infinidad</p>
                <p>La Infinidad es el atributo por el cual Dios posee esencialmente todas las perfecciones de manera suprema, ilimitada e inagotable.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Inmensidad</p>
                <p>La Inmensidad es el atributo por el cual Dios existe por encima de todo espacio, de manera incontenible, ilimitada e inconmensurable.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Inmutabilidad</p>
                <p>La Inmutabilidad es el atributo por el cual Dios es siempre el mismo, tanto en esencia como en carácter de manera absoluta.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Vida</p>
                <p>La Vida es el atributo por el cual Dios es substancialmente activo de manera inmanente y trascendente, constante e ilimitada.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Inteligencia</p>
                <p>La Inteligencia es el atributo por el cual Dios entiende esencialmente todas las cosas respecto de sí mismo y de la creación de manera simultánea, ilimitada y perfecta.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Voluntad</p>
                <p>La Voluntad es el atributo por el cual Dios se determina de manera independiente, inmutable y perfecta para realizar todo cuanto quiere.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Atributos Morales</p>
                <p>Llamamos atributos morales aquellas cualidades o perfecciones divinas que manifiestan el carácter moral de la deidad. Son aquellas cualidades que expresan acción, implicando el ejercicio de su voluntad.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Sabiduría</p>
                <p>La Sabiduría es el atributo por el cual Dios provee y utiliza los mejores medios para lograr los más excelentes fines de manera absoluta, incalculable e inagotable.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Verdad</p>
                <p>La Verdad o veracidad es el atributo por el cual Dios revela todo cuanto le place acerca de sí mismo y de lo creado, de manera ciertísima, inmutable e inmejorable.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Fidelidad</p>
                <p>La Fidelidad es el atributo por el cual Dios se consagra a lograr la consumación de todos sus decretos y veredictos y a cumplir todas sus promesas de manera leal, infalible y constante.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Santidad</p>
                <p>Es el atributo por el cual Dios aborrece y rechaza el mal y ama y realiza el bien, de manera substancial, eficiente y absoluta.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Justicia</p>
                <p>La Justicia es el atributo por el cual Dios rige a la creación, dando a cada cual lo que le corresponde, legislando, recompensando y castigando de manera imparcial o inalterable.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Paciencia</p>
                <p>La Justicia es el atributo por el cual Dios tolera a sus criaturas, aguardándolas de manera constante.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Amor</p>
                <p>El Amor es el atributo por el cual Dios establece relaciones con sus criaturas para concederles todo el bien posible, de manera desinteresada, incesante y perfecta.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Bondad</p>
                <p>La Bondad es el atributo por el cual Dios comunica la mayor felicidad posible a todas sus criaturas, de manera espontánea, incesante y perfecta.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Misericordia</p>
                <p>La Misericordia es el atributo por el cual Dios se compadece siempre de sus criaturas y está dispuesto a perdonar a los pecadores de manera completa y soberana.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Jehova Nisi</p>
                <p>Jehová Es Mi Bandera. <br />Genesis 17:15.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Jehová Shalom</p>
                <p>Jehova Es Paz. <br />Jueces 6:24.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Jehová Yire</p>
                <p>Jehova Es La Paz. <br />Gn. 22:13-14.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Jehová Tzidkenu</p>
                <p>Jehová Justicia Nuestra. <br />Jeremías 23:6.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Jehová Tzuri</p>
                <p>Jehová Es Mi Roca. <br />Dt. 32:4.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Jehová Ro'i</p>
                <p>Jehová Es Mi Pastor. <br />Salmo 23.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Jehová Tz'baot</p>
                <p>Jehova De Los Ejercitos. <br />Salmo 146:7, 11.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Jehová Shamma</p>
                <p>Jehová Está Alli. <br />Ezequiel 48:35.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Jehová Rofe</p>
                <p>Jehová El Sanador. <br />Exodo 15:26.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Olam</p>
                <p>Dios Eterno. <br />Genesis 21:33.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">Jehová Elohim</p>
                <p>Jehová Es Dios. <br />Genesis 2:4.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">El Shaday</p>
                <p>Dios Todopoderoso / Omnipotente. <br />Gn. 17.1.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">El Roí</p>
                <p>Dios Que Me Ve. <br />Genesis 16:13-14. Jn. 1:48.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-2xl md:text-3xl font-serif text-yellow-600 mb-4">El Elyón</p>
                <p>Dios Altísimo. <br />Genesis 14:19-22. Dt. 4:35-37.</p>
              </div>
            </div>
          </section>
          </div>
      </main>
      <Footer />
    </>
  );
}
