import { ReadingDay } from '../reading-plan-data';

export interface ExtendedReadingDay extends ReadingDay {
    title?: string;
    section?: string;
}

export const miercolesRetiro: ExtendedReadingDay[] = [
    {
        day: 1,
        section: "1. Conspiración de los Líderes Religiosos",
        title: "El complot en el patio de Caifás",
        reading: "Mateo 26:3-5",
        summary: "\"Los principales sacerdotes, los escribas y los ancianos del pueblo se reunieron en el patio del sumo sacerdote, llamado Caifás, y tuvieron consejo para prender con engaño a Jesús, y matarle.\" El odio religioso planea en secreto lo que Dios había dispuesto desde la eternidad."
    },
    {
        day: 2,
        title: "Buscaban cómo prenderle con engaño",
        reading: "Marcos 14:1-2",
        summary: "Los sacerdotes y escribas buscaban cómo prender a Jesús con engaño y matarle, pero temían al pueblo. La popularidad de Jesús los obligaba a actuar en las sombras."
    },
    {
        day: 3,
        title: "\"Porque temían al pueblo\"",
        reading: "Lucas 22:1-2",
        summary: "\"Estaban buscando cómo matarle; porque temían al pueblo.\" Quienes debían guiar a Israel hacia Dios ahora conspiraban para matar al Hijo de Dios."
    },
    {
        day: 4,
        section: "2. Traición de Judas",
        title: "\"¿Qué me queréis dar?\"",
        reading: "Mateo 26:14-16",
        summary: "\"Entonces uno de los doce, que se llamaba Judas Iscariote, fue a los principales sacerdotes, y les dijo: ¿Qué me queréis dar, y yo os lo entregaré? Y ellos le asignaron treinta piezas de plata.\" El precio de la traición al Hijo de Dios: el precio de un esclavo."
    },
    {
        day: 5,
        title: "Judas buscaba oportunidad",
        reading: "Marcos 14:10-11",
        summary: "Judas buscaba el momento oportuno para entregarle. Dentro del círculo más cercano a Jesús, la traición ya había comenzado a fraguarse en silencio."
    },
    {
        day: 6,
        title: "\"Entonces Satanás entró en Judas\"",
        reading: "Lucas 22:3-6",
        summary: "\"Entonces Satanás entró en Judas… y él fue y habló con los principales sacerdotes… y ellos se alegraron, y convinieron en darle dinero.\" Una decisión humana abre la puerta al enemigo. Y sin embargo, Dios lo usaría para nuestra redención."
    },
    {
        day: 7,
        section: "3. Preparación para la Pascua",
        title: "Jesús prepara la Pascua aun en medio de la traición",
        reading: "Mateo 26:17-19",
        summary: "Mientras la traición se gestaba en las sombras, Jesús seguía enseñando y guiando a sus discípulos con calma y propósito. Les da instrucciones precisas para preparar la Pascua, mostrando que nada escapa a su control soberano."
    },
];
