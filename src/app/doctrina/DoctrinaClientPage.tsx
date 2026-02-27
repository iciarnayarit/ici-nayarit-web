'use client';

import React, { useState } from 'react';

const allDefinitions = [
    {
        title: "Arrepentimiento",
        text: "Es un cambio de mente, de actitud, de propósito y de hechos.",
        highlighted: true,
    },
    {
        title: "Justificación",
        text: "Es el acto de Dios por el cual el pecador es declarado justo.",
        highlighted: true,
    },
    {
        title: "Regeneración",
        text: "Es el acto del Espíritu Santo por el cual el pecador recibe vida espiritual.",
        highlighted: true,
    },
    {
        title: "Divina Trinidad",
        text: "Llamamos Divina Trinidad a Dios, confesando que en la unidad del Ser Divino hay tres Personas diferentes: Padre, Hijo y Espíritu Santo, quienes son consubstanciales, coeternos y coiguales.",
        highlighted: true,
    },
    {
        title: "Doctrina",
        text: "Enseñanza o instrucción. Enseñanzas sistematizadas de las sagradas escrituras.",
        highlighted: true,
    },
    {
        title: "Doctrina Cristiana",
        text: "Enseñanzas registradas en la Santa Biblia.",
        highlighted: true,
    },
    {
        title: "Teología Etimológicamente",
        text: "Tratado o discurso referente a Dios, así como a las cosas divinas.",
        highlighted: true,
    },
    {
        title: "Teología como Ciencia",
        text: "Es aquella que trata de Dios, de sus atributos, de sus perfecciones, y que se ocupa de descubrir ese conocimiento que tenemos de Dios y de las relaciones que él tiene con los hombres.",
        highlighted: true,
    },
    {
        title: "Atributos de Dios Esenciales o inherentes",
        text: "Constituyen la esencia de las cosas y no pueden variar o desaparecer, sin que varíe o se altere la naturaleza del mismo.",
        highlighted: true,
    },
    {
        title: "Atributos de Dios Accidentales o contingentes",
        text: "Son los que pueden variar o desaparecer sin que se altere o varié la naturaleza de las cosas a que son referidos.",
        highlighted: true,
    },
    {
        title: "Atributos de Dios Inalterables",
        text: "No pueden sufrir alguna alteración, puesto que Dios no puede sufrir mudanza o variación.",
        highlighted: true,
    },
    {
        title: "Atributos de Dios Inalienable",
        text: "No puede cederlos, ni pueden ser poseídos por alguien más.",
        highlighted: true,
    },
    {
        title: "Dios",
        text: "Dios es el Espíritu infinitamente perfecto, que existe por Sí mismo, y de quien todo lo creado recibe la existencia y la subsistencia.",
        highlighted: true,
    },
    {
        title: "Atributos Naturales",
        text: "Llamamos atributos naturales a aquellas cualidades o perfecciones divinas que pertenecen a la naturaleza de Dios. Son aquellas perfecciones que no expresan acción.",
        highlighted: true,
    },
    {
        title: "Omnisciencia",
        text: "Es el atributo por el cual Dios conoce de manera absolutamente perfecta todas las cosas pasadas, presentes y futuras, tanto respecto de sí mismo, como en relación de sus criaturas.",
        highlighted: true,
    },
    {
        title: "Omnipotencia",
        text: "Es el atributo por el cual Dios puede hacer de manera independiente, absoluta e ilimitada, todas las cosas posibles y consecuentes con su naturaleza perfecta.",
        highlighted: true,
    },
    {
        title: "Omnipresencia",
        text: "La Omnipresencia es el atributo por el cual Dios está presente en todas partes de manera constante, potencial y esencial, sin restricción alguna.",
        highlighted: true,
    },
    {
        title: "Eternidad",
        text: "La eternidad es el atributo por el cual Dios existe por sí mismo, sin principio ni fin, de manera uniforme y simultánea.",
        highlighted: true,
    },
    {
        title: "Infinidad",
        text: "La Infinidad es el atributo por el cual Dios posee esencialmente todas las perfecciones de manera suprema, ilimitada e inagotable.",
        highlighted: true,
    },
    {
        title: "Inmensidad",
        text: "La Inmensidad es el atributo por el cual Dios existe por encima de todo espacio, de manera incontenible, ilimitada e inconmensurable.",
        highlighted: true,
    },
    {
        title: "Inmutabilidad",
        text: "La Inmutabilidad es el atributo por el cual Dios es siempre el mismo, tanto en esencia como en carácter de manera absoluta.",
        highlighted: true,
    },
    {
        title: "Vida",
        text: "La Vida es el atributo por el cual Dios es substancialmente activo de manera inmanente y trascendente, constante e ilimitada.",
        highlighted: true,
    },
    {
        title: "Inteligencia",
        text: "La Inteligencia es el atributo por el cual Dios entiende esencialmente todas las cosas respecto de sí mismo y de la creación de manera simultánea, ilimitada y perfecta.",
        highlighted: true,
    },
    {
        title: "Voluntad",
        text: "La Voluntad es el atributo por el cual Dios se determina de manera independiente, inmutable y perfecta para realizar todo cuanto quiere.",
        highlighted: true,
    },
    {
        title: "Atributos Morales",
        text: "Llamamos atributos morales a aquellas cualidades o perfecciones divinas que manifiestan el carácter moral de la deidad. Son aquellas cualidades que expresan acción, implicando el ejercicio de su voluntad.",
        highlighted: true,
    },
    {
        title: "Sabiduría",
        text: "La Sabiduría es el atributo por el cual Dios provee y utiliza los mejores medios para lograr los más excelentes fines de manera absoluta, incalculable e inagotable.",
        highlighted: true,
    },
    {
        title: "Verdad",
        text: "La Verdad o veracidad es el atributo por el cual Dios revela todo cuanto le place acerca de sí mismo y de lo creado, de manera ciertísima, inmutable e inmejorable.",
        highlighted: true,
    },
    {
        title: "Fidelidad",
        text: "La Fidelidad es el atributo por el cual Dios se consagra a lograr la consumación de todos sus decretos y veredictos y a cumplir todas sus promesas de manera leal, infalible y constante.",
        highlighted: true,
    },
    {
        title: "Santidad",
        text: "Es el atributo por el cual Dios aborrece y rechaza el mal y ama y realiza el bien, de manera substancial, eficiente y absoluta.",
        highlighted: true,
    },
    {
        title: "Justicia",
        text: "La Justicia es el atributo por el cual Dios rige a la creación, dando a cada cual lo que le corresponde, legislando, recompensando y castigando de manera imparcial o inalterable.",
        highlighted: true,
    },
    {
        title: "Paciencia",
        text: "La Justicia es el atributo por el cual Dios tolera a sus criaturas, aguardándolas de manera constante.",
        highlighted: true,
    },
    {
        title: "Amor",
        text: "El Amor es el atributo por el cual Dios establece relaciones con sus criaturas para concederles todo el bien posible, de manera desinteresada, incesante y perfecta.",
        highlighted: true,
    },
    {
        title: "Bondad",
        text: "La Bondad es el atributo por el cual Dios comunica la mayor felicidad posible a todas sus criaturas, de manera espontánea, incesante y perfecta.",
        highlighted: true,
    },
    {
        title: "Misericordia",
        text: "La Misericordia es el atributo por el cual Dios se compadece siempre de sus criaturas y está dispuesto a perdonar a los pecadores de manera completa y soberana.",
        highlighted: true,
    },
    {
        title: "Jehová Yire",
        subtitle: "Jehova Es La Paz.",
        text: "Gn. 22:13-14.",
        highlighted: false,
    },
    {
        title: "Jehová Shalom",
        subtitle: "Jehova Es Paz.",
        text: "Jueces 6:24.",
        highlighted: false,
    },
    {
        title: "Jehová Nisi",
        subtitle: "Jehová Es Mi Bandera.",
        text: "Genesis 17:15.",
        highlighted: false,
    },
    {
        title: "Jehová Tzidkenu",
        subtitle: "Jehová Justicia Nuestra.",
        text: "Jeremias 23:6.",
        highlighted: false,
    },
    {
        title: "Jehová Tzuri",
        subtitle: "Jehová Es Mi Roca.",
        text: "Dt. 32:4.",
        highlighted: false,
    },
    {
        title: "Jehová Ro'i",
        subtitle: "Jehová Es Mi Pastor.",
        text: "Salmo 23.",
        highlighted: false,
    },
    {
        title: "Jehová Tz'baot",
        subtitle: "Jehova De Los Ejercitos.",
        text: "Salmo 146:7, 11.",
        highlighted: false,
    },
    {
        title: "Jehová Shamma",
        subtitle: "Jehová Está Allí.",
        text: "Ezequiel 48:35.",
        highlighted: false,
    },
    {
        title: "Jehová Rofe",
        subtitle: "Jehová El Sanador.",
        text: "Exodo 15:26.",
        highlighted: false,
    },
    {
        title: "Olam",
        subtitle: "Dios Eterno.",
        text: "Genesis 21:33.",
        highlighted: false,
    },
    {
        title: "Jehová Elohim",
        subtitle: "Jehová Es Dios.",
        text: "Genesis 2:4.",
        highlighted: false,
    },
    {
        title: "El Shaday",
        subtitle: "Dios Todopoderoso / Omnipotente.",
        text: "Gn. 17.1.",
        highlighted: false,
    },
    {
        title: "El Roí",
        subtitle: "Dios Que Me Ve.",
        text: "Genesis 16:13-14. Jn. 1:48.",
        highlighted: false,
    },
    {
        title: "El Elyón",
        subtitle: "Dios Altisimo.",
        text: "Genesis 14:19-22. Dt. 4:35-37.",
        highlighted: false,
    }
];

const DoctrinaClientPage = () => {
  const [definitionsToShow, setDefinitionsToShow] = useState(9);

  return (
    <div className="bg-white text-gray-800 font-body">
        <div className="text-center py-12 bg-white">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-display">Doctrina de la Iglesia</h1>
            <p className="mt-3 text-lg text-gray-600">Conoce los fundamentos de nuestra Fe.</p>
        </div>

        <section className="relative h-[50vh] flex items-center justify-center text-center text-white">
            <div className="absolute inset-0">
                <img
                    src="https://i.imgur.com/Ttvfam9.png&auto=format&fit=crop"
                    alt="Biblia abierta"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50"></div>
            </div>
            <div className="relative z-10 px-4">
                <h2 className="text-3xl md:text-5xl font-semibold italic">"Todo lo puedo en Cristo que me fortalece."</h2>
                <p className="mt-4 text-lg md:text-xl">Orando sin cesar venceremos</p>
            </div>
        </section>

        <section className="py-20 bg-[#F9FAFB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="font-display text-4xl font-bold text-[#B88A44] mb-2 italic">Misión y Visión</h2>
                    <div className="h-0.5 w-20 bg-[#B88A44] mx-auto"></div>
                </div>
                <div className="grid md:grid-cols-2 gap-16 items-start">
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 mb-4">
                            <h3 className="font-display text-xl font-bold text-gray-800 uppercase tracking-wider">Misión</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Sustentada total y absolutamente en la Palabra de Dios teniendo cuatro vertientes:
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-[#B88A44] mr-3"></span>
                                <span className="text-gray-600 text-sm">A un mundo perdido, la predicación del evangelio para el perdón de pecados.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-[#B88A44] mr-3"></span>
                                <span className="text-gray-600 text-sm">A la sociedad necesitada, un auxilio real en el nombre de Nuestro Señor Jesucristo.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-[#B88A44] mr-3"></span>
                                <span className="text-gray-600 text-sm">A la Iglesia, la salvaguarda de todos sus recursos.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-[#B88A44] mr-3"></span>
                                <span className="text-gray-600 text-sm">A Dios, nuestra obediencia y Adoración por siempre.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 mb-4">
                            <h3 className="font-display text-xl font-bold text-gray-800 uppercase tracking-wider">Visión</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed italic border-l-4 border-[#B88A44] pl-4">
                            "México y las naciones para Cristo."
                        </p>
                        <div className="rounded-lg overflow-hidden shadow-lg mt-8 border border-gray-200 bg-white">
                            <img alt="World Map Illustration" className="w-full h-auto object-contain p-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACeSzdRsjk1xsYtY1I78o67-ISkxD69MBzH3PXnEMXptl0eCHO1kPr8ZkdQF8IhE2RF_gB7JmYfHoK3KuTrceYkP-5nihwvuAeiER2eO5qcnd_Wyd527Z16E8ED-A2Lnh6oGwP_D4TjoL-LZ7hE-mGjjDXP-D-2KmR7YB1dQN6M9LnPtIsB5IT0A5BiDKg921gxchpmDjgZNmZyjBSTfx6om8r1f_IVKvetc1jBneOzW2cfBDBClyiKAvgJ5omDpu_AWZPkEU0bHY"/>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            Una iglesia unida, en constante oración y crecimiento espiritual, impactando vidas a través del amor de Dios.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section className="bg-[#1A2530] py-20 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-display text-4xl font-bold text-[#E5C573] mb-2 italic">Plan de Salvación</h2>
                    <p className="text-gray-400 text-lg">4 pasos indispensables para una vida FELIZ</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                    <div className="flex items-center bg-gray-800/50 p-4 rounded-md">
                        <span className="font-display text-4xl font-bold text-[#E5C573] mr-4">1</span>
                        <p className="text-gray-300 text-sm">Reconozca que Dios le ama y tiene un plan maravilloso para su vida.</p>
                    </div>
                    <div className="flex items-center bg-gray-800/50 p-4 rounded-md">
                        <span className="font-display text-4xl font-bold text-[#E5C573] mr-4">2</span>
                        <p className="text-gray-300 text-sm">Reconozca que el hombre es pecador.</p>
                    </div>
                    <div className="flex items-center bg-gray-800/50 p-4 rounded-md">
                        <span className="font-display text-4xl font-bold text-[#E5C573] mr-4">3</span>
                        <p className="text-gray-300 text-sm">Considere que el Señor Jesucristo es la única forma que Dios ha provisto para reconciliar al hombre con ÉL.</p>
                    </div>
                    <div className="flex items-center bg-gray-800/50 p-4 rounded-md">
                        <span className="font-display text-4xl font-bold text-[#E5C573] mr-4">4</span>
                        <p className="text-gray-300 text-sm">Experimente el Amor y el plan de Dios para su vida.</p>
                    </div>
                </div>
                <div className="text-center mt-12">
                    <p className="font-display text-xl italic text-gray-400">¿Quiere usted abrir la puerta de su corazón a Jesucristo?</p>
                </div>
            </div>
        </section>

        <section className="py-24 bg-[#F9FAFB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="font-display text-4xl font-bold text-[#B88A44] mb-2 italic">8 Puntos Doctrinales</h2>
                     <div className="h-0.5 w-20 bg-[#B88A44] mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-transparent hover:border-[#B88A44] transition-colors duration-300">
                        <span className="font-display text-5xl font-bold text-gray-300 mb-2 block">1</span>
                        <p className="text-gray-700 text-sm font-medium">La personalidad de Dios.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-transparent hover:border-[#B88A44] transition-colors duration-300">
                        <span className="font-display text-5xl font-bold text-gray-300 mb-2 block">2</span>
                        <p className="text-gray-700 text-sm font-medium">La Biblia es la palabra de Dios inspirada divinamente y por lo tanto, la única regla de nuestra fe y conducta.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-transparent hover:border-[#B88A44] transition-colors duration-300">
                        <span className="font-display text-5xl font-bold text-gray-300 mb-2 block">3</span>
                        <p className="text-gray-700 text-sm font-medium">Cristo Jesús es el único salvador de las almas.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-transparent hover:border-[#B88A44] transition-colors duration-300">
                        <span className="font-display text-5xl font-bold text-gray-300 mb-2 block">4</span>
                        <p className="text-gray-700 text-sm font-medium">La Santificación. Una parte integrante de la experiencia de la salvación.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-transparent hover:border-[#B88A44] transition-colors duration-300">
                        <span className="font-display text-5xl font-bold text-gray-300 mb-2 block">5</span>
                        <p className="text-gray-700 text-sm font-medium">El bautismo con El Espíritu Santo y fuego concedido por el Señor Jesucristo.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-transparent hover:border-[#B88A44] transition-colors duration-300">
                        <span className="font-display text-5xl font-bold text-gray-300 mb-2 block">6</span>
                        <p className="text-gray-700 text-sm font-medium">Creemos que el Señor Jesucristo es el sanador de nuestros cuerpos mortales.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-transparent hover:border-[#B88A44] transition-colors duration-300">
                        <span className="font-display text-5xl font-bold text-gray-300 mb-2 block">7</span>
                        <p className="text-gray-700 text-sm font-medium">Creemos en la Segunda Venida de nuestro Señor Jesucristo.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-transparent hover:border-[#B88A44] transition-colors duration-300">
                        <span className="font-display text-5xl font-bold text-gray-300 mb-2 block">8</span>
                        <p className="text-gray-700 text-sm font-medium">La Resurrección e Inmortalidad del creyente.</p>
                    </div>
                </div>
            </div>
        </section>

        <section className="bg-[#1A2530] py-16">
          <div className="text-center">
            <h2 className="font-display text-4xl font-bold text-white mb-2">Definiciones</h2>
            <div className="h-0.5 w-16 bg-[#E5C573] mx-auto"></div>
          </div>
        </section>

        <section className="py-20 bg-[#F9FAFB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allDefinitions.slice(0, definitionsToShow).map((def, index) => (
                        <article key={index} className={def.highlighted ? "bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#B88A44]" : "bg-gray-100 p-6 rounded-lg shadow-sm"}>
                            <h3 className={`font-display text-xl font-bold ${def.highlighted ? 'text-[#B88A44]' : 'text-gray-800'} mb-2`}>{def.title}</h3>
                            {def.subtitle && <p className="text-[#B88A44] italic text-sm mb-2">{def.subtitle}</p>}
                            <p className={def.highlighted ? "text-gray-600 text-sm leading-relaxed" : "text-gray-500 text-xs font-mono"}>{def.text}</p>
                        </article>
                    ))}
                </div>
                {definitionsToShow < allDefinitions.length && (
                    <div className="mt-16 text-center">
                        <button onClick={() => setDefinitionsToShow(allDefinitions.length)} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-colors focus:outline-none text-sm">
                            Ver más definiciones
                        </button>
                    </div>
                )}
            </div>
        </section>
    </div>
  );
};

export default DoctrinaClientPage;