export type TriviaQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type TriviaTopic = {
  slug: string;
  title: string;
  level: string;
  description: string;
  questions: TriviaQuestion[];
};

export function triviaBasePointsByDifficulty(level: string): number {
  const lv = level.trim().toLowerCase();
  if (lv === 'principiante') return 120;
  if (lv === 'intermedio') return 180;
  if (lv === 'experto') return 260;
  if (lv === 'sabio') return 340;
  return 100;
}

function buildBookQuestions(input: {
  slug: string;
  title: string;
  person: string;
  place: string;
  theme: string;
  event: string;
}): TriviaQuestion[] {
  const { slug, title, person, place, theme, event } = input;
  return [
    { id: `${slug}-1`, prompt: `¿Cuál es el enfoque principal del libro de ${title}?`, options: [theme, 'Genealogías modernas', 'Política romana', 'Historia de Europa'], correctIndex: 0 },
    { id: `${slug}-2`, prompt: `¿Qué personaje se relaciona fuertemente con ${title}?`, options: ['Nabucodonosor', person, 'Pilato', 'Timoteo'], correctIndex: 1 },
    { id: `${slug}-3`, prompt: `¿Qué lugar es clave en ${title}?`, options: ['Roma', 'Atenas', place, 'Éfeso'], correctIndex: 2 },
    { id: `${slug}-4`, prompt: `¿Qué evento importante aparece en ${title}?`, options: [event, 'Concilio de Nicea', 'Reforma protestante', 'Exilio de Juan Hus'], correctIndex: 0 },
    { id: `${slug}-5`, prompt: `¿${title} pertenece principalmente a qué sección bíblica?`, options: ['Profetas menores', 'Pentateuco / Históricos / Poéticos / Proféticos / Evangelios / Cartas / Profecía final', 'Deuterocanónicos', 'Apócrifos griegos'], correctIndex: 1 },
    { id: `${slug}-6`, prompt: `¿Qué enseña ${title} para la vida de fe?`, options: ['Autosuficiencia', 'Confianza y obediencia a Dios', 'Rituales sin corazón', 'Neutralidad moral'], correctIndex: 1 },
    { id: `${slug}-7`, prompt: `En una trivia de ${title}, ¿qué conviene estudiar primero?`, options: ['Solo mapas modernos', 'Solo fechas', 'Contexto, personajes y mensaje central', 'Traducciones latinas medievales únicamente'], correctIndex: 2 },
    { id: `${slug}-8`, prompt: `¿Cuál afirmación encaja mejor con ${title}?`, options: ['No tiene aplicación actual', 'Muestra el carácter de Dios en la historia', 'Es solo simbólico sin mensaje', 'Fue escrito en la edad media'], correctIndex: 1 },
    { id: `${slug}-9`, prompt: `¿Qué tipo de pregunta es típica de ${title}?`, options: ['Deportes y geografía moderna', 'Mitología griega', `Personajes, eventos y propósito espiritual de ${title}`, 'Programación y redes'], correctIndex: 2 },
    { id: `${slug}-10`, prompt: `¿Qué resultado busca este tema de ${title}?`, options: ['Memorizar datos sin reflexión', 'Fortalecer comprensión bíblica y práctica de fe', 'Competencia sin aprendizaje', 'Solo entretenimiento'], correctIndex: 1 },
  ];
}

const EXTRA_TRIVIA_TOPICS: TriviaTopic[] = [
  { slug: 'genesis', title: 'Génesis', level: 'Intermedio', description: 'Creación, patriarcas y promesas de pacto.', questions: buildBookQuestions({ slug: 'genesis', title: 'Génesis', person: 'Abraham', place: 'Ur y Canaán', theme: 'Orígenes y pacto', event: 'La creación y el llamado de Abraham' }) },
  { slug: 'exodo', title: 'Éxodo', level: 'Intermedio', description: 'Liberación de Egipto y camino al Sinaí.', questions: buildBookQuestions({ slug: 'exodo', title: 'Éxodo', person: 'Moisés', place: 'Egipto', theme: 'Redención y ley', event: 'La salida de Egipto' }) },
  { slug: 'levitico', title: 'Levítico', level: 'Experto', description: 'Santidades, ofrendas y vida consagrada.', questions: buildBookQuestions({ slug: 'levitico', title: 'Levítico', person: 'Aarón', place: 'Tabernáculo', theme: 'Santidad y adoración', event: 'Leyes sacerdotales' }) },
  { slug: 'numeros', title: 'Números', level: 'Experto', description: 'Desierto, censos y fidelidad en el camino.', questions: buildBookQuestions({ slug: 'numeros', title: 'Números', person: 'Josué', place: 'Desierto', theme: 'Peregrinación y obediencia', event: 'Censos de Israel' }) },
  { slug: 'deuteronomio', title: 'Deuteronomio', level: 'Experto', description: 'Renovación del pacto antes de entrar a la tierra.', questions: buildBookQuestions({ slug: 'deuteronomio', title: 'Deuteronomio', person: 'Moisés', place: 'Llanos de Moab', theme: 'Memoria y obediencia', event: 'Últimos discursos de Moisés' }) },
  { slug: 'josue', title: 'Josué', level: 'Intermedio', description: 'Conquista y repartición de la tierra prometida.', questions: buildBookQuestions({ slug: 'josue', title: 'Josué', person: 'Josué', place: 'Jericó', theme: 'Conquista por fe', event: 'Caída de Jericó' }) },
  { slug: 'jueces', title: 'Jueces', level: 'Intermedio', description: 'Ciclos de caída, clamor y restauración.', questions: buildBookQuestions({ slug: 'jueces', title: 'Jueces', person: 'Débora', place: 'Israel', theme: 'Necesidad de liderazgo piadoso', event: 'Liberaciones de los jueces' }) },
  { slug: 'samuel-y-reyes', title: 'Samuel y Reyes', level: 'Sabio', description: 'Monarquía, profetas y decisiones de reyes.', questions: buildBookQuestions({ slug: 'samuel-y-reyes', title: 'Samuel y Reyes', person: 'David', place: 'Jerusalén', theme: 'Reinado y pacto davídico', event: 'Unción de reyes en Israel' }) },
  { slug: 'salmos', title: 'Salmos', level: 'Principiante', description: 'Oración, alabanza y confianza en Dios.', questions: buildBookQuestions({ slug: 'salmos', title: 'Salmos', person: 'David', place: 'Sion', theme: 'Adoración y clamor', event: 'Cantos de alabanza y lamento' }) },
  { slug: 'proverbios', title: 'Proverbios', level: 'Principiante', description: 'Sabiduría práctica para la vida diaria.', questions: buildBookQuestions({ slug: 'proverbios', title: 'Proverbios', person: 'Salomón', place: 'Jerusalén', theme: 'Sabiduría y temor de Dios', event: 'Colección de dichos sabios' }) },
  { slug: 'isaias', title: 'Isaías', level: 'Sabio', description: 'Juicio, esperanza y promesa mesiánica.', questions: buildBookQuestions({ slug: 'isaias', title: 'Isaías', person: 'Isaías', place: 'Judá', theme: 'Santidad y redención', event: 'Visión del trono de Dios' }) },
  { slug: 'jeremias', title: 'Jeremías', level: 'Sabio', description: 'Llamado al arrepentimiento y nuevo pacto.', questions: buildBookQuestions({ slug: 'jeremias', title: 'Jeremías', person: 'Jeremías', place: 'Jerusalén', theme: 'Quebranto y esperanza', event: 'Anuncio del nuevo pacto' }) },
  { slug: 'daniel', title: 'Daniel', level: 'Experto', description: 'Fidelidad en Babilonia y visiones proféticas.', questions: buildBookQuestions({ slug: 'daniel', title: 'Daniel', person: 'Daniel', place: 'Babilonia', theme: 'Soberanía de Dios', event: 'Foso de los leones' }) },
  { slug: 'mateo', title: 'Mateo', level: 'Intermedio', description: 'Jesús como Rey y cumplimiento profético.', questions: buildBookQuestions({ slug: 'mateo', title: 'Mateo', person: 'Jesús', place: 'Galilea', theme: 'Reino de los cielos', event: 'Sermón del Monte' }) },
  { slug: 'marcos', title: 'Marcos', level: 'Intermedio', description: 'Evangelio dinámico del siervo poderoso.', questions: buildBookQuestions({ slug: 'marcos', title: 'Marcos', person: 'Jesús', place: 'Capernaum', theme: 'Servicio y autoridad de Cristo', event: 'Milagros y pasión' }) },
  { slug: 'lucas', title: 'Lucas', level: 'Intermedio', description: 'Detalle histórico y compasión de Jesús.', questions: buildBookQuestions({ slug: 'lucas', title: 'Lucas', person: 'Jesús', place: 'Jerusalén', theme: 'Salvación para todos', event: 'Parábolas distintivas' }) },
  { slug: 'juan', title: 'Juan', level: 'Sabio', description: 'Señales para creer y vida eterna en Cristo.', questions: buildBookQuestions({ slug: 'juan', title: 'Juan', person: 'Juan', place: 'Judea', theme: 'Creer en el Hijo', event: 'Yo soy y señales de Jesús' }) },
  { slug: 'hechos', title: 'Hechos', level: 'Intermedio', description: 'Expansión de la iglesia por el Espíritu Santo.', questions: buildBookQuestions({ slug: 'hechos', title: 'Hechos', person: 'Pedro y Pablo', place: 'Jerusalén y Antioquía', theme: 'Misión de la iglesia', event: 'Pentecostés' }) },
  { slug: 'romanos', title: 'Romanos', level: 'Experto', description: 'Doctrina de la gracia y justicia por fe.', questions: buildBookQuestions({ slug: 'romanos', title: 'Romanos', person: 'Pablo', place: 'Roma', theme: 'Justificación por fe', event: 'Exposición del evangelio' }) },
  { slug: 'apocalipsis', title: 'Apocalipsis', level: 'Sabio', description: 'Esperanza final, victoria y nueva creación.', questions: buildBookQuestions({ slug: 'apocalipsis', title: 'Apocalipsis', person: 'Juan', place: 'Patmos', theme: 'Victoria final de Cristo', event: 'Visión del trono y nueva Jerusalén' }) },
];

const EXTRA_TRIVIA_TOPICS_30: TriviaTopic[] = [
  { slug: 'rut', title: 'Rut', level: 'Principiante', description: 'Lealtad, redención y esperanza en tiempos difíciles.', questions: buildBookQuestions({ slug: 'rut', title: 'Rut', person: 'Rut', place: 'Belén', theme: 'Fidelidad y redención', event: 'Redención por Booz' }) },
  { slug: '1-samuel', title: '1 Samuel', level: 'Intermedio', description: 'Samuel, Saúl y el inicio de la monarquía.', questions: buildBookQuestions({ slug: '1-samuel', title: '1 Samuel', person: 'Samuel', place: 'Israel', theme: 'Transición hacia la monarquía', event: 'Unción de Saúl y David' }) },
  { slug: '2-samuel', title: '2 Samuel', level: 'Intermedio', description: 'Reinado de David y pacto eterno.', questions: buildBookQuestions({ slug: '2-samuel', title: '2 Samuel', person: 'David', place: 'Jerusalén', theme: 'Reino davídico', event: 'Pacto con David' }) },
  { slug: '1-reyes', title: '1 Reyes', level: 'Experto', description: 'Sabiduría de Salomón y división del reino.', questions: buildBookQuestions({ slug: '1-reyes', title: '1 Reyes', person: 'Salomón', place: 'Jerusalén', theme: 'Gloria y decadencia del reino', event: 'Construcción del templo' }) },
  { slug: '2-reyes', title: '2 Reyes', level: 'Experto', description: 'Profetas y caída de Israel y Judá.', questions: buildBookQuestions({ slug: '2-reyes', title: '2 Reyes', person: 'Eliseo', place: 'Samaria', theme: 'Juicio y exilio', event: 'Caída de Jerusalén' }) },
  { slug: '1-cronicas', title: '1 Crónicas', level: 'Intermedio', description: 'Genealogías y reinado de David.', questions: buildBookQuestions({ slug: '1-cronicas', title: '1 Crónicas', person: 'David', place: 'Sion', theme: 'Memoria del pueblo y adoración', event: 'Traslado del arca' }) },
  { slug: '2-cronicas', title: '2 Crónicas', level: 'Intermedio', description: 'Templo, reyes de Judá y reformas espirituales.', questions: buildBookQuestions({ slug: '2-cronicas', title: '2 Crónicas', person: 'Ezequías', place: 'Judá', theme: 'Reforma y fidelidad', event: 'Reformas de Josías' }) },
  { slug: 'esdras', title: 'Esdras', level: 'Intermedio', description: 'Regreso del exilio y restauración del culto.', questions: buildBookQuestions({ slug: 'esdras', title: 'Esdras', person: 'Esdras', place: 'Jerusalén', theme: 'Restauración espiritual', event: 'Reconstrucción del templo' }) },
  { slug: 'nehemias', title: 'Nehemías', level: 'Intermedio', description: 'Reconstrucción de muros y renovación comunitaria.', questions: buildBookQuestions({ slug: 'nehemias', title: 'Nehemías', person: 'Nehemías', place: 'Jerusalén', theme: 'Liderazgo y restauración', event: 'Reconstrucción del muro' }) },
  { slug: 'ester', title: 'Ester', level: 'Principiante', description: 'Valentía y providencia para salvar un pueblo.', questions: buildBookQuestions({ slug: 'ester', title: 'Ester', person: 'Ester', place: 'Susa', theme: 'Providencia y valentía', event: 'Liberación en Purim' }) },
  { slug: 'job', title: 'Job', level: 'Sabio', description: 'Sufrimiento, justicia y confianza en Dios.', questions: buildBookQuestions({ slug: 'job', title: 'Job', person: 'Job', place: 'Uz', theme: 'Fe en medio del dolor', event: 'Restauración de Job' }) },
  { slug: 'eclesiastes', title: 'Eclesiastés', level: 'Sabio', description: 'Reflexiones sobre sentido, tiempo y propósito.', questions: buildBookQuestions({ slug: 'eclesiastes', title: 'Eclesiastés', person: 'Salomón', place: 'Jerusalén', theme: 'Sentido de la vida en Dios', event: 'Todo tiene su tiempo' }) },
  { slug: 'cantares', title: 'Cantares', level: 'Principiante', description: 'Amor, belleza y lenguaje poético.', questions: buildBookQuestions({ slug: 'cantares', title: 'Cantares', person: 'La Sulamita', place: 'Israel', theme: 'Amor y alianza', event: 'Poemas de amor' }) },
  { slug: 'lamentaciones', title: 'Lamentaciones', level: 'Experto', description: 'Dolor por Jerusalén y esperanza en la misericordia.', questions: buildBookQuestions({ slug: 'lamentaciones', title: 'Lamentaciones', person: 'Jeremías', place: 'Jerusalén', theme: 'Quebranto y esperanza', event: 'Lamento por la ciudad caída' }) },
  { slug: 'ezequiel', title: 'Ezequiel', level: 'Sabio', description: 'Visiones proféticas y restauración futura.', questions: buildBookQuestions({ slug: 'ezequiel', title: 'Ezequiel', person: 'Ezequiel', place: 'Babilonia', theme: 'Juicio y restauración', event: 'Valle de huesos secos' }) },
  { slug: 'oseas', title: 'Oseas', level: 'Intermedio', description: 'Amor fiel de Dios hacia su pueblo.', questions: buildBookQuestions({ slug: 'oseas', title: 'Oseas', person: 'Oseas', place: 'Israel del norte', theme: 'Amor redentor', event: 'Llamado al arrepentimiento' }) },
  { slug: 'joel', title: 'Joel', level: 'Intermedio', description: 'Día del Señor y promesa del Espíritu.', questions: buildBookQuestions({ slug: 'joel', title: 'Joel', person: 'Joel', place: 'Judá', theme: 'Arrepentimiento y esperanza', event: 'Derramamiento del Espíritu' }) },
  { slug: 'amos', title: 'Amós', level: 'Experto', description: 'Justicia social y llamado profético.', questions: buildBookQuestions({ slug: 'amos', title: 'Amós', person: 'Amós', place: 'Betel', theme: 'Justicia y rectitud', event: 'Denuncia de injusticia' }) },
  { slug: 'abdias', title: 'Abdías', level: 'Intermedio', description: 'Juicio sobre Edom y restauración de Sion.', questions: buildBookQuestions({ slug: 'abdias', title: 'Abdías', person: 'Abdías', place: 'Edom', theme: 'Justicia divina', event: 'Profecía contra Edom' }) },
  { slug: 'jonas', title: 'Jonás', level: 'Principiante', description: 'Misericordia de Dios para Nínive.', questions: buildBookQuestions({ slug: 'jonas', title: 'Jonás', person: 'Jonás', place: 'Nínive', theme: 'Compasión y obediencia', event: 'Predicación en Nínive' }) },
  { slug: 'miqueas', title: 'Miqueas', level: 'Intermedio', description: 'Juicio, esperanza y anuncio mesiánico.', questions: buildBookQuestions({ slug: 'miqueas', title: 'Miqueas', person: 'Miqueas', place: 'Judá', theme: 'Justicia, misericordia y humildad', event: 'Profecía sobre Belén' }) },
  { slug: 'nahum', title: 'Nahúm', level: 'Experto', description: 'Juicio contra Nínive.', questions: buildBookQuestions({ slug: 'nahum', title: 'Nahúm', person: 'Nahúm', place: 'Nínive', theme: 'Justicia contra la opresión', event: 'Caída de Nínive' }) },
  { slug: 'habacuc', title: 'Habacuc', level: 'Sabio', description: 'Diálogo con Dios en tiempos de crisis.', questions: buildBookQuestions({ slug: 'habacuc', title: 'Habacuc', person: 'Habacuc', place: 'Judá', theme: 'Fe en medio de la duda', event: 'El justo por su fe vivirá' }) },
  { slug: 'sofonias', title: 'Sofonías', level: 'Experto', description: 'Advertencia y restauración futura.', questions: buildBookQuestions({ slug: 'sofonias', title: 'Sofonías', person: 'Sofonías', place: 'Jerusalén', theme: 'Día del Señor', event: 'Promesa de restauración' }) },
  { slug: 'hageo', title: 'Hageo', level: 'Intermedio', description: 'Prioridades espirituales y reconstrucción del templo.', questions: buildBookQuestions({ slug: 'hageo', title: 'Hageo', person: 'Hageo', place: 'Jerusalén', theme: 'Reedificar para Dios', event: 'Llamado a reconstruir el templo' }) },
  { slug: 'zacarias', title: 'Zacarías', level: 'Sabio', description: 'Visiones de esperanza y reino futuro.', questions: buildBookQuestions({ slug: 'zacarias', title: 'Zacarías', person: 'Zacarías', place: 'Jerusalén', theme: 'Esperanza mesiánica', event: 'Visiones nocturnas' }) },
  { slug: 'malaquias', title: 'Malaquías', level: 'Intermedio', description: 'Última voz profética del Antiguo Testamento.', questions: buildBookQuestions({ slug: 'malaquias', title: 'Malaquías', person: 'Malaquías', place: 'Judá', theme: 'Fidelidad en la adoración', event: 'Promesa de Elías' }) },
  { slug: '1-corintios', title: '1 Corintios', level: 'Experto', description: 'Unidad, dones y vida en santidad.', questions: buildBookQuestions({ slug: '1-corintios', title: '1 Corintios', person: 'Pablo', place: 'Corinto', theme: 'Iglesia y madurez', event: 'Enseñanza sobre el amor' }) },
  { slug: '2-corintios', title: '2 Corintios', level: 'Experto', description: 'Consuelo, reconciliación y fortaleza en debilidad.', questions: buildBookQuestions({ slug: '2-corintios', title: '2 Corintios', person: 'Pablo', place: 'Corinto', theme: 'Ministerio y consuelo', event: 'Poder en debilidad' }) },
  { slug: 'galatas', title: 'Gálatas', level: 'Intermedio', description: 'Libertad en Cristo y gracia transformadora.', questions: buildBookQuestions({ slug: 'galatas', title: 'Gálatas', person: 'Pablo', place: 'Galacia', theme: 'Justificación por fe', event: 'Fruto del Espíritu' }) },
];

const GENERAL_TRIVIA_TOPICS_20: TriviaTopic[] = [
  { slug: 'tema-creacion', title: 'La Creación', level: 'Principiante', description: 'Los siete días del origen del mundo en Génesis.', questions: [
    { id: 'tc-1', prompt: '¿En cuántos días creó Dios los cielos y la tierra?', options: ['3', '6', '7', '40'], correctIndex: 1 },
    { id: 'tc-2', prompt: '¿Qué creó Dios en el primer día?', options: ['La luz', 'Los animales', 'El sol y la luna', 'El hombre'], correctIndex: 0 },
    { id: 'tc-3', prompt: '¿Qué separó Dios en el segundo día?', options: ['Luz y tinieblas', 'Aguas de arriba y de abajo', 'Mar y tierra seca', 'Peces y aves'], correctIndex: 1 },
    { id: 'tc-4', prompt: '¿Qué fue creado en el cuarto día?', options: ['Plantas', 'Aves', 'Sol, luna y estrellas', 'Seres humanos'], correctIndex: 2 },
    { id: 'tc-5', prompt: '¿Qué creó Dios en el sexto día?', options: ['Solo aves', 'Animales terrestres y al ser humano', 'Solo peces', 'Nada'], correctIndex: 1 },
    { id: 'tc-6', prompt: '¿A imagen de quién fue creado el ser humano?', options: ['De los ángeles', 'De sí mismo', 'De Dios', 'Del polvo únicamente'], correctIndex: 2 },
    { id: 'tc-7', prompt: '¿Qué hizo Dios en el séptimo día?', options: ['Creó al hombre', 'Descansó', 'Dividió el mar', 'Formó la luna'], correctIndex: 1 },
    { id: 'tc-8', prompt: '¿Cómo evaluó Dios su creación al final?', options: ['Incompleta', 'Defectuosa', 'Muy buena', 'Regular'], correctIndex: 2 },
    { id: 'tc-9', prompt: '¿En qué libro está el relato de la creación?', options: ['Éxodo', 'Génesis', 'Levítico', 'Salmos'], correctIndex: 1 },
    { id: 'tc-10', prompt: '¿Cuál es una enseñanza central de la creación?', options: ['El universo es casual', 'Dios es Creador soberano', 'La materia es eterna', 'No hay propósito'], correctIndex: 1 },
  ]},
  { slug: 'tema-eden', title: 'El Jardín del Edén', level: 'Principiante', description: 'Adán, Eva y la caída del ser humano.', questions: [
    { id: 'te-1', prompt: '¿Cómo se llamaba el jardín donde vivían Adán y Eva?', options: ['Getsemaní', 'Edén', 'Hebrón', 'Sinaí'], correctIndex: 1 },
    { id: 'te-2', prompt: '¿Qué árbol no debían comer?', options: ['Árbol de olivo', 'Árbol de la vida', 'Árbol del conocimiento del bien y del mal', 'Cedro del Líbano'], correctIndex: 2 },
    { id: 'te-3', prompt: '¿Quién tentó a Eva?', options: ['Un león', 'Una serpiente', 'Caín', 'Un ángel'], correctIndex: 1 },
    { id: 'te-4', prompt: '¿Qué ocurrió tras desobedecer a Dios?', options: ['Fueron exaltados', 'Murieron al instante', 'Entró el pecado y fueron expulsados', 'Recibieron más poder'], correctIndex: 2 },
    { id: 'te-5', prompt: '¿Qué hizo Adán después de comer?', options: ['Dio gracias', 'Se escondió', 'Cantó', 'Construyó un altar'], correctIndex: 1 },
    { id: 'te-6', prompt: '¿Quién cosió hojas para cubrirse?', options: ['Dios', 'Adán y Eva', 'Caín', 'Noé'], correctIndex: 1 },
    { id: 'te-7', prompt: '¿Qué puso Dios a la entrada del jardín?', options: ['Una muralla', 'Querubines y espada encendida', 'Un río', 'Un altar'], correctIndex: 1 },
    { id: 'te-8', prompt: '¿Qué verdad enseña este relato?', options: ['El pecado no trae consecuencias', 'La desobediencia rompe la comunión con Dios', 'No existe tentación', 'Dios no perdona'], correctIndex: 1 },
    { id: 'te-9', prompt: '¿Quién formó a Eva según Génesis?', options: ['Adán', 'Dios', 'Un ángel', 'Noé'], correctIndex: 1 },
    { id: 'te-10', prompt: '¿De qué parte de Adán fue formada Eva?', options: ['Del brazo', 'De una costilla', 'Del corazón literal', 'Del pie'], correctIndex: 1 },
  ]},
  { slug: 'tema-diluvio', title: 'El Diluvio Universal', level: 'Intermedio', description: 'Noé, el arca y el pacto del arcoíris.', questions: buildBookQuestions({ slug: 'tema-diluvio', title: 'El Diluvio Universal', person: 'Noé', place: 'Ararat', theme: 'Juicio y salvación', event: 'Pacto del arcoíris' }) },
  { slug: 'tema-patriarcas', title: 'Los Patriarcas', level: 'Intermedio', description: 'Abraham, Isaac y Jacob en la historia del pacto.', questions: buildBookQuestions({ slug: 'tema-patriarcas', title: 'Los Patriarcas', person: 'Abraham', place: 'Canaán', theme: 'Promesas del pacto', event: 'Llamado de Abraham' }) },
  { slug: 'tema-jose-egipto', title: 'José en Egipto', level: 'Intermedio', description: 'De esclavo a gobernador por la providencia de Dios.', questions: buildBookQuestions({ slug: 'tema-jose-egipto', title: 'José en Egipto', person: 'José', place: 'Egipto', theme: 'Providencia y perdón', event: 'Interpretación de sueños de Faraón' }) },
  { slug: 'tema-exodo-general', title: 'El Éxodo', level: 'Intermedio', description: 'Moisés, las plagas y el cruce del Mar Rojo.', questions: buildBookQuestions({ slug: 'tema-exodo-general', title: 'El Éxodo', person: 'Moisés', place: 'Egipto y Mar Rojo', theme: 'Liberación del pueblo', event: 'Cruce del Mar Rojo' }) },
  { slug: 'tema-diez-mandamientos', title: 'Los Diez Mandamientos', level: 'Intermedio', description: 'Las leyes dadas por Dios en el Monte Sinaí.', questions: buildBookQuestions({ slug: 'tema-diez-mandamientos', title: 'Los Diez Mandamientos', person: 'Moisés', place: 'Monte Sinaí', theme: 'Ley y santidad', event: 'Entrega de las tablas' }) },
  { slug: 'tema-jueces-israel', title: 'Los Jueces de Israel', level: 'Intermedio', description: 'Sansón, Débora y Gedeón como líderes de Israel.', questions: buildBookQuestions({ slug: 'tema-jueces-israel', title: 'Los Jueces de Israel', person: 'Débora', place: 'Israel', theme: 'Liberación y liderazgo', event: 'Victorias de los jueces' }) },
  { slug: 'tema-david-goliat', title: 'David y Goliat', level: 'Principiante', description: 'La victoria de la fe sobre el gigante filisteo.', questions: buildBookQuestions({ slug: 'tema-david-goliat', title: 'David y Goliat', person: 'David', place: 'Valle de Elá', theme: 'Fe y valentía', event: 'Derrota de Goliat' }) },
  { slug: 'tema-salomon-sabiduria', title: 'La Sabiduría de Salomón', level: 'Experto', description: 'Reinado sabio y construcción del Templo.', questions: buildBookQuestions({ slug: 'tema-salomon-sabiduria', title: 'La Sabiduría de Salomón', person: 'Salomón', place: 'Jerusalén', theme: 'Sabiduría y reino', event: 'Construcción del templo' }) },
  { slug: 'tema-grandes-profetas-general', title: 'Grandes Profetas', level: 'Experto', description: 'Misiones y visiones de Isaías, Jeremías y Ezequiel.', questions: buildBookQuestions({ slug: 'tema-grandes-profetas-general', title: 'Grandes Profetas', person: 'Isaías', place: 'Judá y Babilonia', theme: 'Juicio y esperanza', event: 'Visiones proféticas mayores' }) },
  { slug: 'tema-mujeres-biblia', title: 'Mujeres de la Biblia', level: 'Intermedio', description: 'Fe y valentía de Ester, Rut, María y María Magdalena.', questions: buildBookQuestions({ slug: 'tema-mujeres-biblia', title: 'Mujeres de la Biblia', person: 'Ester', place: 'Susa y Belén', theme: 'Fe, servicio y propósito', event: 'Rescate y testimonio fiel' }) },
  { slug: 'tema-nacimiento-jesus', title: 'El Nacimiento de Jesús', level: 'Principiante', description: 'Relatos de la Navidad en los Evangelios.', questions: buildBookQuestions({ slug: 'tema-nacimiento-jesus', title: 'El Nacimiento de Jesús', person: 'María', place: 'Belén', theme: 'Encarnación del Mesías', event: 'Nacimiento en Belén' }) },
  { slug: 'tema-parabolas-jesus', title: 'Parábolas de Jesús', level: 'Intermedio', description: 'Enseñanzas del Buen Samaritano y el Hijo Pródigo.', questions: buildBookQuestions({ slug: 'tema-parabolas-jesus', title: 'Parábolas de Jesús', person: 'Jesús', place: 'Galilea', theme: 'Reino y misericordia', event: 'Enseñanza en parábolas' }) },
  { slug: 'tema-milagros-jesus', title: 'Milagros de Jesús', level: 'Intermedio', description: 'Sanidades, autoridad sobre la naturaleza y resurrecciones.', questions: buildBookQuestions({ slug: 'tema-milagros-jesus', title: 'Milagros de Jesús', person: 'Jesús', place: 'Galilea y Judea', theme: 'Poder y compasión', event: 'Señales milagrosas de Cristo' }) },
  { slug: 'tema-sermon-monte', title: 'El Sermón del Monte', level: 'Experto', description: 'Bienaventuranzas y ética del Reino.', questions: buildBookQuestions({ slug: 'tema-sermon-monte', title: 'El Sermón del Monte', person: 'Jesús', place: 'Un monte en Galilea', theme: 'Vida del Reino', event: 'Pronunciamiento de las Bienaventuranzas' }) },
  { slug: 'tema-pasion-resurreccion', title: 'La Pasión y Resurrección', level: 'Experto', description: 'La última semana de Jesús y su victoria sobre la muerte.', questions: buildBookQuestions({ slug: 'tema-pasion-resurreccion', title: 'La Pasión y Resurrección', person: 'Jesús', place: 'Jerusalén', theme: 'Sacrificio y victoria', event: 'Crucifixión y resurrección' }) },
  { slug: 'tema-12-apostoles', title: 'Los 12 Apóstoles', level: 'Intermedio', description: 'Llamado, misión y legado de los discípulos cercanos.', questions: buildBookQuestions({ slug: 'tema-12-apostoles', title: 'Los 12 Apóstoles', person: 'Pedro', place: 'Galilea y Jerusalén', theme: 'Discipulado y misión', event: 'Envío apostólico' }) },
  { slug: 'tema-viajes-pablo', title: 'Los Viajes de Pablo', level: 'Experto', description: 'Expansión del evangelio por el mundo antiguo.', questions: buildBookQuestions({ slug: 'tema-viajes-pablo', title: 'Los Viajes de Pablo', person: 'Pablo', place: 'Antioquía y Roma', theme: 'Misión a los gentiles', event: 'Viajes misioneros' }) },
  { slug: 'tema-apocalipsis-general', title: 'El Apocalipsis', level: 'Sabio', description: 'Visiones de Juan sobre el fin y la nueva creación.', questions: buildBookQuestions({ slug: 'tema-apocalipsis-general', title: 'El Apocalipsis', person: 'Juan', place: 'Patmos', theme: 'Esperanza y victoria final', event: 'Cielo nuevo y tierra nueva' }) },
];

export const TRIVIA_TOPICS: TriviaTopic[] = [
  {
    slug: 'vida-de-jesus',
    title: 'Vida de Jesús',
    level: 'Principiante',
    description: 'Desde el pesebre en Belén hasta la ascensión gloriosa.',
    questions: [
      { id: 'vj-1', prompt: '¿En qué ciudad nació Jesús?', options: ['Nazaret', 'Belén', 'Jerusalén', 'Betania'], correctIndex: 1 },
      { id: 'vj-2', prompt: '¿Quién anunció a María el nacimiento de Jesús?', options: ['Elías', 'Gabriel', 'Moisés', 'Pedro'], correctIndex: 1 },
      { id: 'vj-3', prompt: '¿Quién bautizó a Jesús?', options: ['Juan el Bautista', 'Andrés', 'Felipe', 'Zacarías'], correctIndex: 0 },
      { id: 'vj-4', prompt: '¿Cuántos días ayunó Jesús en el desierto?', options: ['7', '21', '30', '40'], correctIndex: 3 },
      { id: 'vj-5', prompt: '¿Cuál fue el primer milagro público de Jesús?', options: ['Sanar un ciego', 'Multiplicar panes', 'Convertir agua en vino', 'Calmar la tormenta'], correctIndex: 2 },
      { id: 'vj-6', prompt: '¿En qué monte dio Jesús el Sermón del Monte?', options: ['Monte de los Olivos', 'Un monte en Galilea', 'Monte Carmelo', 'Monte Sinaí'], correctIndex: 1 },
      { id: 'vj-7', prompt: '¿Cuántos discípulos principales eligió Jesús?', options: ['10', '11', '12', '70'], correctIndex: 2 },
      { id: 'vj-8', prompt: '¿Quién negó a Jesús tres veces?', options: ['Juan', 'Pedro', 'Tomás', 'Mateo'], correctIndex: 1 },
      { id: 'vj-9', prompt: '¿En qué día resucitó Jesús según los evangelios?', options: ['Viernes', 'Sábado', 'Domingo', 'Lunes'], correctIndex: 2 },
      { id: 'vj-10', prompt: '¿Qué evento ocurrió después de la resurrección?', options: ['Ascensión', 'Éxodo', 'Pentecostés inmediato', 'Nacimiento de Juan'], correctIndex: 0 },
    ],
  },
  {
    slug: 'grandes-profetas',
    title: 'Grandes Profetas',
    level: 'Intermedio',
    description: 'Las visiones de Isaías, Ezequiel y las voces del desierto.',
    questions: [
      { id: 'gp-1', prompt: '¿Quién vio al Señor en el templo con serafines?', options: ['Jeremías', 'Isaías', 'Amós', 'Joel'], correctIndex: 1 },
      { id: 'gp-2', prompt: '¿Qué profeta habló del valle de huesos secos?', options: ['Ezequiel', 'Miqueas', 'Abdías', 'Nahúm'], correctIndex: 0 },
      { id: 'gp-3', prompt: '¿Qué profeta fue tragado por un gran pez?', options: ['Jonás', 'Oseas', 'Habacuc', 'Sofonías'], correctIndex: 0 },
      { id: 'gp-4', prompt: '¿Qué profeta confrontó a Baal en el monte Carmelo?', options: ['Elías', 'Eliseo', 'Daniel', 'Zacarías'], correctIndex: 0 },
      { id: 'gp-5', prompt: '¿Qué profeta lloró por Jerusalén?', options: ['Isaías', 'Jeremías', 'Ezequiel', 'Ageo'], correctIndex: 1 },
      { id: 'gp-6', prompt: '¿Quién interpretó sueños en Babilonia?', options: ['Daniel', 'Amós', 'Oseas', 'Malaquías'], correctIndex: 0 },
      { id: 'gp-7', prompt: '¿Qué profeta anunció el “siervo sufriente”?', options: ['Miqueas', 'Isaías', 'Joel', 'Nahúm'], correctIndex: 1 },
      { id: 'gp-8', prompt: '¿Quién continuó el ministerio de Elías?', options: ['Isaías', 'Eliseo', 'Abdías', 'Sofonías'], correctIndex: 1 },
      { id: 'gp-9', prompt: '¿Qué profeta anunció que el justo por la fe vivirá?', options: ['Habacuc', 'Amós', 'Joel', 'Ageo'], correctIndex: 0 },
      { id: 'gp-10', prompt: '¿Qué profeta habló de un nuevo pacto escrito en el corazón?', options: ['Jeremías', 'Isaías', 'Jonás', 'Oseas'], correctIndex: 0 },
    ],
  },
  {
    slug: 'historia-de-la-iglesia',
    title: 'Historia de la Iglesia',
    level: 'Experto',
    description: 'El camino de los apóstoles y el nacimiento de la fe global.',
    questions: [
      { id: 'hi-1', prompt: '¿En qué libro se narra el nacimiento de la iglesia primitiva?', options: ['Romanos', 'Hechos', 'Hebreos', 'Apocalipsis'], correctIndex: 1 },
      { id: 'hi-2', prompt: '¿Qué evento marcó el inicio público de la iglesia?', options: ['Transfiguración', 'Pentecostés', 'Ascensión', 'Concilio de Jerusalén'], correctIndex: 1 },
      { id: 'hi-3', prompt: '¿Quién predicó el primer sermón en Pentecostés?', options: ['Pablo', 'Pedro', 'Santiago', 'Juan'], correctIndex: 1 },
      { id: 'hi-4', prompt: '¿Quién fue el primer mártir cristiano?', options: ['Esteban', 'Timoteo', 'Bernabé', 'Silas'], correctIndex: 0 },
      { id: 'hi-5', prompt: '¿Quién fue conocido como “apóstol a los gentiles”?', options: ['Pedro', 'Pablo', 'Juan', 'Tomás'], correctIndex: 1 },
      { id: 'hi-6', prompt: '¿Qué ciudad fue central para los viajes misioneros de Pablo?', options: ['Antioquía', 'Jericó', 'Nazaret', 'Betlehem'], correctIndex: 0 },
      { id: 'hi-7', prompt: '¿Qué reunión trató el tema de los gentiles y la ley?', options: ['Concilio de Nicea', 'Concilio de Jerusalén', 'Concilio de Éfeso', 'Sínodo de Roma'], correctIndex: 1 },
      { id: 'hi-8', prompt: '¿En qué isla estuvo Juan cuando recibió Apocalipsis?', options: ['Creta', 'Patmos', 'Chipre', 'Malta'], correctIndex: 1 },
      { id: 'hi-9', prompt: '¿Quién acompañó a Pablo en varios viajes y cartas?', options: ['Lucas', 'Caifás', 'Herodes', 'Pilato'], correctIndex: 0 },
      { id: 'hi-10', prompt: '¿Qué práctica distinguía a la iglesia primitiva según Hechos 2?', options: ['Riqueza acumulada', 'Comunión y enseñanza apostólica', 'Aislamiento social', 'Ayuno obligatorio diario'], correctIndex: 1 },
    ],
  },
  {
    slug: 'parabolas-y-sabiduria',
    title: 'Parábolas y Sabiduría',
    level: 'Sabio',
    description: 'Descifra las enseñanzas ocultas en las historias más bellas.',
    questions: [
      { id: 'ps-1', prompt: '¿Qué parábola habla de un padre y dos hijos?', options: ['Buen samaritano', 'Hijo pródigo', 'Talentos', 'Sembrador'], correctIndex: 1 },
      { id: 'ps-2', prompt: '¿Quién ayudó al hombre herido en el camino?', options: ['Levita', 'Sacerdote', 'Samaritano', 'Fariseo'], correctIndex: 2 },
      { id: 'ps-3', prompt: '¿Qué representa la semilla en la parábola del sembrador?', options: ['El templo', 'La palabra', 'La tradición', 'La ley romana'], correctIndex: 1 },
      { id: 'ps-4', prompt: '¿Qué libro es conocido por su sabiduría práctica?', options: ['Proverbios', 'Éxodo', 'Josué', 'Números'], correctIndex: 0 },
      { id: 'ps-5', prompt: '¿Quién escribió muchos proverbios bíblicos?', options: ['David', 'Salomón', 'Isaías', 'Jeremías'], correctIndex: 1 },
      { id: 'ps-6', prompt: '¿Qué enseña la parábola de los talentos?', options: ['Enterrar dones', 'Administrar fielmente lo recibido', 'Evitar riesgos siempre', 'No compartir recursos'], correctIndex: 1 },
      { id: 'ps-7', prompt: '¿Qué libro reflexiona sobre el sentido de la vida y el tiempo?', options: ['Eclesiastés', 'Levítico', 'Jueces', 'Nehemías'], correctIndex: 0 },
      { id: 'ps-8', prompt: '¿Qué parábola enfatiza perdonar al prójimo?', options: ['Siervo sin misericordia', 'Red barredera', 'La viña', 'Las diez vírgenes'], correctIndex: 0 },
      { id: 'ps-9', prompt: '¿Cuál es el principio de la sabiduría según Proverbios?', options: ['La fama', 'El temor del Señor', 'La riqueza', 'La elocuencia'], correctIndex: 1 },
      { id: 'ps-10', prompt: '¿Qué destaca Santiago sobre la sabiduría de lo alto?', options: ['Es egoísta', 'Es pura y pacífica', 'Es inestable', 'Es solo intelectual'], correctIndex: 1 },
    ],
  },
  ...GENERAL_TRIVIA_TOPICS_20,
  ...EXTRA_TRIVIA_TOPICS,
  ...EXTRA_TRIVIA_TOPICS_30,
];

export function getTriviaTopicBySlug(slug: string): TriviaTopic | null {
  return TRIVIA_TOPICS.find(topic => topic.slug === slug) ?? null;
}
