import { ReadingDay } from '../reading-plan-data';

export interface ExtendedReadingDay extends ReadingDay {
    title?: string;
    section?: string;
}

export const viernesSanto: ExtendedReadingDay[] = [
    {
        day: 1,
        section: "1. Juicio ante Pilato y Herodes",
        title: "Jesús ante Pilato",
        reading: "Mateo 27:11-26",
        summary: "Jesús comparece ante Pilato, quien finalmente lo entrega para ser crucificado. La multitud elige a Barrabás y Pilato se lava las manos."
    },
    {
        day: 2,
        title: "El juicio según Marcos",
        reading: "Marcos 15:1-15",
        summary: "Relato paralelo del juicio ante Pilato. Jesús guarda silencio ante las acusaciones, cumpliendo la profecía del Siervo Sufriente."
    },
    {
        day: 3,
        title: "Jesús ante Herodes",
        reading: "Lucas 23:1-25",
        summary: "Jesús es llevado también ante Herodes, quien lo desprecia y lo devuelve a Pilato. La inocencia de Jesús es declarada varias veces."
    },
    {
        day: 4,
        title: "\"¿Qué es la verdad?\"",
        reading: "Juan 18:28-19:16",
        summary: "Profundo diálogo entre Jesús y Pilato sobre la verdad y el poder. Jesús declara: \"Para esto he nacido, para dar testimonio de la verdad.\""
    },
    {
        day: 5,
        section: "2. Camino al Gólgota",
        title: "Simón de Cirene lleva la cruz",
        reading: "Mateo 27:31-32",
        summary: "Jesús es llevado para ser crucificado, y Simón de Cirene es obligado a llevar su cruz. Un extraño comparte el peso que salvaría al mundo."
    },
    {
        day: 6,
        title: "Jesús habla a las mujeres de Jerusalén",
        reading: "Lucas 23:26-31",
        summary: "En el camino al Gólgota, Jesús se vuelve a las mujeres que lloran y les habla con palabras proféticas sobre Jerusalén."
    },
    {
        day: 7,
        section: "3. Crucifixión",
        title: "Jesús es crucificado en el Gólgota",
        reading: "Mateo 27:33-44",
        summary: "Jesús es crucificado entre dos ladrones. Los que pasan le insultan, pero Él ora: \"Padre, perdónalos, porque no saben lo que hacen.\" (Lucas 23:34)"
    },
    {
        day: 8,
        title: "\"Hoy estarás conmigo en el paraíso\"",
        reading: "Lucas 23:33-43",
        summary: "Uno de los ladrones crucificados reconoce a Jesús como Rey y pide ser recordado. Jesús le promete: \"Hoy estarás conmigo en el paraíso.\""
    },
    {
        day: 9,
        title: "La túnica y las Escrituras cumplidas",
        reading: "Juan 19:17-24",
        summary: "Los soldados echan suertes por la túnica de Jesús, cumpliendo el Salmo 22. Cada detalle de la crucifixión realiza la profecía."
    },
    {
        day: 10,
        section: "4. Muerte de Jesús",
        title: "\"Dios mío, ¿por qué me has desamparado?\"",
        reading: "Mateo 27:45-50",
        summary: "En medio de las tinieblas, Jesús clama el Salmo 22 y entrega su espíritu. El Hijo de Dios muere para que nosotros vivamos."
    },
    {
        day: 11,
        title: "\"Consumado es\"",
        reading: "Juan 19:30",
        summary: "Con su última palabra, Jesús declara terminada su misión. La obra de redención está completa. Nada puede añadirse ni quitarse."
    },
    {
        day: 12,
        title: "El velo del templo se rasga",
        reading: "Mateo 27:51",
        summary: "Al morir Jesús, el velo del templo se rasga de arriba abajo, simbolizando el acceso directo y libre a Dios para todo ser humano."
    },
    {
        day: 13,
        section: "5. Sepultura",
        title: "José de Arimatea pide el cuerpo de Jesús",
        reading: "Mateo 27:57-61",
        summary: "José de Arimatea, discípulo secreto, pide el cuerpo de Jesús y lo coloca en un sepulcro nuevo. Las mujeres permanecen velando."
    },
    {
        day: 14,
        title: "La sepultura según Juan",
        reading: "Juan 19:38-42",
        summary: "José y Nicodemo envuelven el cuerpo de Jesús con especias aromáticas y lo colocan en el sepulcro nuevo, conforme a la costumbre judía."
    },
];
