// Define the structure of the form schema
// Here we can alter the form sections and fields as needed, instead of hardcoding them in components

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox';

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
        label: 'Parentesco con el jefe de familia',
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
    { name: 'health_status', label: 'Estado de salud', type: 'text' },
    // ...other health fields
];

//#endregion

export const formSchema: FormSection[] = [
    // General data section
    {
        key: 'generalData',
        title: 'Datos Generales',
        fields: [
            { name: 'community_name', label: 'Nombre de la comunidad', type: 'text', required: true },
            { name: 'group', label: 'Grupo', type: 'text' },
            { name: 'date', label: 'Fecha', type: 'date' },  
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
            { name: 'cell_phone', label: 'Teléfono celular', type: 'text' },
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
    }
];