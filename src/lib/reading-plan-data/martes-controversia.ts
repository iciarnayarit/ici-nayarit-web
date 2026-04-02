import { ReadingDay } from '../reading-plan-data';

export interface ExtendedReadingDay extends ReadingDay {
    title?: string;
    section?: string;
}

export const martesControversia: ExtendedReadingDay[] = [
    {
        day: 1,
        section: "1. Enseñanzas y Parábolas en el Templo",
        title: "Los dos hijos: obediencia real vs. aparente",
        reading: "Mateo 21:28-32",
        summary: "Jesús confronta a los líderes religiosos con la parábola de los dos hijos. El que dijo \"no\" y luego obedeció es mejor que el que dijo \"sí\" y no hizo nada. La obediencia real supera la apariencia religiosa."
    },
    {
        day: 2,
        title: "Los labradores malvados: el rechazo a los enviados de Dios",
        reading: "Mateo 21:33-46",
        summary: "Israel rechazó a los profetas y al propio Hijo. \"La piedra que desecharon los edificadores, esa vino a ser la cabeza del ángulo.\" Jesús anuncia el juicio sobre quienes rechazan la gracia de Dios."
    },
    {
        day: 3,
        title: "La fiesta de bodas: la invitación rechazada",
        reading: "Mateo 22:1-14",
        summary: "El reino de los cielos es como un rey que prepara una boda y sus invitados no quieren venir. La gracia es ofrecida a todos, pero exige una respuesta. \"Muchos son llamados, y pocos escogidos.\""
    },
    {
        day: 4,
        section: "2. Controversias con los Líderes Religiosos",
        title: "\"Dad al César lo que es del César\"",
        reading: "Mateo 22:15-22",
        summary: "Los fariseos intentan atrapar a Jesús con la cuestión del tributo. Su respuesta asombra a todos: \"Dad al César lo que es del César, y a Dios lo que es de Dios.\" La sabiduría de Jesús deja sin respuesta a sus adversarios."
    },
    {
        day: 5,
        title: "La resurrección: Dios de vivos, no de muertos",
        reading: "Mateo 22:23-33",
        summary: "Los saduceos, que niegan la resurrección, presentan un caso para ridiculizarla. Jesús les responde: \"Erráis, ignorando las Escrituras y el poder de Dios.\" Él es el Dios de Abraham, de Isaac y de Jacob: Dios de vivos."
    },
    {
        day: 6,
        title: "El gran mandamiento: amar a Dios y al prójimo",
        reading: "Mateo 22:34-40",
        summary: "\"Amarás al Señor tu Dios con todo tu corazón… y a tu prójimo como a ti mismo. De estos dos mandamientos depende toda la ley y los profetas.\" Toda la vida cristiana se resume en amor."
    },
    {
        day: 7,
        title: "¿De quién es hijo el Mesías?",
        reading: "Mateo 22:41-46",
        summary: "Jesús cuestiona a los fariseos sobre la identidad del Mesías: si es solo hijo de David, ¿por qué David lo llama \"Señor\"? Nadie pudo responderle, ni tampoco osó preguntarle más."
    },
    {
        day: 8,
        section: "3. Denuncia contra los Fariseos y Escribas",
        title: "Los siete ayes: hipocresía al descubierto",
        reading: "Mateo 23:1-36",
        summary: "Jesús pronuncia los siete \"ayes\" contra los fariseos, denunciando su hipocresía, su religiosidad vacía y su carga sobre el pueblo. \"¡Ay de vosotros, escribas y fariseos, hipócritas!\" Una advertencia eterna contra la religión sin corazón."
    },
    {
        day: 9,
        section: "4. Profecía sobre Jerusalén y el Fin",
        title: "\"No quedará piedra sobre piedra\"",
        reading: "Mateo 24:1-14",
        summary: "Jesús anuncia la destrucción del templo y describe las señales del tiempo del fin: guerras, hambres, persecuciones. \"Pero el que persevere hasta el fin, éste será salvo.\""
    },
    {
        day: 10,
        title: "La gran tribulación y la venida del Hijo del Hombre",
        reading: "Mateo 24:15-44",
        summary: "Jesús describe la tribulación y su venida gloriosa: \"Como el relámpago que sale del oriente y se muestra hasta el occidente, así será también la venida del Hijo del Hombre.\" Nadie sabe el día ni la hora; solo el Padre."
    },
    {
        day: 11,
        title: "\"Velad, porque no sabéis en qué hora\"",
        reading: "Mateo 24:45-51",
        summary: "Jesús exhorta a sus discípulos a estar listos y fieles, como siervos que administran bien lo que su señor les ha encomendado. La fidelidad cotidiana es la mejor preparación para su regreso."
    },
    {
        day: 12,
        title: "El discurso escatológico según Marcos",
        reading: "Marcos 13:1-37",
        summary: "Marcos recoge el mismo discurso en el Monte de los Olivos. Jesús exhorta: \"Mirad, velad y orad; porque no sabéis cuándo será el tiempo.\" La vigilancia espiritual es la respuesta al anuncio profético."
    },
    {
        day: 13,
        title: "\"Cuando comenzad estas cosas a suceder, erguíos\"",
        reading: "Lucas 21:5-36",
        summary: "Lucas añade la promesa: \"Cuando estas cosas comiencen a suceder, erguíos y levantad vuestra cabeza, porque vuestra redención está cerca.\" Las señales del fin no son para el temor, sino para la esperanza."
    },
];
