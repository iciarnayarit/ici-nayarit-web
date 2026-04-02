import { ReadingDay } from '../reading-plan-data';

export interface ExtendedReadingDay extends ReadingDay {
    title?: string;
    section?: string;
}

export const lunesAutoridad: ExtendedReadingDay[] = [
    {
        day: 1,
        section: "1. Maldición de la Higuera",
        title: "La higuera sin fruto es maldecida",
        reading: "Mateo 21:18-19",
        summary: "\"Por la mañana, volviendo a la ciudad, tuvo hambre. Y viendo una higuera junto al camino, se acercó a ella, y no halló nada en ella, sino hojas solamente… Y luego se secó la higuera.\" La apariencia de vida sin fruto real trae juicio."
    },
    {
        day: 2,
        title: "Jesús maldice la higuera según Marcos",
        reading: "Marcos 11:12-14",
        summary: "Jesús, al ver la higuera con hojas pero sin fruto, la maldice ante sus discípulos. Este acto profético simboliza el juicio contra la religiosidad exterior que no produce fruto espiritual verdadero."
    },
    {
        day: 3,
        section: "2. Purificación del Templo",
        title: "\"Mi casa, casa de oración será llamada\"",
        reading: "Mateo 21:12-13",
        summary: "\"Entró Jesús en el templo de Dios, y echó fuera a todos los que vendían y compraban en el templo… y les dijo: Mi casa, casa de oración será llamada; mas vosotros la habéis hecho cueva de ladrones.\" Jesús defiende la santidad de la adoración."
    },
    {
        day: 4,
        title: "Jesús vuelca las mesas de los cambistas",
        reading: "Marcos 11:15-17",
        summary: "Jesús volcó las mesas de los cambistas y las sillas de los que vendían palomas. No permitió que nadie llevara nada por el templo. Su acción fue un grito profético: la casa de Dios no puede ser reducida a un negocio."
    },
    {
        day: 5,
        section: "3. Enseñanza y Sanidad en el Templo",
        title: "El templo restaurado: lugar de oración y sanidad",
        reading: "Mateo 21:14",
        summary: "\"Y vinieron a él en el templo ciegos y cojos, y los sanó.\" Después de la purificación, Jesús restaura la verdadera función del templo: un lugar donde los necesitados encuentran a Dios y son sanados."
    },
    {
        day: 6,
        section: "4. Cuestionamiento de su Autoridad",
        title: "\"¿Con qué autoridad haces estas cosas?\"",
        reading: "Mateo 21:23-27",
        summary: "Los principales sacerdotes y ancianos confrontan a Jesús: \"¿Con qué autoridad haces estas cosas?\" Jesús responde con una pregunta sobre el bautismo de Juan, dejando al descubierto su hipocresía. Quienes no reconocen la autoridad de Dios no pueden responder a sus preguntas."
    },
    {
        day: 7,
        title: "La autoridad de Jesús proviene de Dios",
        reading: "Lucas 20:1-8",
        summary: "Lucas relata el mismo enfrentamiento. Los líderes religiosos no pueden responder porque hacerlo los comprometería ante el pueblo. Jesús no declara su autoridad; la demuestra con sus obras y sabiduría."
    },
];
