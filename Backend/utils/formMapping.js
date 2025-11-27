// Server-side mapping of form sections/fields to human readable labels and option maps.

const formSections = [
  {
    key: 'generalData',
    title: 'Datos Generales',
    fields: [
      { name: 'community_name', label: 'Nombre de la comunidad' },
      { name: 'group', label: 'Grupo' },
      { name: 'date', label: 'Fecha' },
      { name: 'state', label: 'Estado' },
      { name: 'municipality', label: 'Municipio' },
      { name: 'locality', label: 'Localidad' },
      { name: 'type_of_settlement', label: 'Tipo de asentamiento' },
      { name: 'name_of_settlement', label: 'Nombre del asentamiento' },
      { name: 'type_of_road', label: 'Tipo de vialidad' },
      { name: 'street', label: 'Calle' },
      { name: 'external_number', label: 'No. Exterior' },
      { name: 'internal_number', label: 'No. Interior' },
      { name: 'postal_code', label: 'Código Postal' },
      { name: 'between_streets', label: 'Entre calles' },
      { name: 'description_of_location', label: 'Descripción del lugar' },
      { name: 'cell_phone', label: 'Teléfono celular' },
    ],
  },

  {
    key: 'familyMembers',
    title: 'Estructura Familiar',
    memberFields: [
      { name: 'first_name', label: 'Nombre' },
      { name: 'first_surname', label: 'Primer apellido' },
      { name: 'second_surname', label: 'Segundo apellido' },
      { name: 'gender', label: 'Género' },
      { name: 'dob', label: 'Fecha de nacimiento' },
      { name: 'entity_of_birth', label: 'Entidad de nacimiento' },
      { name: 'idCard', label: 'CURP / ID' },
      { name: 'civil_status', label: 'Estado civil' },
      { name: 'relationship_to_head', label: 'Parentesco' },

      { name: 'schooling', label: 'Escolaridad' },
      { name: 'grade_of_schooling', label: 'Grado de escolaridad' },
      { name: 'assists_school', label: 'Asiste a la escuela' },
      { name: 'occupation', label: 'Ocupación' },
      { name: 'type_of_employment', label: 'Tipo de empleo' },
      { name: 'labor_benefits', label: 'Prestaciones laborales' },
      { name: 'retired_or_pensioner', label: 'Jubilado / Pensionado' },
      { name: 'eligible_for_social_programs', label: 'Derecho-habiencia' },
      { name: 'reason_for_eligibility', label: 'Motivo de derecho-habiencia' },

      { name: 'has_disability', label: 'Capacidades diferentes' },
      { name: 'health_issues', label: 'Condiciones de salud' },
      { name: 'adictions', label: 'Adicciones' },
      { name: 'weight', label: 'Peso (kg)' },
      { name: 'size', label: 'Talla (cm)' },
      { name: 'BMI', label: 'Índice de Masa Corporal (IMC)' },
      { name: 'indigenous', label: 'Pueblo indígena' },
    ],
  },

  {
    key: 'LivingConditions',
    title: 'Vivienda y Equipamiento',
    fields: [
      { name: 'type_of_housing', label: 'Tipo de vivienda' },
      { name: 'type_of_floor', label: 'Mayor parte de piso' },
      { name: 'tenencia', label: 'Tenencia' },
      { name: 'type_of_roof', label: 'Mayor parte de techo' },
      { name: 'type_of_walls', label: 'Mayor parte de muros' },
      { name: 'number_of_rooms', label: 'Número de cuartos' },
      { name: 'number_of_bedrooms', label: 'Número de cuartos (dormir)' },
      { name: 'separate_kitchen', label: 'Cocina separada' },
      { name: 'exclusive_bathroom', label: 'Baño exclusivo' },
      { name: 'assets', label: 'Bienes y Electrodomésticos' },
    ],
  },

  {
    key: 'economicConditions',
    title: 'Condiciones Económicas',
    fields: [
      { name: 'other_support', label: 'Tipo de apoyo en especie (describa)' },
      { name: 'provider_of_support', label: 'Proveedor del apoyo' },
      { name: 'frequency_of_support', label: 'Frecuencia del apoyo en especie' },
      { name: 'has_remmittances', label: 'Recibe remesas' },
      { name: 'frequency', label: 'Frecuencia de remesas' },
      { name: 'curp', label: 'CURP' },
      { name: 'birth_certificate', label: 'Acta de nacimiento' },
      { name: 'id_card', label: 'Credencial (otro)' },
      { name: 'ine', label: 'INE' },
      // weekly income/expenses merged into same sheet below
    ],
  },

  {
    key: 'nutritionalStatus',
    title: 'Estado Nutricional',
    fields: [
      { name: 'question_1', label: 'Adulto: alimentación poca variedad' },
      { name: 'question_2', label: 'Adulto: dejó de desayunar/comer/cenar' },
      { name: 'question_3', label: 'Adulto: comió menos de lo debido' },
      { name: 'question_4', label: 'Adulto: se quedaron sin comida' },
      { name: 'question_5', label: 'Adulto: sintió hambre pero no comió' },
      { name: 'question_6', label: 'Adulto: sólo comió una vez al día o dejó de comer' },
      { name: 'question_7', label: 'Menor: alimentación poca variedad' },
      { name: 'question_8', label: 'Menor: comió menos de lo debido' },
      { name: 'question_9', label: 'Menor: disminuyeron porciones a menores' },
      { name: 'question_10', label: 'Menor: sintió hambre pero no comió' },
      { name: 'question_11', label: 'Menor: se durmió con hambre' },
      { name: 'question_12', label: 'Menor: comió una vez al día o dejó de comer' },
    ],
  },
];

// Per-field option label maps. Add entries for fields that use coded values in stored JSON.
// If an entry is missing, the exporter will fall back to a humanizer.
const optionMaps = {
  civil_status: {
    soltero: 'Soltero(a)',
    casado: 'Casado(a)',
    divorciado: 'Divorciado(a)',
    viudo: 'Viudo(a)',
    union_libre: 'Unión libre',
    madre_soltera: 'Madre soltera',
  },
  relationship_to_head: {
    titular: 'Titular',
    conyuge: 'Cónyuge',
    hijo: 'Hijo(a)',
    nieto: 'Nieto(a)',
    bisnieto: 'Bisnieto(a)',
    padre: 'Padre',
    madre: 'Madre',
    suegro: 'Suegro(a)',
    hermano: 'Hermano(a)',
    cunado: 'Cuñado(a)',
    yerno: 'Yerno',
    nuera: 'Nuera',
    tio: 'Tío(a)',
    primo: 'Primo',
    otro: 'Otro',
  },
  schooling: {
    'N/A': 'N/A',
    analfabeto: 'Analfabeto',
    preescolar: 'Preescolar',
    primaria: 'Primaria',
    secundaria: 'Secundaria',
    preparatoria: 'Preparatoria',
    tecnica_primaria: 'Carrera técnica (primaria completa)',
    tecnica_secundaria: 'Carrera técnica (secundaria completa)',
    tecnica_preparatoria: 'Carrera técnica (preparatoria completa)',
    licenciatura: 'Licenciatura',
  },
  occupation: {
    'N/A': 'N/A',
    albanil: 'Albañil',
    artesano: 'Artesano',
    ayudante_oficio: 'Ayudante en oficio',
    ayudante_negocio_familiar: 'Ayudante en negocio familiar sin retribución',
    ayudante_negocio_no_familiar: 'Ayudante en negocio no familiar sin retribución',
    chofer: 'Chofer',
    ejidatario: 'Ejidatario / Comunero',
    empleado_gobierno: 'Empleado del gobierno',
    empleado_privado: 'Empleado del sector privado',
    empleado_domestico: 'Empleado doméstico',
    jornalero: 'Jornalero agrícola',
    miembro_grupo_productores: 'Miembro de grupo de productores',
    miembro_cooperativa: 'Miembro de cooperativa',
    obrero: 'Obrero',
    patron_negocio: 'Patrón de negocio',
    profesionista_independiente: 'Profesionista independiente',
    promotor_desarrollo_humano: 'Promotor de desarrollo humano',
    trabajador_cuenta_propia: 'Trabajador por cuenta propia',
    vendedor_ambulante: 'Vendedor ambulante',
    otra_ocupacion: 'Otra ocupación',
    desempleado: 'Desempleado',
    ama_de_casa: 'Ama de casa',
    pescador: 'Pescador',
    estudiante: 'Estudiante',
  },
  type_of_settlement: {
    Aeropuerto: 'Aeropuerto',
    'Ampliación': 'Ampliación',
    Barrio: 'Barrio',
    Cantón: 'Cantón',
    Ciudad: 'Ciudad',
    Industrial: 'Industrial',
    '': 'Colonia',
    Condominio: 'Condominio',
    'Conjunto Hab.': 'Conjunto Habitacional',
    'Corredor Industrial': 'Corredor Industrial',
    Coto: 'Coto',
    Cuartel: 'Cuartel',
    Ejido: 'Ejido',
    'Ex Hacienda': 'Ex Hacienda',
    Fracción: 'Fracción',
    Granja: 'Granja',
    Hacienda: 'Hacienda',
    Ingenio: 'Ingenio',
    Manzana: 'Manzana',
    Paraje: 'Paraje',
  },
  type_of_road: {
    Ampliación: 'Ampliación',
    Andador: 'Andador',
    Avenida: 'Avenida',
    Boulevard: 'Boulevard',
    Calle: 'Calle',
    Callejón: 'Callejón',
    Calzada: 'Calzada',
    Cerrada: 'Cerrada',
    Circuito: 'Circuito',
    Circunvalación: 'Circunvalación',
    Continuación: 'Continuación',
    Corredor: 'Corredor',
    Diagonal: 'Diagonal',
    'Eje Vial': 'Eje Vial',
    Pasaje: 'Pasaje',
    Peatonal: 'Peatonal',
    Periférico: 'Periférico',
    Privada: 'Privada',
    Prolongación: 'Prolongación',
    Retorno: 'Retorno',
    Viaducto: 'Viaducto',
    Ninguno: 'Ninguno',
  },
  type_of_housing: {
    unifamiliar: 'Unifamiliar',
    duplex: 'Dúplex',
    compartida: 'Compartida',
    otra: 'Otra',
    independiente: 'Independiente',
    unidad_habitacional: 'Unidad habitacional',
    vecindad: 'Vecindad',
    anexo_a_casa: 'Anexo a casa',
    vivienda_movil: 'Vivienda móvil',
    refugio: 'Refugio',
  },
  type_of_floor: {
    madera_duela: 'Madera / Duela',
    mosaico_vinil: 'Mosaico / Vinil',
    cemento_firme: 'Cemento / Firme',
    tierra: 'Tierra',
    otros: 'Otros',
  },
  tenencia: {
    propia: 'Propia',
    rentada: 'Rentada',
    pagandose: 'Pagándose',
    prestada: 'Prestada',
    asentamiento_irregular: 'Asentamiento irregular',
    otro: 'Otro',
  },
  type_of_roof: {
    concreto_losa_viguetas: 'Concreto / Losa / Viguetas',
    lamina_carton: 'Lámina de cartón',
    lamina_asbesto: 'Lámina asbesto / metálica',
    madera_teja: 'Madera / Teja',
    paja_palma: 'Paja / Palma',
    otros: 'Otros',
  },
  type_of_walls: {
    madera: 'Madera',
    adobe: 'Adobe',
    ladrillo_tabique: 'Ladrillo / Tabique',
    lamina_metalica_asbesto: 'Lámina metálica / asbesto',
    desechos_carton: 'Desechos / Cartón',
    carrizo_bambu: 'Carrizo / Bambú',
    otros: 'Otros',
  },
  has_disability: {
    'N/A': 'N/A',
    sensoriales_comunicacion: 'Sensoriales y de Comunicación',
    motrices: 'Motrices',
    aprendizaje_comportamiento: 'Aprendizaje y Comportamiento',
    mas_de_1_discapacidad: 'Más de 1 discapacidad',
  },
  health_issues: {
    'N/A': 'N/A',
    infecciosas: 'Infecciosas',
    tumores: 'Tumores',
    sanguineas: 'De la sangre (anemias)',
    diabetes_tiroides_obesidad: 'Diabetes / Tiroides / Obesidad',
    desordenes_mentales: 'Desórdenes mentales',
    sistema_nervioso: 'Sistema nervioso',
    enfermedades_sentidos: 'Enfermedades de los sentidos',
    sistema_circulatorio: 'Sistema circulatorio',
    sistema_respiratorio: 'Sistema respiratorio',
    sistema_digestivo: 'Sistema digestivo',
    piel: 'De la piel',
    genitourinario: 'Genitourinario',
    malformaciones: 'Malformaciones',
    lesiones_heridas_intoxicaciones: 'Lesiones / heridas / intoxicaciones',
    sintomas_no_clasificados: 'Síntomas no clasificados',
  },
  adictions: {
    '': 'N/A',
    tabaquismo: 'Tabaquismo',
    alcoholismo: 'Alcoholismo',
    drogadiccion: 'Drogadicción',
  },
  indigenous: {
    'N/A': 'N/A',
    aketeko: 'Aketeko',
    amuzgo: 'Amuzgo',
    awaketeko: 'Awaketeko',
    apayapaneco: 'Apayapaneco',
    cora: 'Cora',
    cucapa: 'Cucapá',
    cuicateco: 'Cuicateco',
    chatino: 'Chatino',
    chichimeco: 'Chichimeco',
    chinanteco: 'Chinanteco',
    chochotelco: 'Chochotelco',
    chontal_oaxaca: 'Chontal (Oaxaca)',
    chontal_tabasco: 'Chontal (Tabasco)',
    chuj: 'Chuj',
    chol: 'Chʼol',
    guarijio: 'Guarijío',
    huasteco: 'Huasteco',
    huave: 'Huave',
    huichol: 'Huichol',
    ixcateco: 'Ixcateco',
    ixil: 'Ixil',
    jakalteco: 'Jakalteco',
    kaqchikel: 'Kaqchikel',
    kickapoo: 'Kickapoo',
    kiliwa: 'Kiliwa',
    kumiai: 'Kumiai',
    kuahl: 'Kuʼahl',
    kiche: 'Kʼicheʼ',
    lacandon: 'Lacandón',
    mam: 'Mam',
    matlatzinca: 'Matlatzinca',
    maya: 'Maya',
    mayo: 'Mayo',
    mazahua: 'Mazahua',
    mazateco: 'Mazateco',
    mixe: 'Mixe',
    mixteco: 'Mixteco',
    nahuatl: 'Náhuatl',
    oluteco: 'Oluteco',
    otomi: 'Otomí',
    paipai: 'Paipai',
    pame: 'Pame',
    papago: 'Pápago',
    pima: 'Pima',
    popoloca: 'Popoloca',
    popoluca: 'Popoluca',
    qatok: 'Qatoʼk',
    qanjobal: 'Qʼanjobʼal',
    qechi: 'Qʼeqchiʼ',
    saylteco: 'Sayilteco',
    seri: 'Seri',
    tarahumara: 'Tarahumara',
    tarasco: 'Tarasco',
    teko: 'Teko',
    tepehua: 'Tepehua',
    tepehuano_norte: 'Tepehuano Norte',
    tepehuano_sur: 'Tepehuano Sur',
    texistepequeno: 'Texistepequeño',
    tojolabal: 'Tojolabal',
    totonaco: 'Totonaco',
    triqui: 'Triqui',
    tlahuica: 'Tlahuica',
    tlapaneco: 'Tlapaneco',
    tseltal: 'Tseltal',
    tsotsil: 'Tsotsil',
    yaqui: 'Yaqui',
    zapoteco: 'Zapoteco',
    zoque: 'Zoque',
  },
  // Add more field maps as needed...
};

const assetsLabels = {
  refrigerator: 'Refrigerador',
  stove: 'Estufa',
  video_player: 'Video / DVD / Blu-Ray',
  washing_machine: 'Lavadora',
  blender: 'Licuadora',
  television: 'Televisión',
  radio_or_stereo: 'Radio / Bocina / Estéreo',
  living_room: 'Sala',
  dining_room: 'Comedor',
  car: 'Automóvil',
  bed: 'Cama',
  cellphone: 'Celular',
  motorcycle: 'Motocicleta',
  computer: 'Computadora',
  oven_or_microwave: 'Horno / Microondas',
  telephone: 'Teléfono',
};

// Generic helper: humanize keys as fallback
function humanizeKey(k) {
  if (!k) return '';
  return String(k)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

const nutritionQuestions = {
  question_1: '¿Alguna vez usted o algún adulto en su hogar tuvo una alimentación basada en poca variedad de alimentos?',
  question_2: '¿Alguna vez usted o algún adulto en su hogar dejó de desayunar, comer o cenar?',
  question_3: '¿Alguna vez usted o algún adulto en su hogar comió menos de lo que piensa que debía comer?',
  question_4: '¿Alguna vez se quedaron sin comida?',
  question_5: '¿Alguna vez usted o algún adulto en su hogar sintió hambre, pero no comió?',
  question_6: '¿Alguna vez usted o algún adulto en su hogar sólo comió una vez al día o dejó de comer durante un día?',
  question_7: '¿Alguna vez algún menor de 18 años en su hogar tuvo una alimentación basada en poca variedad de alimentos?',
  question_8: '¿Alguna vez algún menor de 18 años en su hogar comió menos de lo que debía?',
  question_9: '¿Alguna vez en su hogar tuvieron que disminuir la cantidad servida a algún menor de 18 años?',
  question_10: '¿Alguna vez algún menor de 18 años en su hogar sintió hambre, pero no comió?',
  question_11: '¿Algún menor de 18 se durmió con hambre?',
  question_12: '¿Alguna vez algún menor de 18 años comió una vez al día o dejó de comer durante todo un día?',
};


const economicIncomeLabels = {
  father_income: 'Ingreso semanal — padre',
  mother_income: 'Ingreso semanal — madre',
  offspring_income: 'Ingreso semanal — hijos',
  PROSPERA_program: 'Ingreso semanal — PROSPERA',
  scholarships: 'Ingreso semanal — Becas',
  other: 'Ingreso semanal — Otros',
  pension: 'Ingreso semanal — Pensión',
  weekly_total: 'Total ingresos — semanal',
  monthly_total: 'Total ingresos — mensual',
};

const economicExpenseLabels = {
  housing: 'Vivienda',
  food: 'Alimentación',
  other: 'Otros',
  water: 'Agua',
  medical: 'Salud / Medicinas',
  education: 'Educación',
  cell_phone: 'Teléfono celular (recarga)',
  electricity: 'Electricidad',
  phone_internet: 'Teléfono / Internet',
  transportation: 'Transporte',
  weekly_total: 'Total gastos — semanal',
  monthly_total: 'Total gastos — mensual',
};


// value map helpers
const valueMaps = {
  gender: { M: 'Masculino', F: 'Femenino', '': '' },
  // normalized boolean: accept true/false, 'true'/'false', 'yes'/'no', 'si'/'no' (any case / trimmed)
  boolean: (v) => {
    if (v === true) return 'Sí';
    if (v === false) return 'No';
    const s = (v === null || v === undefined) ? '' : String(v).toLowerCase().trim();
    if (s === 'true' || s === 'yes' || s === 'si' || s === 'sí') return 'Sí';
    if (s === 'false' || s === 'no') return 'No';
    return String(v || '');
  },
  frequency: {
    diario: 'Diario',
    semanal: 'Semanal',
    mensual: 'Mensual',
    ocasional: 'Ocasional',
    na: 'N/A',
  },
};

// main mapping function used by exporter
function mapValue(fieldName, value) {
  if (value === null || value === undefined) return '';

  // arrays: map each element
  if (Array.isArray(value)) {
    return value.map(v => mapValue(fieldName, v)).join(', ');
  }

  // use explicit option map if present
  const opts = optionMaps[fieldName];
  if (opts) {
    // allow stored boolean-like or string keys
    const key = String(value);
    if (opts.hasOwnProperty(key)) return opts[key];
    // try lower-case key
    const lower = key.toLowerCase();
    for (const k of Object.keys(opts)) {
      if (String(k).toLowerCase() === lower) return opts[k];
    }
  }

  // booleans
  if (typeof value === 'boolean') return valueMaps.boolean(value);

  // some specific field name handlers
  if (fieldName === 'gender') return valueMaps.gender[value] ?? humanizeKey(value);
  if (['has_remmittances', 'curp', 'birth_certificate', 'id_card', 'ine', 'assists_school', 'retired_or_pensioner'].includes(fieldName)) {
    return valueMaps.boolean(value);
  }
  if (['frequency_of_support', 'frequency'].includes(fieldName)) {
    return valueMaps.frequency[value] ?? humanizeKey(value);
  }

  // fallback: if it's a number, return as-is; otherwise humanize string keys
  if (typeof value === 'number') return String(value);
  return humanizeKey(String(value));
}

module.exports = { formSections, mapValue, optionMaps, assetsLabels, nutritionQuestions, economicIncomeLabels, economicExpenseLabels };