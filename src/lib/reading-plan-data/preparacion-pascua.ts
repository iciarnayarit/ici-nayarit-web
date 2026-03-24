import { ReadingDay } from '../reading-plan-data';

export interface ExtendedReadingDay extends ReadingDay {
    title?: string;
    section?: string;
}

export const preparacionPascua: ExtendedReadingDay[] = [
    {
        day: 1,
        section: "La Tipología y las Promesas (Días 1-6)",
        title: "El Cordero de la Liberación",
        reading: "Éxodo 12:1-14",
        summary: "La institución de la Pascua en Egipto. La sangre que salva de la muerte."
    },
    {
        day: 2,
        title: "El Paso de la Muerte a la Vida",
        reading: "Éxodo 14:15-31",
        summary: "El cruce del Mar Rojo. Dios abre camino donde no lo hay."
    },
    {
        day: 3,
        title: "El Sacrificio del Hijo Único",
        reading: "Génesis 22:1-18",
        summary: "El sacrificio de Isaac. El carnero que sustituye al hijo (prefigura de Cristo)."
    },
    {
        day: 4,
        title: "La Serpiente que Sana",
        reading: "Números 21:4-9",
        summary: "La serpiente de bronce levantada en el desierto (conectar con Juan 3:14-15)."
    },
    {
        day: 5,
        title: "El Siervo que Carga nuestro Dolor",
        reading: "Isaías 53:1-12",
        summary: "El poema del Siervo Sufriente. Escrito 700 años antes de la Pasión."
    },
    {
        day: 6,
        title: "La Promesa de un Nuevo Corazón",
        reading: "Ezequiel 36:24-28",
        summary: "El anuncio de una nueva alianza y un espíritu nuevo."
    },
    {
        day: 7,
        section: "La Semana de la Pasión (Días 7-14)",
        title: "Domingo de Entrada Triunfal",
        reading: "Marcos 11:1-11",
        summary: "Jesús entra en Jerusalén como Rey de Paz."
    },
    {
        day: 8,
        title: "Lunes de Autoridad",
        reading: "Mateo 21:12-22",
        summary: "Jesús purifica el Templo expulsando a los mercaderes y demuestra su autoridad sobre la naturaleza."
    },
    {
        day: 9,
        title: "Martes de Controversía",
        reading: "Mateo 22:1-46",
        summary: "Jesús enfrenta los cuestionamientos de los líderes religiosos y enseña verdades profundas sobre el Reino."
    },
    {
        day: 10,
        title: "Miércoles de descanso",
        reading: "Mateo 26:1-16",
        summary: "Mientras Jesús descansa en Betania, los líderes religiosos conspiran y Judas pacta su entrega."
    },
    {
        day: 11,
        title: "Jueves Santo: El Mandato del Amor y la Cena",
        reading: "Juan 13:1-17; Mateo 26:26-30",
        summary: "Lavatorio de los pies e institución de la Eucaristía."
    },
    {
        day: 12,
        title: "Viernes Santo: El Sacrificio Supremo",
        reading: "Juan 18:1-19:42; Salmos 22",
        summary: "Relato completo de la Pasión, desde el Huerto hasta el Sepulcro. La oración de Jesús en la cruz."
    },
    {
        day: 13,
        title: "Sábado Santo: El Silencio y la Esperanza",
        reading: "Mateo 27:57-66; Jonás 2:1-10",
        summary: "La guardia en el sepulcro y la soledad de los discípulos. El profeta en el vientre del pez (señal de los tres días bajo tierra)."
    },
    {
        day: 14,
        title: "Domingo de Resurrección: ¡Él ha Resucitado!",
        reading: "Juan 20:1-18; 1 Corintios 15:50-58",
        summary: "María Magdalena y el encuentro con el Resucitado. El triunfo final sobre la muerte."
    }
];
