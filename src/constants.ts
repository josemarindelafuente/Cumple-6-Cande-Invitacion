export type QuestionType = 'syllables' | 'multiple-choice' | 'number' | 'colors';

export interface Question {
  id: number;
  text: string;
  answer: string;
  type: QuestionType;
  options?: string[]; // For multiple choice or colors
  syllables?: string[]; // For syllable matching
  correctOrder?: string[]; // For syllable matching
}

export const EVENT_INFO = {
  name: "Cande",
  age: 6,
  date: "22 de Abril",
  time: "13:00 a 16:00",
  location: "Salón la Estación",
  theme: "Gatitos y Perritos"
};

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "¿CÓMO SE LLAMA LA SEÑO DE PRIMER GRADO DEL TURNO MAÑANA?",
    answer: "CARLA",
    type: "syllables",
    syllables: ["CAR", "LA", "MA", "RI", "NA", "LO"],
    correctOrder: ["CAR", "LA"]
  },
  {
    id: 2,
    text: "¿CUÁNTOS RECREOS HAY EN PRIMER GRADO?",
    answer: "3",
    type: "multiple-choice",
    options: ["1", "2", "3", "4"]
  },
  {
    id: 3,
    text: "¿CÓMO SE LLAMA LA SEÑO DE MÚSICA?",
    answer: "RUTH",
    type: "syllables",
    syllables: ["RUTH", "SOL", "LUZ", "MAR", "FE", "PA"],
    correctOrder: ["RUTH"]
  },
  {
    id: 4,
    text: "¿CÓMO SE LLAMA LA SEÑO DE EDUCACIÓN FÍSICA?",
    answer: "CARO",
    type: "syllables",
    syllables: ["CA", "RO", "LI", "NA", "MA", "TE"],
    correctOrder: ["CA", "RO"]
  },
  {
    id: 5,
    text: "¿CÓMO SE LLAMA LA SEÑO DE INGLÉS?",
    answer: "CECI",
    type: "syllables",
    syllables: ["CE", "CI", "LI", "NA", "MA", "RO"],
    correctOrder: ["CE", "CI"]
  },
  {
    id: 6,
    text: "¿CÓMO SE LLAMA LA SEÑO DE PLÁSTICA?",
    answer: "DALILA",
    type: "syllables",
    syllables: ["DA", "LI", "LA", "MA", "RO", "NE"],
    correctOrder: ["DA", "LI", "LA"]
  },
  {
    id: 7,
    text: "¿CUÁL ES EL HORARIO DE SALIDA DE LOS CHICOS DE PRIMER GRADO?",
    answer: "12.30",
    type: "multiple-choice",
    options: ["12.00", "12.30", "13.00", "11.30"]
  },
  {
    id: 8,
    text: "¿CUÁNTOS AÑOS CUMPLE CANDE?",
    answer: "6",
    type: "multiple-choice",
    options: ["4", "5", "6", "7"]
  },
  {
    id: 9,
    text: "¿QUÉ COLORES TIENE EL LOGO DEL COLEGIO?",
    answer: "BLANCO, ROJO Y AZUL",
    type: "multiple-choice",
    options: ["BLANCO, ROJO Y AZUL", "VERDE Y AMARILLO", "NEGRO Y GRIS", "ROSA Y VIOLETA"]
  },
  {
    id: 10,
    text: "¿CÓMO SE LLAMA LA SEÑO DE COMPUTACIÓN?",
    answer: "ALEJANDRA",
    type: "syllables",
    syllables: ["A", "LE", "JAN", "DRA", "MA", "RI"],
    correctOrder: ["A", "LE", "JAN", "DRA"]
  },
  {
    id: 11,
    text: "¿QUÉ DÍAS SON LAS CLASES DE EDUCACIÓN FÍSICA?",
    answer: "LUNES, JUEVES Y VIERNES",
    type: "multiple-choice",
    options: ["LUNES, JUEVES Y VIERNES", "MARTES Y MIÉRCOLES", "SÁBADO Y DOMINGO", "TODOS LOS DÍAS"]
  },
  {
    id: 12,
    text: "¿QUÉ DÍAS SON LAS CLASES DE PLÁSTICA?",
    answer: "MIÉRCOLES",
    type: "multiple-choice",
    options: ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES"]
  },
  {
    id: 13,
    text: "¿QUÉ DÍAS SON LAS CLASES DE MÚSICA?",
    answer: "MARTES",
    type: "multiple-choice",
    options: ["LUNES", "MARTES", "MIÉRCOLES", "VIERNES"]
  },
  {
    id: 14,
    text: "¿QUÉ DÍAS SON LAS CLASES DE COMPUTACIÓN?",
    answer: "JUEVES",
    type: "multiple-choice",
    options: ["LUNES", "MIÉRCOLES", "JUEVES", "VIERNES"]
  },
  {
    id: 15,
    text: "¿QUÉ DÍAS SON LAS CLASES DE INGLÉS?",
    answer: "LUNES, MARTES, MIÉRCOLES, JUEVES, VIERNES",
    type: "multiple-choice",
    options: ["LUNES, MARTES, MIÉRCOLES, JUEVES, VIERNES", "SOLO LUNES", "MARTES Y JUEVES", "MIÉRCOLES Y VIERNES"]
  }
];
