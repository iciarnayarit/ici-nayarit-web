import { ReadingDay } from '../reading-plan-data';

export interface ExtendedReadingDay extends ReadingDay {
    title?: string;
    section?: string;
}

export const juevesSanto: ExtendedReadingDay[] = [
    {
        day: 1,
        section: "1. Preparación de la Pascua",
        title: "¿Dónde prepararemos la Pascua?",
        reading: "Mateo 26:17-19",
        summary: "Los discípulos preguntan a Jesús dónde preparar la Pascua. Jesús les da instrucciones precisas, mostrando que todo ocurre según el plan del Padre."
    },
    {
        day: 2,
        title: "Los preparativos según Marcos y Lucas",
        reading: "Marcos 14:12-16",
        summary: "Pedro y Juan son enviados a preparar la cena. Encuentran todo tal como Jesús lo había dicho, confirmando su conocimiento sobrenatural de los eventos."
    },
    {
        day: 3,
        section: "2. La Última Cena",
        title: "Jesús anuncia la traición",
        reading: "Mateo 26:20-29",
        summary: "Jesús anuncia que uno de los suyos lo traicionará. Luego toma el pan y el vino, instituyendo la Cena del Señor como memorial de su cuerpo y sangre."
    },
    {
        day: 4,
        title: "Institución de la Cena del Señor",
        reading: "Lucas 22:14-20",
        summary: "\"Haced esto en memoria de mí.\" Con estas palabras Jesús establece una práctica sagrada que la iglesia repetiría a través de los siglos."
    },
    {
        day: 5,
        title: "La traición de Judas durante la cena",
        reading: "Juan 13:21-30",
        summary: "Juan relata con detalle el momento en que Jesús señala al traidor. Judas toma el bocado y sale a la noche. \"Era de noche.\""
    },
    {
        day: 6,
        section: "3. Lavatorio de los Pies",
        title: "El maestro se arrodilla a servir",
        reading: "Juan 13:4-15",
        summary: "Jesús lava los pies de sus discípulos, asumiendo el rol del último siervo. \"El que quiera ser el mayor entre vosotros, será vuestro servidor.\""
    },
    {
        day: 7,
        section: "4. Discurso de Despedida",
        title: "El mandamiento nuevo: amaos los unos a los otros",
        reading: "Juan 13:31-35",
        summary: "Jesús da su mandamiento nuevo: \"Que os améis los unos a los otros, como yo os he amado.\" El amor es la marca del discípulo."
    },
    {
        day: 8,
        title: "Promesa del Espíritu Santo y la vid verdadera",
        reading: "Juan 14:15-17; 15:1-11",
        summary: "Jesús promete el Espíritu Santo como Consolador y enseña la imagen de la vid: permanecer en Él es condición de todo fruto espiritual."
    },
    {
        day: 9,
        title: "La oración sacerdotal",
        reading: "Juan 17",
        summary: "Jesús ora por sí mismo, por sus discípulos y por todos los que creerían en su nombre. La oración más íntima y profunda de las Escrituras."
    },
    {
        day: 10,
        section: "5. Oración en Getsemaní",
        title: "\"No sea como yo quiero, sino como tú\"",
        reading: "Mateo 26:36-46",
        summary: "Jesús ora en el huerto con angustia profunda, pero se somete a la voluntad del Padre. Los discípulos duermen mientras Él vela y lucha en oración."
    },
    {
        day: 11,
        title: "La lucha espiritual en el huerto",
        reading: "Lucas 22:39-46",
        summary: "Lucas relata que un ángel fortaleció a Jesús y que su sudor era como grandes gotas de sangre. La victoria de la cruz comenzó en Getsemaní."
    },
    {
        day: 12,
        section: "6. Arresto de Jesús",
        title: "El beso de la traición",
        reading: "Mateo 26:47-56",
        summary: "Judas llega con una multitud armada y entrega a Jesús con un beso. Jesús no resiste: \"Todo esto ha sucedido para que se cumplan las Escrituras.\""
    },
    {
        day: 13,
        title: "\"¿A quién buscáis?\"",
        reading: "Juan 18:1-11",
        summary: "Juan describe el arresto con la majestuosa respuesta de Jesús: \"Yo soy.\" Sus captores retroceden y caen. Jesús se entrega voluntariamente para salvar a los suyos."
    },
];
