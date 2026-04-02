import { ReadingDay } from '../reading-plan-data';

export interface ExtendedReadingDay extends ReadingDay {
    title?: string;
    section?: string;
}

export const sietePalabrasCruz: ExtendedReadingDay[] = [
    {
        day: 1,
        title: "\"Padre, perdónalos, porque no saben lo que hacen\"",
        reading: "Lucas 23:34",
        summary: "Jesús, en medio del dolor, ofrece perdón. Nos enseña que el amor verdadero se manifiesta incluso hacia quienes nos hieren."
    },
    {
        day: 2,
        title: "\"Hoy estarás conmigo en el paraíso\"",
        reading: "Lucas 23:43",
        summary: "La salvación no depende de méritos humanos, sino de la fe en Cristo. El ladrón arrepentido recibe esperanza en el último momento."
    },
    {
        day: 3,
        title: "\"Mujer, he ahí tu hijo… He ahí tu madre\"",
        reading: "Juan 19:26-27",
        summary: "Jesús cuida de su madre aun en la cruz. Nos recuerda la importancia de la familia y la responsabilidad de amarnos y cuidarnos unos a otros."
    },
    {
        day: 4,
        title: "\"Dios mío, Dios mío, ¿por qué me has desamparado?\"",
        reading: "Mateo 27:46",
        summary: "Jesús experimenta el abandono humano y el peso del pecado. Nos muestra que en la angustia podemos clamar a Dios con sinceridad."
    },
    {
        day: 5,
        title: "\"Tengo sed\"",
        reading: "Juan 19:28",
        summary: "Una expresión de su humanidad. Jesús comparte nuestra fragilidad y necesidad, recordándonos que Él se hizo hombre para comprendernos plenamente."
    },
    {
        day: 6,
        title: "\"Consumado es\"",
        reading: "Juan 19:30",
        summary: "Con esta palabra declara cumplida su misión. Nos asegura que la obra de redención está completa y que no necesitamos añadir nada más para ser salvos."
    },
    {
        day: 7,
        title: "\"Padre, en tus manos encomiendo mi espíritu\"",
        reading: "Lucas 23:46",
        summary: "Jesús entrega su vida confiando en el Padre. Nos invita a vivir y morir con esa misma confianza y entrega total a Dios."
    },
];
