import { ReadingDay } from '../reading-plan-data';

export interface ExtendedReadingDay extends ReadingDay {
    title?: string;
    section?: string;
}

export const domingoDeResurreccion: ExtendedReadingDay[] = [
    {
        day: 1,
        section: "1. La Tumba Vacía",
        title: "El ángel anuncia la resurrección",
        reading: "Mateo 28:1-6",
        summary: "María Magdalena y la otra María encuentran la tumba vacía; un ángel anuncia que Jesús ha resucitado."
    },
    {
        day: 2,
        title: "\"Ha resucitado, no está aquí\"",
        reading: "Marcos 16:1-6",
        summary: "Las mujeres llegan con especias y escuchan las palabras que cambian la historia: \"Ha resucitado, no está aquí.\""
    },
    {
        day: 3,
        title: "Varones con vestiduras resplandecientes",
        reading: "Lucas 24:1-7",
        summary: "Dos varones con vestiduras resplandecientes confirman la resurrección y recuerdan las palabras de Jesús."
    },
    {
        day: 4,
        title: "Pedro y Juan corren a la tumba",
        reading: "Juan 20:1-9",
        summary: "María Magdalena ve la tumba vacía, y Pedro y Juan corren para comprobarlo. Vieron y creyeron."
    },
    {
        day: 5,
        section: "2. Apariciones de Jesús",
        title: "Jesús saluda a las mujeres",
        reading: "Mateo 28:9-10",
        summary: "Jesús se aparece a las mujeres, las saluda y les encarga que anuncien la buena noticia a sus discípulos."
    },
    {
        day: 6,
        title: "El camino a Emaús",
        reading: "Lucas 24:13-35",
        summary: "Jesús camina con los discípulos de Emaús sin ser reconocido, y se revela al partir el pan. Sus corazones ardían en el camino."
    },
    {
        day: 7,
        title: "\"¡María!\"",
        reading: "Juan 20:14-18",
        summary: "Jesús se aparece a María Magdalena y la llama por su nombre. El Buen Pastor conoce a sus ovejas y ellas conocen su voz."
    },
    {
        day: 8,
        title: "Paz a vosotros",
        reading: "Juan 20:19-23",
        summary: "Jesús se aparece a los discípulos reunidos, les da su paz y sopla sobre ellos el Espíritu Santo. La resurrección trae misión."
    },
    {
        day: 9,
        section: "3. El Mensaje de la Resurrección",
        title: "La Gran Comisión",
        reading: "Mateo 28:18-20",
        summary: "Jesús da la Gran Comisión: \"Id y haced discípulos a todas las naciones.\" Su autoridad respalda el mandato eterno."
    },
    {
        day: 10,
        title: "El arrepentimiento predicado a todas las naciones",
        reading: "Lucas 24:46-49",
        summary: "Jesús explica que era necesario que el Cristo padeciera y resucitara, y que se predicara el arrepentimiento en su nombre comenzando desde Jerusalén."
    },
];
