
export interface GeneralData {
    community_name: string;
    group: string;
    date: string;
    state: string;
    municipality: string;
    locality: string;
    type_of_settlement: string;
    name_of_settlement: string;
    type_of_road: string;
    street: string;
    external_number: string;
    internal_number: string;
    postal_code: string;
    between_streets: string;
    description_of_location: string;
    cell_phone: string;
}

export interface Services {
    electricity: string[];
    sanitary: string[];
    bathroom: string[];
    fuel: string[];
    water: string[];
}

export interface FamilyMember {
    id: number;
    first_name: string;
    first_surname: string;
    second_surname: string;
    gender: 'M' | 'F';
    dob: string; //YYYY-MM-DD
    entity_of_birth: string;
    idCard: string;
    civil_status: string;
    relationship_to_head: string;
    schooling?: string;
    grade_of_schooling?: string;
    assisting_school?: boolean;
    occupation?: string;
    type_of_employment?: string;
    labor_benefits?: string[];
    retired_or_pensioner?: string;
    eligible_for_social_programs?: string; //Esto se refiere al derechohabiente, no tiene una traduccion clara al ingles
    reason_for_eligibility?: string; // Se refiere al motivon por el cual es derechohabiente. De nuevo, no tiene traduccion clara al ingles. Pero pueude ser por ser un trabajor, ser pensionado, discapacidad, parentesco, etc.
    has_disability?: string;
    health_issues?: string;
    adictions?: string;
    weight?: number;
    size?: number;
    BMI?: number; // Body Mass Index (Might as well do the calculation to save people the trouble)
    indigenous?: string;
}

export interface LivingConditions {
    type_of_housing: string;
    type_of_floor: string; //Make it clear that this is the most prevalent type of floor in the house
    tenency: string;
    type_of_roof: string; // Most prevalent type of roof in the house
    type_of_walls: string; // Most prevalent type of walls in the house
    number_of_rooms: number; // Number of rooms used for sleeping
    number_of_bedrooms: number; // Number of bedrooms
    separate_kitchen: boolean;
    exclusive_bathroom: boolean;
    refrigerator: {
        has: boolean;
        functional: boolean;
    }
    stove: {
        has: boolean;
        functional: boolean;
    }
    video_player: {
        has: boolean;
        functional: boolean;
    }
    washing_machine: {
        has: boolean;
        functional: boolean;
    }
    blender: {
        has: boolean;
        functional: boolean;
    }
    television: {
        has: boolean;
        functional: boolean;
    }
    radio_or_stereo: { //Basically any audio device
        has: boolean;
        functional: boolean;
    }
    living_room: { //Functional here means if it is able to be used as such, no cluttered items or broken furniture.
        has: boolean;
        functional: boolean;
    }
    dining_room: { //Same logic as living room
        has: boolean;
        functional: boolean;
    }
    car: {
        has: boolean;
        functional: boolean;
    }
    bed: {
        has: boolean;
        functional: boolean;
    }
    cellphone: {
        has: boolean;
        functional: boolean;
    }
    motorcycle:{
        has: boolean;
        functional: boolean;
    }
    computer: {
        has: boolean;
        functional: boolean;
    }
    oven_or_microwave: { //Other heating devices can be included here
        has: boolean;
        functional: boolean;
    }
    telephone:{
        has: boolean;
        functional: boolean;
    }
}

export interface economicConditions {
    other_support: string;
    provider_of_support: string;
    frequency_of_support: string;
    has_remmittances: boolean;
    frequency: string;
    curp: boolean;
    birth_certificate: boolean;
    id_card: boolean;
    ine: boolean;
    weekly_income: {
        father_income: number;
        mother_income: number;
        offspring_income: number;
        PROSPERA_program: number;
        scholarships: number;
        other: number;
        pension: number;
        weekly_total: number; // Calculate in code to avoid human error
        monthly_total: number; // Calculate in code to avoid human error
    }
    weekly_expenses: {
        housing: number; 
        food: number;
        electricity: number;
        gas: number;
        water: number;
        phone_internet: number;
        transportation: number;
        medical: number;
        other: number;
        cell_phone: number;
        education: number;
        weekly_total: number; // Calculate in code to avoid human error
        monthly_total: number; // Calculate in code to avoid human error
    }
}

//These fields are more complex questions so only short versions are included here
export interface nutritionalStatus {
    question_1: {
        question: '¿Alguna vez usted o algún adulto en su hogar tuvo una alimentación basada en poca variedad de alimentos?';
        answer: boolean;
    }
    question_2: {
        question: 'Alguna vez usted o algún adulto en su hogar dejó de desayunar, comer o cenar.',
        answer: boolean;
    }
    question_3: {
        question: '¿Alguna vez usted o algún adulto en su hogar comió menos de lo que piensa que debía comer?',
        answer: boolean;
    }
    question_4: {
        question: '¿Alguna vez se quedaron sin comida?'
        answer: boolean;
    }
    question_5: {
        question: 'Alguna vez usted o algún adulto en su hogar sintió hambre, pero no comió.',
        answer: boolean;
    }
    question_6: {
        question: '¿Alguna vez usted o algún adulto en su hogar sólo comió una vez al día o dejó de comer durante un día?',
        answer: boolean;
    }
    //The next set of questions are conditional to a person under 18 living in the house, logic to detect that must be implemented otherwise these questions will be skipped
    question_7?: {
        question: '¿Alguna vez algún menor de 18 años en su hogar tuvo una alimentación basada en poca variedad de alimentos?',
        answer: boolean;
    }
    question_8?: {
        question: '¿Alguna vez algún menor de 18 años en su hogar comió menos de lo que debía?',
        answer: boolean;
    }
    question_9?: {
        question: '¿Alguna vez en su hogar tuvieron que disminuir la cantidad servida a algún menor de 18 años?',
        answer: boolean;
    }
    question_10?: {
        question: '¿Alguna vez algún menor de 18 años en su hogar sintió hambre, pero no comió?',
        answer: boolean;
    }
    question_11?: {
        question: '¿Algún menor de 18 se durmió con hambre?',
        answer: boolean;
    }
    question_12?: {
        question: '¿Alguna vez algún menor de 18 años comió una vez al día o dejó de comer durante todo un día?',
        answer: boolean;
    }
}