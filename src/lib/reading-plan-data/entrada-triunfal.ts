import { ReadingDay } from '../reading-plan-data';

export interface ExtendedReadingDay extends ReadingDay {
    title?: string;
    section?: string;
}

export const entradaTriunfal: ExtendedReadingDay[] = [
    {
        day: 1,
        section: "1. Envío de los Discípulos por el Pollino",
        title: "Instrucciones precisas para una entrada profética",
        reading: "Mateo 21:6-7",
        summary: "\"Los discípulos fueron, e hicieron como Jesús les mandó; y trajeron el asna y el pollino, y pusieron sobre ellos sus mantos; y él se sentó encima.\" Cada detalle fue planeado por Jesús para cumplir la profecía."
    },
    {
        day: 2,
        title: "Un pollino que nadie había montado",
        reading: "Marcos 11:2-7",
        summary: "Jesús instruyó a sus discípulos a traer un pollino atado, sobre el que ningún hombre había montado. Lo que nunca había sido usado para un hombre ahora serviría al Rey de reyes."
    },
    {
        day: 3,
        section: "2. Montó sobre el Pollino",
        title: "La profecía de Zacarías se cumple",
        reading: "Lucas 19:35",
        summary: "\"Habiendo echado sus mantos sobre el pollino, subieron a Jesús encima.\" Este acto cumplía la profecía de Zacarías 9:9: \"He aquí tu Rey viene a ti, justo y salvador, humilde, y cabalgando sobre un asno.\""
    },
    {
        day: 4,
        section: "3. La Multitud lo Recibió con Mantos y Ramas",
        title: "¡Hosanna al Hijo de David!",
        reading: "Mateo 21:8-9",
        summary: "\"La multitud… tendía sus mantos en el camino; y otros cortaban ramas de los árboles, y las tendían en el camino… aclamaba diciendo: ¡Hosanna al Hijo de David! ¡Bendito el que viene en el nombre del Señor!\" Israel recibe a su Rey."
    },
    {
        day: 5,
        title: "Ramas de palmera para el Rey de Israel",
        reading: "Juan 12:13",
        summary: "\"Tomaron ramas de palmera, y salieron a recibirle, y clamaban: ¡Hosanna! ¡Bendito el que viene en el nombre del Señor, el Rey de Israel!\" Juan subraya el título real: no solo el Hijo de David, sino el Rey de Israel."
    },
    {
        day: 6,
        section: "4. La Proclamación de Hosanna",
        title: "Toda la multitud alaba a Dios",
        reading: "Lucas 19:37-38",
        summary: "\"Toda la multitud… comenzó a alabar a Dios a grandes voces por todas las maravillas que habían visto, diciendo: ¡Bendito el Rey que viene en el nombre del Señor!\" El reconocimiento público lo presenta como el Mesías esperado durante siglos."
    },
    {
        day: 7,
        section: "5. Jesús Observa el Templo",
        title: "El Rey mira y prepara lo que vendrá",
        reading: "Marcos 11:11",
        summary: "\"Y entró Jesús en Jerusalén, y en el templo; y después de haber mirado alrededor todas las cosas, como ya anochecía, se fue a Betania con los doce.\" Su entrada no fue para confrontar de inmediato, sino para observar y preparar la purificación del templo al día siguiente."
    },
];
