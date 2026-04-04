/** Versículos en español para el “versículo del día” (orden fijo; la fecha elige el índice). */
export interface DailyVerseEs {
  text: string;
  reference: string;
}

const VERSES: DailyVerseEs[] = [
  {
    text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
    reference: 'Jeremías 29:11',
  },
  {
    text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
    reference: 'Juan 3:16',
  },
  {
    text: 'Todo lo puedo en Cristo que me fortalece.',
    reference: 'Filipenses 4:13',
  },
  {
    text: 'Jehová es mi pastor; nada me faltará.',
    reference: 'Salmos 23:1',
  },
  {
    text: 'En paz me acuesto y asimismo duermo, porque solo tú, Jehová, me haces vivir confiado.',
    reference: 'Salmos 4:8',
  },
  {
    text: 'Fíate de Jehová de todo tu corazón, y no en tu prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.',
    reference: 'Proverbios 3:5-6',
  },
  {
    text: 'Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.',
    reference: 'Mateo 6:33',
  },
  {
    text: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.',
    reference: 'Romanos 8:28',
  },
  {
    text: 'No se turbe vuestro corazón; creéis en Dios, creed también en mí.',
    reference: 'Juan 14:1',
  },
  {
    text: 'El Señor peleará por vosotros, y vosotros estaréis tranquilos.',
    reference: 'Éxodo 14:14',
  },
  {
    text: 'Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo de ellos, porque Jehová tu Dios es el que va contigo; no te dejará ni te desamparará.',
    reference: 'Deuteronomio 31:6',
  },
  {
    text: 'Si confesamos nuestros pecados, él es fiel y justo para perdonar nuestros pecados y limpiarnos de toda maldad.',
    reference: '1 Juan 1:9',
  },
  {
    text: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.',
    reference: 'Mateo 11:28',
  },
  {
    text: 'Mas la gracia de nuestro Señor fue más abundante con la fe y el amor que es en Cristo Jesús.',
    reference: '1 Timoteo 1:14',
  },
  {
    text: 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino.',
    reference: 'Salmos 119:105',
  },
  {
    text: 'El ángel del Jehová acampa alrededor de los que le temen, y los defiende.',
    reference: 'Salmos 34:7',
  },
  {
    text: 'Jehová pelea por vosotros, y vosotros estaréis tranquilos.',
    reference: '2 Crónicas 20:17',
  },
  {
    text: 'Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.',
    reference: 'Filipenses 4:7',
  },
  {
    text: 'Mas Dios muestra su amor para con nosotros, en que siendo aún pecadores, Cristo murió por nosotros.',
    reference: 'Romanos 5:8',
  },
  {
    text: 'Porque para Dios somos colaboradores suyos, y sois labranza de Dios, edificación de Dios.',
    reference: '1 Corintios 3:9',
  },
  {
    text: 'Y sobre todas estas cosas vestíos de amor, que es el vínculo perfecto.',
    reference: 'Colosenses 3:14',
  },
  {
    text: 'El Señor es mi luz y mi salvación; ¿de quién temeré? El Señor es la fortaleza de mi vida; ¿de quién he de atemorizarme?',
    reference: 'Salmos 27:1',
  },
  {
    text: 'Bienaventurados los de limpio corazón, porque ellos verán a Dios.',
    reference: 'Mateo 5:8',
  },
  {
    text: 'Porque un día en tus atrios es mejor que mil fuera de ellos.',
    reference: 'Salmos 84:10',
  },
  {
    text: 'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo.',
    reference: 'Isaías 41:10',
  },
  {
    text: 'Mas el fruto del Espíritu es amor, gozo, paz, paciencia, benignidad, bondad, fe, mansedumbre, templanza.',
    reference: 'Gálatas 5:22-23',
  },
  {
    text: 'Si luego Dios está por nosotros, ¿quién contra nosotros?',
    reference: 'Romanos 8:31',
  },
  {
    text: 'Jehová cumplirá su propósito en mí; tu misericordia, oh Jehová, es para siempre.',
    reference: 'Salmos 138:8',
  },
  {
    text: 'Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios.',
    reference: 'Efesios 2:8',
  },
  {
    text: 'El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.',
    reference: 'Salmos 91:1',
  },
  {
    text: 'Confía en Jehová de todo corazón, y no en tu prudencia.',
    reference: 'Proverbios 3:5',
  },
  {
    text: 'Tú guardarás en completa paz a aquel cuyo pensamiento en ti persevera; porque en ti ha confiado.',
    reference: 'Isaías 26:3',
  },
  {
    text: 'Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.',
    reference: 'Hebreos 11:1',
  },
  {
    text: 'Oh hombre, él te ha declarado lo que es bueno, y qué pide Jehová de ti: solamente hacer justicia, y amar misericordia, y humillarte ante tu Dios.',
    reference: 'Miqueas 6:8',
  },
  {
    text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.',
    reference: 'Josué 1:9',
  },
  {
    text: 'Y me ha dicho: Bástate mi gracia; porque mi poder se perfecciona en la debilidad. Por tanto, de buena gana me gloriaré más bien en mis debilidades, para que repose sobre mí el poder de Cristo.',
    reference: '2 Corintios 12:9',
  },
  {
    text: 'Si alguno de vosotros tiene falta de sabiduría, pídala a Dios, el cual da a todos abundantemente sin reproche, y le será dada.',
    reference: 'Santiago 1:5',
  },
  {
    text: 'Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.',
    reference: '1 Pedro 5:7',
  },
  {
    text: 'No temáis, manada pequeña, porque a vuestro Padre le ha placido daros el reino.',
    reference: 'Lucas 12:32',
  },
  {
    text: 'Y no os entristezcáis, porque el gozo de Jehová es vuestra fuerza.',
    reference: 'Nehemías 8:10',
  },
];

function dailyIndexFromDate(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const day = date.getDate();
  const n = y * 10000 + m * 100 + day;
  return (n * 7919 + 104729) % VERSES.length;
}

/** Índice del versículo del día (lista circular). */
export function getDailyVerseIndex(date: Date): number {
  return dailyIndexFromDate(date);
}

/** Versículo del día según la fecha local. */
export function getDailyVerseEs(date: Date): DailyVerseEs {
  return VERSES[dailyIndexFromDate(date)];
}

/**
 * Diapositivas del carrusel: el versículo del día y los `extraCount` siguientes en la lista (circular).
 */
export function getDailySliderVerses(date: Date, extraCount = 9): DailyVerseEs[] {
  const start = dailyIndexFromDate(date);
  const len = extraCount + 1;
  return Array.from({ length: len }, (_, i) => VERSES[(start + i) % VERSES.length]);
}
