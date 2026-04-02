import { ReadingDay } from '../reading-plan-data';

export interface ExtendedReadingDay extends ReadingDay {
    title?: string;
    section?: string;
}

export const sabadoSanto: ExtendedReadingDay[] = [
    {
        day: 1,
        section: "1. Jesús Permanece en el Sepulcro",
        title: "El cuerpo de Jesús es sepultado",
        reading: "Mateo 27:59-60",
        summary: "José de Arimatea coloca el cuerpo de Jesús en un sepulcro nuevo que había labrado en la peña. La piedra queda sellada. El silencio del sábado comienza."
    },
    {
        day: 2,
        title: "Envuelto en una sábana",
        reading: "Lucas 23:53-54",
        summary: "\"Y bajándolo, lo envolvió en una sábana, y lo puso en un sepulcro abierto en una peña.\" Un día de preparación llega a su fin, y el reposo sagrado inicia."
    },
    {
        day: 3,
        section: "2. Las Mujeres Reposan según el Mandamiento",
        title: "Fidelidad aun en el dolor",
        reading: "Lucas 23:55-56",
        summary: "\"Las mujeres… vieron el sepulcro, y cómo fue puesto su cuerpo. Y vueltas, prepararon especias aromáticas y ungüentos; y descansaron el sábado, conforme al mandamiento.\" Amor fiel que espera incluso cuando no entiende."
    },
    {
        day: 4,
        section: "3. Guardia en el Sepulcro",
        title: "El sepulcro sellado y custodiado",
        reading: "Mateo 27:62-66",
        summary: "Los principales sacerdotes y fariseos piden a Pilato que asegure el sepulcro. Pilato concede una guardia y se sella la piedra. Los hombres hacen todo lo posible para retener al que no puede ser retenido."
    },
];
