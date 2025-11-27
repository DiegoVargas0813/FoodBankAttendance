// Define the structure of the form schema
// Here we can alter the form sections and fields as needed, instead of hardcoding them in components

// Asset list field type for appliances and equipment
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'asset_list' | 'title';

export interface FormField {
    name: string;
    label: string;
    type: FieldType;
    // The properties of the otions go as follows:
    // label: What the user sees
    // value: The actual value that gets stored in the database
    // Group and exclusive are primarily used for checkboxes
        // group: Optional, if you want certain options to be mutually exclusive within a group. Eg: Having a contract or not having a contract
        // exclusive: Optional: If true, selecting this option will deselect all other options. Eg: Selecting "None" for services
    options?: { label: string; value: string; group?: string; exclusive?: boolean }[];
    required?: boolean;
}

// Base structure for each form section
export interface FormSection {
    key: string;
    title: string;
    fields: FormField[];
}

export interface LivingConditions {
    assets?: Record<string, { has: boolean; functional: boolean;}>;
}
//#region Family Member Subsections Fields

export const familyMemberGeneralFields: FormField[] = [
    { name: 'first_name', label: 'Nombre(s)', type: 'text', required: true },
    { name: 'first_surname', label: 'Primer apellido', type: 'text', required: true },
    { name: 'second_surname', label: 'Segundo apellido', type: 'text' },
    { name: 'gender', label: 'Género', type: 'select', required: true, options: [
        { label: 'Masculino', value: 'M' },
        { label: 'Femenino', value: 'F' }
    ]},
    { name: 'dob', label: 'Fecha de nacimiento', type: 'date', required: true },
    { name: 'entity_of_birth', label: 'Entidad de nacimiento', type: 'text' },
    { name: 'idCard', label: 'CURP', type: 'text' },
    { 
        name: 'civil_status', 
        label: 'Estado civil', 
        type: 'select', 
        options: [
            {label:'Soltero (a)', value:'soltero'},
            {label:'Casado (a)', value:'casado'},
            {label:'Divorciado (a)', value:'divorciado'},
            {label:'Viudo (a)', value:'viudo'},
            {label:'Unión Libre', value:'union_libre'},
            {label:'Madre Soltera', value:'madre_soltera'},
        ]
    },
    { 
        name: 'relationship_to_head', 
        label: 'Parentesco',
        type: 'select',
        options: [
            {label:'Titular', value:'titular'},
            {label:'Cónyuge', value:'conyuge'},
            {label:'Hijo (a)', value:'hijo'},
            {label:'Nieto (a)', value:'nieto'},
            {label:'Bisnieto (a)', value:'bisnieto'},
            {label:'Padre', value:'padre'},
            {label:'Madre', value:'madre'},
            {label:'Suegro (a)', value:'suegro'},
            {label:'Hermano (a)', value:'hermano'},
            {label:'Cuñado (a)', value:'cunado'},
            {label:'Yerno', value:'yerno'},
            {label:'Nuera', value:'nuera'},
            {label:'Tío (a)', value:'tio'},
            {label:'Primo', value:'primo'},
            {label:'Otro', value:'otro'},
        ]
     },
];

// Employment and/or Education Fields
export const familyMemberEmploymentEducationFields: FormField[] = [
    { name: 'schooling', label: 'Escolaridad', type: 'select', required: false, options: [
        { label: 'N/A', value: 'N/A' },
        { label: 'Analfabeto', value: 'analfabeto'},
        { label: 'Preescolar', value: 'preescolar'},
        { label: 'Primaria', value: 'primaria' },
        { label: 'Secundaria', value: 'secundaria' },
        { label: 'Preparatoria', value: 'preparatoria' },
        { label: 'Carrera técnica con primaria completa', value: 'tecnica_primaria'},
        { label: 'Carrera técnica con secundaria completa', value: 'tecnica_secundaria'},
        { label: 'Carrera técnica con preparatoria completa', value: 'tecnica_preparatoria'},
        { label: 'Licenciatura', value: 'licenciatura'},
    ]},
    { name: 'grade_of_schooling', label: 'Grado', type: 'text', required: false },
    { name: 'assists_school', label: 'Asiste a la escuela', type: 'select', options: [
        { label: 'Sí', value: 'si'},
        { label: 'No', value: 'no'},
    ]},
    { name: 'occupation', label: 'Ocupación', type: 'select', required: false, options:[
        { label: 'N/A', value: 'N/A'},
        { label: 'Albañil', value: 'albanil'},
        { label: 'Artesano', value: 'artesano'},
        { label: 'Ayudante en algún oficio', value: 'ayudante_oficio'},
        { label: 'Ayudante en negocio familiar sin retribución', value: 'ayudante_negocio_familiar'},
        { label: 'Ayudante en negocio no familiar sin retribución', value: 'ayudante_negocio_no_familiar'},
        { label: 'Chofer', value: 'chofer'},
        { label: 'Ejidatario o Comunero', value: 'ejidatario'},
        { label: 'Empleado del gobierno', value: 'empleado_gobierno'},
        { label: 'Empleado del sector privado', value: 'empleado_privado'},
        { label: 'Empleado doméstico', value: 'empleado_domestico'},
        { label: 'Jornalero agrícola', value: 'jornalero'},
        { label: 'Miembro de un grupo de productores', value: 'miembro_grupo_productores'},
        { label: 'Miembros de una cooperativa', value: 'miembro_cooperativa'},
        { label: 'Obrero', value: 'obrero'},
        { label: 'Patrón de negocio', value: 'patron_negocio'},
        { label: 'Profesionista independiente', value: 'profesionista_independiente'},
        { label: 'Promotor de desarrollo humano', value: 'promotor_desarrollo_humano'},
        { label: 'Trabajador por cuenta propia', value: 'trabajador_cuenta_propia'},
        { label: 'Vendedor ambulante', value: 'vendedor_ambulante'},
        { label: 'Otra ocupación', value: 'otra_ocupacion'},
        { label: 'Desempleado', value: 'desempleado'},
        { label: 'Ama de Casa', value: 'ama_de_casa'},
        { label: 'Pescador', value: 'pescador'},
        { label: 'Estudiante', value: 'estudiante'},
    ]},
    {name: 'type_of_employment', label: 'Tipo de empleo', type: 'select', required: false, options: [
        {label: 'N/A', value: 'N/A'},
        {label: 'Asalariado', value: 'asalariado'},
        {label: 'Propio con sueldo asignado', value: 'propio_con_sueldo_asignado'},
        {label: 'Propio sin sueldo asignado', value: 'propio_sin_sueldo_asignado'},
    ]},
    {name: 'labor_benefits', label: 'Prestaciones laborales', type: 'checkbox', required: false, options: [
        { label: 'Incapacidad (enfermedad, accidente, maternidad)', value: 'incapacidad'},
        { label: 'SAR o AFORE', value: 'sar_afore'},
        { label: 'Crédito para vivienda', value: 'credito_vivienda'},
        { label: 'Guardería', value: 'guarderia'},
        { label: 'Aguinaldo', value: 'aguinaldo'},
        { label: 'Seguro de vida', value: 'seguro_vida'},
        { label: 'No tiene derecho a ninguna prestación', value: 'no_tiene_derecho', exclusive: true},
        { label: 'Otro tipo de seguro contratado', value: 'otro_tipo__de_seguro'},
        { label: 'N/A', value: 'N/A', exclusive: true },
    ]},
    {name: 'retired_or_pensioner', label: 'Jubilado o pensionado', type: 'select', required: false, options: [
        { label: 'Sí', value: 'si'},
        { label: 'No', value: 'no'},
    ]},
    {name: 'eligible_for_social_programs', label: 'Derecho-habiencia', type: 'select', options: [
        { label: 'Seguro Popular', value: 'seguro_popular'},
        { label: 'IMSS', value: 'imss'},
        { label: 'ISSSTE', value: 'issste'},
        { label: 'PEMEX, Defensa o Marina', value: 'pemex_defensa_marina'},
        { label: 'Clinica u Hospital Privado', value: 'clinica_hospital_privado'},
        { label: 'A ninguna', value: 'ninguna'},
    ]},
];


export const familyMemberHealthFields: FormField[] = [
    { name: 'has_disability', label: 'Capacidades diferentes', type:'select', options: [
        { label: 'N/A', value: 'N/A'},
        { label: 'Sensoriales y de Comunicación', value: 'sensoriales_comunicacion'},
        { label: 'Motrices', value: 'motrices'},
        { label: 'Aprendizaje y Comportamiento', value: 'aprendizaje_comportamiento'},
        { label: 'Mas de 1 discapacidad', value: 'mas_de_1_discapacidad'},
    ] },
    { name: 'health_issues', label: 'Condiciones de salud', type:'select', options: [
        { label: 'N/A', value: 'N/A'},
        { label: 'Infeccionsas (Hepatitis, ETS, virus)', value: 'infecciosas'},
        { label: 'Tumores (malignos y no malignos)', value: 'tumores'},
        { label: 'De la sangre (anemias)', value: 'sanguineas'},
        { label: 'Diabetes, tiroides, obesidad', value: 'diabetes_tiroides_obesidad'},
        { label: 'Desordenes mentales (esquizofrenia)', value: 'desordenes_mentales'},
        { label: 'Sistema nervioso (neuropatías)', value: 'sistema_nervioso'},
        { label: 'Enfermedades de los sentidos', value: 'enfermedades_sentidos'},
        { label: 'Sistema circulatorio (hipertensión)', value: 'sistema_circulatorio'},
        { label: 'Sistema respiratorio (neumonía)', value: 'sistema_respiratorio'},
        { label: 'Sistema digestivo (colitis, hernias)', value: 'sistema_digestivo'},
        { label: 'De la piel (dermatitis)', value: 'piel'},
        { label: 'Genitourinario (insuficiencia renal)', value: 'genitourinario'},
        { label: 'Malformaciones', value: 'malformaciones'},
        { label: 'Lesiones, heridas, intoxicaciones', value: 'lesiones_heridas_intoxicaciones'},
        { label: 'Síntomas no clasificados', value: 'sintomas_no_clasificados'},
    ]},       
    { name: 'adictions', label: 'Adicciones', type:'select', options: [
        { label: 'N/A', value: ''},
        { label: 'Tabaquismo', value: 'tabaquismo'},
        { label: 'Alcoholismo', value: 'alcoholismo'},
        { label: 'Drogadicción', value: 'drogadiccion'},
    ]},
    { name: 'weight', label: 'Peso (kg)', type: 'number' },
    { name: 'size', label: 'Talla', type: 'number' },
    { name: 'BMI', label: 'Índice de Masa Corporal (IMC)', type: 'number' },
    { name: 'indigenous', label: 'Pueblo Indígena', type: 'select', options: [
        { label: 'N/A', value: 'N/A'},
        { label: 'Aketeko', value: 'aketeko'},
        { label: 'Amuzgo', value: 'amuzgo'},
        { label: 'Awaketeko', value: 'awaketeko'},
        { label: 'Apayapaneco', value: 'apayapaneco'},
        { label: 'Cora', value: 'cora'},
        { label: 'Cucapá', value: 'cucapa'},
        { label: 'Cuicateco', value: 'cuicateco'},
        { label: 'Chatino', value: 'chatino'},
        { label: 'Chichimeco', value: 'chichimeco'},
        { label: 'Chinanteco', value: 'chinanteco'},
        { label: 'Chochotelco', value: 'chochotelco'},
        { label: 'Chontal Oaxaca', value: 'chontal_oaxaca'},
        { label: 'Chontal Tabasco', value: 'chontal_tabasco'},
        { label: 'Chuj', value: 'chuj'},
        { label: 'Ch´ol', value: 'chol'}, 
        { label: 'Guarijío', value: 'guarijio'},
        { label: 'Huasteco', value: 'huasteco'},
        { label: 'Huave', value: 'huave'},
        { label: 'Huichol', value: 'huichol'},
        { label: 'Ixcateco', value: 'ixcateco'},
        { label: 'Ixil', value: 'ixil'},
        { label: 'Jakalteco', value: 'jakalteco'},
        { label: 'Kaqchikel', value: 'kaqchikel'},
        { label: 'Kickapoo', value: 'kickapoo'},
        { label: 'Kiliwa', value: 'kiliwa'},
        { label: 'Kumiai', value: 'kumiai'},
        { label: 'Ku´ahl', value: 'kuahl'},
        { label: 'K´iche´', value: 'kiche'},
        { label: 'Lacandon', value: 'lacandon'},
        { label: 'Mam', value: 'mam'},
        { label: 'Matlatzinca', value: 'matlatzinca'},
        { label: 'Maya', value: 'maya'},
        { label: 'Mayo', value: 'mayo'},
        { label: 'Mazahua', value: 'mazahua'},
        { label: 'Mazateco', value: 'mazateco'},
        { label: 'Mixe', value: 'mixe'},
        { label: 'Mixteco', value: 'mixteco'},
        { label: 'Náhuatl', value: 'nahuatl'},
        { label: 'Oluteco', value: 'oluteco'},
        { label: 'Otomí', value: 'otomi'},
        { label: 'Paipai', value: 'paipai'},
        { label: 'Pame', value: 'pame'},
        { label: 'Pápago', value: 'papago'},
        { label: 'Pima', value: 'pima'},
        { label: 'Popoloca', value: 'popoloca'},
        { label: 'Popoluca', value: 'popoluca'},
        { label: 'Qato´k', value: 'qatok'},
        { label: 'Qánjobál', value: 'qanjobal'},
        { label: 'Qéchi´', value: 'qechi'},
        { label: 'Saylteco', value: 'saylteco'},
        { label: 'Seri', value: 'seri'},
        { label: 'Tarahumara', value: 'tarahumara'},
        { label: 'Tarasco', value: 'tarasco'},
        { label: 'Teko', value: 'teko'},
        { label: 'Tepehua', value: 'tepehua'},
        { label: 'Tepehuano Norte', value: 'tepehuano_norte'},
        { label: 'Tepehuano Sur', value: 'tepehuano_sur'},
        { label: 'Texistepequeño', value: 'texistepequeno'},
        { label: 'Tojolabal', value: 'tojolabal'},
        { label: 'Totonaco', value: 'totonaco'},
        { label: 'Triqui', value: 'triqui'},
        { label: 'Tlahuica', value: 'tlahuica'},
        { label: 'Tlapaneco', value: 'tlapaneco'},
        { label: 'Tseltal', value: 'tseltal'},
        { label: 'Tsotsil', value: 'tsotsil'},
        { label: 'Yaqui', value: 'yaqui'},
        { label: 'Zapoteco', value: 'zapoteco'},
        { label: 'Zoque', value: 'zoque'},
    ]},

];

//#endregion

export const economicWeeklyIncomeFields: FormField[] = [
    { name: 'father_income', label: 'Ingreso semanal — padre', type: 'number' },
    { name: 'mother_income', label: 'Ingreso semanal — madre', type: 'number' },
    { name: 'offspring_income', label: 'Ingreso semanal — hijos', type: 'number' },
    { name: 'PROSPERA_program', label: 'Ingreso semanal — PROSPERA', type: 'number' },
    { name: 'scholarships', label: 'Ingreso semanal — Becas', type: 'number' },
    { name: 'other', label: 'Ingreso semanal — Otros', type: 'number' },
    { name: 'pension', label: 'Ingreso semanal — Pensión', type: 'number' },
];

export const economicWeeklyExpensesFields: FormField[] = [
    { name: 'housing', label: 'Gasto semanal — Vivienda (renta, mantenimiento)', type: 'number' },
    { name: 'food', label: 'Gasto semanal — Alimentación', type: 'number' },
    { name: 'electricity', label: 'Gasto semanal — Electricidad', type: 'number' },
    { name: 'gas', label: 'Gasto semanal — Gas', type: 'number' },
    { name: 'water', label: 'Gasto semanal — Agua', type: 'number' },
    { name: 'phone_internet', label: 'Gasto semanal — Teléfono / Internet', type: 'number' },
    { name: 'transportation', label: 'Gasto semanal — Transporte', type: 'number' },
    { name: 'medical', label: 'Gasto semanal — Salud / Medicinas', type: 'number' },
    { name: 'other', label: 'Gasto semanal — Otros', type: 'number' },
    { name: 'cell_phone', label: 'Gasto semanal — Teléfono celular (recarga)', type: 'number' },
    { name: 'education', label: 'Gasto semanal — Educación', type: 'number' },
];

export const nutritionalAdultQuestions: FormField[] = [
  { name: 'question_1', label: 'Alguna vez un adulto tuvo alimentación basada en poca variedad de alimentos?', type: 'select', options: [{label:'Sí',value:'yes'},{label:'No',value:'no'}] },
  { name: 'question_2', label: 'Alguna vez un adulto dejó de desayunar, comer o cenar?', type: 'select', options: [{label:'Sí',value:'yes'},{label:'No',value:'no'}] },
  { name: 'question_3', label: 'Alguna vez un adulto comió menos de lo que piensa que debía comer?', type: 'select', options: [{label:'Sí',value:'yes'},{label:'No',value:'no'}] },
  { name: 'question_4', label: 'Alguna vez se quedaron sin comida?', type: 'select', options: [{label:'Sí',value:'yes'},{label:'No',value:'no'}] },
  { name: 'question_5', label: 'Alguna vez un adulto sintió hambre, pero no comió?', type: 'select', options: [{label:'Sí',value:'yes'},{label:'No',value:'no'}] },
  { name: 'question_6', label: 'Alguna vez un adulto sólo comió una vez al día o dejó de comer durante un día?', type: 'select', options: [{label:'Sí',value:'yes'},{label:'No',value:'no'}] },
];

export const nutritionalChildQuestions: FormField[] = [
  { name: 'question_7', label: 'Alguna vez un menor de 18 tuvo alimentación basada en poca variedad?', type: 'select', options: [{label:'Sí',value:'yes'},{label:'No',value:'no'}] },
  { name: 'question_8', label: 'Alguna vez un menor comió menos de lo que debía?', type: 'select', options: [{label:'Sí',value:'yes'},{label:'No',value:'no'}] },
  { name: 'question_9', label: 'Alguna vez tuvieron que disminuir la cantidad servida a un menor?', type: 'select', options: [{label:'Sí',value:'yes'},{label:'No',value:'no'}] },
  { name: 'question_10', label: 'Alguna vez un menor sintió hambre, pero no comió?', type: 'select', options: [{label:'Sí',value:'yes'},{label:'No',value:'no'}] },
  { name: 'question_11', label: 'Algún menor se durmió con hambre?', type: 'select', options: [{label:'Sí',value:'yes'},{label:'No',value:'no'}] },
  { name: 'question_12', label: 'Alguna vez un menor comió una vez al día o dejó de comer todo un día?', type: 'select', options: [{label:'Sí',value:'yes'},{label:'No',value:'no'}] },
];


export const formSchema: FormSection[] = [
    // General data section
    {
        key: 'generalData',
        title: 'Datos Generales',
        fields: [
            { name: 'community_name', label: 'Nombre de la comunidad', type: 'text', required: true },
            { name: 'group', label: 'Grupo', type: 'text', required: true },
            { name: 'date', label: 'Fecha', type: 'date', required: true },  
            { name: 'state', label: 'Estado', type: 'text', required: true },
            { name: 'municipality', label: 'Municipio', type: 'text', required: true },
            { name: 'locality', label: 'Localidad', type: 'text', required: true },
            {
                name: 'type_of_settlement', 
                label: 'Tipo de asentamiento',
                required: true, 
                type: 'select', options: [
                    { label: 'Aeropuerto', value: 'Aeropuerto' },
                    { label: 'Ampliación', value: 'Ampliación' },
                    { label: 'Barrio', value: 'Barrio' },
                    { label: 'Cantón', value: 'Cantón' },
                    { label: 'Ciudad', value: 'Ciudad' },
                    { label: 'Industrial', value: 'Industrial' },
                    { label: 'Colonia', value: '' },
                    { label: 'Condominio', value: 'Condominio' },
                    { label: 'Conjunto Hab.', value: 'Conjunto Hab.' },
                    { label: 'Corredor Industrial', value: 'Corredor Industrial' },
                    { label: 'Coto', value: 'Coto' },
                    { label: 'Cuartel', value: 'Cuartel' },
                    { label: 'Ejido', value: 'Ejido' },
                    { label: 'Ex Hacienda', value: 'Ex Hacienda' },
                    { label: 'Fracción', value: 'Fracción' },
                    { label: 'Granja', value: 'Granja' },
                    { label: 'Hacienda', value: 'Hacienda' },
                    { label: 'Ingenio', value: 'Ingenio' },
                    { label: 'Manzana', value: 'Manzana' },
                    { label: 'Paraje', value: 'Paraje' },
                ]
            },
            { name: 'name_of_settlement', label: 'Nombre del asentamiento', type: 'text', required: true },
            { 
                name: 'type_of_road',
                label: 'Tipo de vialidad',
                type: 'select',
                options: [
                    { label: 'Ampliación', value: 'Ampliación' },
                    { label: 'Andador', value: 'Andador' },
                    { label: 'Avenida', value: 'Avenida' },
                    { label: 'Boulevard', value: 'Boulevard' },
                    { label: 'Calle', value: 'Calle' },
                    { label: 'Callejón', value: 'Callejón' },
                    { label: 'Calzada', value: 'Calzada' },
                    { label: 'Cerrada', value: 'Cerrada' },
                    { label: 'Circuito', value: 'Circuito' },
                    { label: 'Circunvalación', value: 'Circunvalación' },
                    { label: 'Continuación', value: 'Continuación' },
                    { label: 'Corredor', value: 'Corredor' },
                    { label: 'Diagonal', value: 'Diagonal' },
                    { label: 'Eje Vial', value: 'Eje Vial' },
                    { label: 'Pasaje', value: 'Pasaje' },
                    { label: 'Peatonal', value: 'Peatonal' },
                    { label: 'Periférico', value: 'Periférico' },
                    { label: 'Privada', value: 'Privada' },
                    { label: 'Prolongación', value: 'Prolongación' },
                    { label: 'Retorno', value: 'Retorno' },
                    { label: 'Viaducto', value: 'Viaducto' },
                    { label: 'Ninguno', value: 'Ninguno' },
                ],
            },
            { name: 'street', label: 'Calle', type: 'text', required: true },
            { name: 'external_number', label: 'No. Exterior', type: 'text', required: true },
            { name: 'internal_number', label: 'No. Interior', type: 'text' },
            { name: 'postal_code', label: 'Código Postal', type: 'text', required: true },
            { name: 'between_streets', label: 'Entre calles', type: 'text' },
            { name: 'description_of_location', label: 'Descripción del lugar', type: 'text' },
            { name: 'cell_phone', label: 'Teléfono celular', type: 'text', required: true  },
        ],
    },
    //Services section with checkboxes
    {
        key: 'services',
        title: 'Servicios',
        fields: [
            {
                name: 'electricity',
                label: 'Electricidad',
                type: 'checkbox',
                options: [
                    { label: 'Con Contrato', value: 'con_contrato', group: 'contract' },
                    { label: 'Sin contrato', value: 'sin_contrato', group: 'contract' },
                    { label: 'Sin servicio', value: 'sin_servicio', group: 'contract' },
                    { label: 'Otro', value: 'otro' },
                    // You may or may not have a contract but other types of electricity sources.
                    { label: 'Servicio público', value: 'servicio_publico' },
                    { label: 'Planta particular', value: 'planta_particular' },
                    { label: 'Panel solar', value: 'panel_solar' },
                    // Picking having none of these options means you don't have electricity at all, overrides all other options
                    { label: 'Ninguno', value: 'none', exclusive: true },
                ]
            },
            {
                name: 'sanitary',
                label: 'Sanitario',
                type: 'checkbox',
                options: [
                    {label: 'Drenaje', value: 'drenaje'},
                    {label: 'Fosa Séptica', value: 'fosa_septica'},
                    {label: 'Letrina', value: 'letrina'},
                    {label: 'Ras de suelo', value: 'ras_de_suelo'},
                    {label: 'Otros', value: 'otros'},
                    {label: 'Red pública', value: 'red_publica'},
                    {label: 'Tubería que da a grieta o barranca', value: 'tuberia_grieta_barranca'},
                    {label: 'Tubería que da a un río, lago o mar', value: 'tuberia_rio_lago_mar'},
                    {label: 'No tiene drenaje', value: 'none', exclusive: true},
                ]
            },
            {
                name: 'bathroom',
                label: 'Baño o excusado',
                type: 'checkbox',
                options: [
                    {label:'Descarga directa', value:'descarga_directa'},
                    {label:'Agua con cubeta', value:'agua_con_cubeta'},
                    {label:'Letrina seca', value:'letrina_seca'},
                    {label:'Pozo u hoyo', value:'pozo_hoyo'},
                    {label:'No tiene baño', value:'none', exclusive: true},
                ]
            },
            {
                name: 'fuel',
                label: 'Combustible',
                type: 'checkbox',
                options: [
                    {label: 'Gas', value: 'gas'},
                    {label: 'Leña o carbón', value: 'lena_carbon'},
                    {label: 'Parrilla eléctrica', value: 'parrilla_electrica'},
                    {label: 'Otros', value: 'otros'},
                    {label: 'Gas Tanque', value: 'gas_tanque'},
                    {label: 'Electricidad', value: 'electricidad'},
                    {label: 'Gas natural', value: 'gas_natural'},
                    {label: 'Leña o carbón sin chimenea', value: 'lena_carbon_sin_chimenea'},
                    {label: 'Leña o carbón con chimenea', value: 'lena_carbon_con_chimenea'},
                    {label: 'Otro combustible', value: 'otro_combustible'},
                ]
            },
            {
                name: 'water',
                label: 'Agua',
                type: 'checkbox',
                options: [
                    {label: 'Toma domiciliaria', value: 'toma_domiciliaria'},
                    {label: 'Toma común', value: 'toma_comun'},
                    {label: 'Pipa', value: 'pipa'},
                    {label: 'Pozo, río o lago', value: 'pozo_rio_lago'},
                    {label: 'Sin servicio', value: 'none', exclusive: true},
                    {label: 'Otro', value: 'otro'},
                    {label: 'Llave pública', value: 'llave_publica'},
                    {label: 'Acarrea de otro vivienda', value: 'acarrea_de_otra_vivienda'},
                ]
            }
        ],
    },
    {
        key: 'familyMembers',
        title: 'Estructura Familiar',
        fields: [], // Handled separately in the component
    },
    {
        key: 'LivingConditions',
        title: 'Vivienda y Equipamiento',
        fields:[
            { name: 'type_of_housing', label: 'Tipo de casa', type: 'select', options: [
                { label: 'Unifamiliar', value: 'unifamiliar' },
                { label: 'Dúplex', value: 'duplex' },
                { label: 'Compartida', value: 'compartida' },
                { label: 'Otra', value: 'otra' },
                { label: 'Independiente', value: 'independiente' },
                { label: 'U. Habitacional', value: 'unidad_habitacional' },
                { label: 'Vecindad', value: 'vecindad' },
                { label: 'Anexo a casa', value: 'anexo_a_casa' },
                { label: 'Vivienda móvil', value: 'vivienda_movil' },
                { label: 'Refugio', value: 'refugio' },
            ]},
            { name: 'type_of_floor', label: 'Mayor parte de piso', type: 'select', options: [
                { label: 'Madera, Duela', value: 'madera_duela' },
                { label: 'Mosaico, Vinil', value: 'mosaico_vinil' },
                { label: 'Cemento o firme', value: 'cemento_firme' },
                { label: 'Tierra', value: 'tierra' },
                { label: 'Otros', value: 'otros' },
            ]},
            { name: 'tenencia', label: 'Tenencia', type: 'select', options: [
                { label: 'Propia', value: 'propia' },
                { label: 'Rentada', value: 'rentada' },
                { label: 'Pagándose', value: 'pagandose' },
                { label: 'Prestada', value: 'prestada' },
                { label: 'Asentamiento Irregular', value: 'asentamiento_irregular' },
                { label: 'Otro', value: 'otro' },
            ]},
            { name: 'type_of_roof', label: 'Mayor parte de techo', type: 'select', options: [
                { label: 'Concreto, losa o viguetas', value: 'concreto_losa_viguetas' },
                { label: 'Lámina de cartón', value: 'lamina_carton' },
                { label: 'Otros', value: 'otros' },
                { label: 'Lámina de asbesto, metálica', value: 'lamina_asbesto' },
                { label: 'Madera, teja', value: 'madera_teja' },
                { label: 'Paja o palma', value: 'paja_palma' },
            ]},
            { name: 'type_of_walls', label: 'Mayor parte de muros', type: 'select', options: [
                { label: 'Madera', value: 'madera' },
                { label: 'Adobe', value: 'adobe' },
                { label: 'Ladrillo, tabique', value: 'ladrillo_tabique' },
                { label: 'Otros', value: 'otros' },
                { label: 'Lámina metalica, asbesto', value: 'lamina_metalica_asbesto' },
                { label: 'Desechos, cartón', value: 'desechos_carton' },
                { label: 'Carrizo, bambú', value: 'carrizo_bambu' },
            ]},
            { name: 'number_of_rooms', label: 'Número de cuartos', type: 'number' },
            { name: 'number_of_bedrooms', label: 'Número de cuartos para dormir', type: 'number' },
            { name: 'separate_kitchen', label: 'Cocina separada', type: 'select', options: [
                { label: 'Sí', value: 'si' },
                { label: 'No', value: 'no' },
            ]},
            { name: 'exclusive_bathroom', label: 'Baño exclusivo', type: 'select', options: [
                { label: 'Sí', value: 'si' },
                { label: 'No', value: 'no' },
            ]},
            {
                name: 'assets',
                label: 'Bienes y Electrodomésticos',
                type: 'asset_list',
                options: [
                    { label: 'Refrigerador', value: 'refrigerator' },
                    { label: 'Estufa', value: 'stove' },
                    { label: 'Video, DVD, Blue-Ray', value: 'video_player' },
                    { label: 'Lavadora', value: 'washing_machine' },
                    { label: 'Licuadora', value: 'blender' },
                    { label: 'Televisión', value: 'television' },
                    { label: 'Radio, bocina, estéreo', value: 'radio_or_stereo' },
                    { label: 'Sala', value: 'living_room' },
                    { label: 'Comedor', value: 'dining_room' },
                    { label: 'Automóvil', value: 'car' },
                    { label: 'Cama', value: 'bed' },
                    { label: 'Celular', value: 'cellphone' },
                    { label: 'Motocicleta', value: 'motorcycle' },
                    { label: 'Computadora', value: 'computer' },
                    { label: 'Horno, microondas', value: 'oven_or_microwave' },
                    { label: 'Teléfono', value: 'telephone' },
                ],
            }
        ],
    },
    { 
        key: 'economicConditions',
        title: 'Condiciones Económicas',
        fields: [
            { name: 'support_title', label: 'Apoyo en especie', type: 'title' },
            { name: 'other_support', label: 'Tipo de apoyo en especie (describa)', type: 'text' },
            { name: 'provider_of_support', label: 'Proveedor del apoyo', type: 'text' },
            { name: 'frequency_of_support', label: 'Frecuencia del apoyo en especie', type: 'text'},

            // Remittances
            { name: 'remittances_title', label: 'Remesas', type: 'title' },
            { name: 'has_remmittances', label: 'Recibe remesas', type: 'select', options: [
                { label: 'Sí', value: 'si' },
                { label: 'No', value: 'no' },
            ]},
            { name: 'frequency', label: 'Frecuencia de remesas', type: 'text'},

            // Identity documents
            { name: 'identity_title', label: 'Identidad', type: 'title' },
            { name: 'curp', label: 'CURP', type: 'select', options: [
                { label: 'Sí', value: 'si' },
                { label: 'No', value: 'no' },
            ]},
            { name: 'birth_certificate', label: 'Acta de nacimiento', type: 'select', options: [
                { label: 'Sí', value: 'si' },
                { label: 'No', value: 'no' },
            ]},
            { name: 'id_card', label: 'Credencial (otro)', type: 'select', options: [
                { label: 'Sí', value: 'si' },
                { label: 'No', value: 'no' },
            ]},
            { name: 'ine', label: 'INE', type: 'select', options: [
                { label: 'Sí', value: 'si' },
                { label: 'No', value: 'no' },
            ]}, 
        ],
    },
    {
        key: 'nutritionalStatus',
        title: 'Estado Nutricional',
        fields: [ 
        ], // Handled separately in the component
    },
    {
        key: 'mediaFiles',
        title: 'Documentos',
        fields: []
    }
];