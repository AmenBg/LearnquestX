export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  educationLevels: {
    id: string;
    name: string;
    grades: { id: string; name: string }[];
  }[];
  terms: { id: string; name: string }[];
}

export const countries: CountryConfig[] = [
  {
    code: 'TN', name: 'Tunisia', flag: '🇹🇳',
    educationLevels: [
      { id: 'primary', name: 'Primary School', grades: [
        { id: '1', name: '1st Year' }, { id: '2', name: '2nd Year' }, { id: '3', name: '3rd Year' },
        { id: '4', name: '4th Year' }, { id: '5', name: '5th Year' }, { id: '6', name: '6th Year' },
      ]},
      { id: 'middle', name: 'Middle School', grades: [
        { id: '7', name: '7th Year' }, { id: '8', name: '8th Year' }, { id: '9', name: '9th Year' },
      ]},
      { id: 'high', name: 'High School', grades: [
        { id: '10', name: '1st Secondary' }, { id: '11', name: '2nd Secondary' },
        { id: '12', name: '3rd Secondary' }, { id: '13', name: 'Baccalaureate' },
      ]},
    ],
    terms: [{ id: 'term_1', name: 'Trimester 1' }, { id: 'term_2', name: 'Trimester 2' }, { id: 'term_3', name: 'Trimester 3' }],
  },
  {
    code: 'US', name: 'United States', flag: '🇺🇸',
    educationLevels: [
      { id: 'primary', name: 'Elementary School', grades: [
        { id: '1', name: '1st Grade' }, { id: '2', name: '2nd Grade' }, { id: '3', name: '3rd Grade' },
        { id: '4', name: '4th Grade' }, { id: '5', name: '5th Grade' },
      ]},
      { id: 'middle', name: 'Middle School', grades: [
        { id: '6', name: '6th Grade' }, { id: '7', name: '7th Grade' }, { id: '8', name: '8th Grade' },
      ]},
      { id: 'high', name: 'High School', grades: [
        { id: '9', name: '9th Grade (Freshman)' }, { id: '10', name: '10th Grade (Sophomore)' },
        { id: '11', name: '11th Grade (Junior)' }, { id: '12', name: '12th Grade (Senior)' },
      ]},
    ],
    terms: [{ id: 'term_1', name: 'Semester 1' }, { id: 'term_2', name: 'Semester 2' }],
  },
  {
    code: 'FR', name: 'France', flag: '🇫🇷',
    educationLevels: [
      { id: 'primary', name: 'École Primaire', grades: [
        { id: 'cp', name: 'CP' }, { id: 'ce1', name: 'CE1' }, { id: 'ce2', name: 'CE2' },
        { id: 'cm1', name: 'CM1' }, { id: 'cm2', name: 'CM2' },
      ]},
      { id: 'middle', name: 'Collège', grades: [
        { id: '6eme', name: '6ème' }, { id: '5eme', name: '5ème' },
        { id: '4eme', name: '4ème' }, { id: '3eme', name: '3ème' },
      ]},
      { id: 'high', name: 'Lycée', grades: [
        { id: '2nde', name: 'Seconde' }, { id: '1ere', name: 'Première' }, { id: 'tle', name: 'Terminale' },
      ]},
    ],
    terms: [{ id: 'term_1', name: 'Trimestre 1' }, { id: 'term_2', name: 'Trimestre 2' }, { id: 'term_3', name: 'Trimestre 3' }],
  },
  {
    code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦',
    educationLevels: [
      { id: 'primary', name: 'Primary School', grades: [
        { id: '1', name: '1st Grade' }, { id: '2', name: '2nd Grade' }, { id: '3', name: '3rd Grade' },
        { id: '4', name: '4th Grade' }, { id: '5', name: '5th Grade' }, { id: '6', name: '6th Grade' },
      ]},
      { id: 'middle', name: 'Intermediate School', grades: [
        { id: '7', name: '1st Intermediate' }, { id: '8', name: '2nd Intermediate' }, { id: '9', name: '3rd Intermediate' },
      ]},
      { id: 'high', name: 'Secondary School', grades: [
        { id: '10', name: '1st Secondary' }, { id: '11', name: '2nd Secondary' }, { id: '12', name: '3rd Secondary' },
      ]},
    ],
    terms: [{ id: 'term_1', name: 'Term 1' }, { id: 'term_2', name: 'Term 2' }, { id: 'term_3', name: 'Term 3' }],
  },
  {
    code: 'DE', name: 'Germany', flag: '🇩🇪',
    educationLevels: [
      { id: 'primary', name: 'Grundschule', grades: [
        { id: '1', name: '1. Klasse' }, { id: '2', name: '2. Klasse' },
        { id: '3', name: '3. Klasse' }, { id: '4', name: '4. Klasse' },
      ]},
      { id: 'middle', name: 'Sekundarstufe I', grades: [
        { id: '5', name: '5. Klasse' }, { id: '6', name: '6. Klasse' },
        { id: '7', name: '7. Klasse' }, { id: '8', name: '8. Klasse' },
        { id: '9', name: '9. Klasse' }, { id: '10', name: '10. Klasse' },
      ]},
      { id: 'high', name: 'Sekundarstufe II', grades: [
        { id: '11', name: '11. Klasse' }, { id: '12', name: '12. Klasse' }, { id: '13', name: '13. Klasse' },
      ]},
    ],
    terms: [{ id: 'term_1', name: 'Halbjahr 1' }, { id: 'term_2', name: 'Halbjahr 2' }],
  },
  {
    code: 'EG', name: 'Egypt', flag: '🇪🇬',
    educationLevels: [
      { id: 'primary', name: 'Primary School', grades: [
        { id: '1', name: '1st Grade' }, { id: '2', name: '2nd Grade' }, { id: '3', name: '3rd Grade' },
        { id: '4', name: '4th Grade' }, { id: '5', name: '5th Grade' }, { id: '6', name: '6th Grade' },
      ]},
      { id: 'middle', name: 'Preparatory School', grades: [
        { id: '7', name: '1st Preparatory' }, { id: '8', name: '2nd Preparatory' }, { id: '9', name: '3rd Preparatory' },
      ]},
      { id: 'high', name: 'Secondary School', grades: [
        { id: '10', name: '1st Secondary' }, { id: '11', name: '2nd Secondary' }, { id: '12', name: '3rd Secondary' },
      ]},
    ],
    terms: [{ id: 'term_1', name: 'Term 1' }, { id: 'term_2', name: 'Term 2' }],
  },
  {
    code: 'MA', name: 'Morocco', flag: '🇲🇦',
    educationLevels: [
      { id: 'primary', name: 'Primary School', grades: [
        { id: '1', name: '1st Year' }, { id: '2', name: '2nd Year' }, { id: '3', name: '3rd Year' },
        { id: '4', name: '4th Year' }, { id: '5', name: '5th Year' }, { id: '6', name: '6th Year' },
      ]},
      { id: 'middle', name: 'Collège', grades: [
        { id: '7', name: '1ère année' }, { id: '8', name: '2ème année' }, { id: '9', name: '3ème année' },
      ]},
      { id: 'high', name: 'Lycée', grades: [
        { id: '10', name: 'Tronc commun' }, { id: '11', name: '1ère bac' }, { id: '12', name: '2ème bac' },
      ]},
    ],
    terms: [{ id: 'term_1', name: 'Semester 1' }, { id: 'term_2', name: 'Semester 2' }],
  },
  {
    code: 'ES', name: 'Spain', flag: '🇪🇸',
    educationLevels: [
      { id: 'primary', name: 'Educación Primaria', grades: [
        { id: '1', name: '1º Primaria' }, { id: '2', name: '2º Primaria' }, { id: '3', name: '3º Primaria' },
        { id: '4', name: '4º Primaria' }, { id: '5', name: '5º Primaria' }, { id: '6', name: '6º Primaria' },
      ]},
      { id: 'middle', name: 'ESO', grades: [
        { id: '7', name: '1º ESO' }, { id: '8', name: '2º ESO' },
        { id: '9', name: '3º ESO' }, { id: '10', name: '4º ESO' },
      ]},
      { id: 'high', name: 'Bachillerato', grades: [
        { id: '11', name: '1º Bachillerato' }, { id: '12', name: '2º Bachillerato' },
      ]},
    ],
    terms: [{ id: 'term_1', name: 'Trimestre 1' }, { id: 'term_2', name: 'Trimestre 2' }, { id: 'term_3', name: 'Trimestre 3' }],
  },
  {
    code: 'GB', name: 'United Kingdom', flag: '🇬🇧',
    educationLevels: [
      { id: 'primary', name: 'Primary School', grades: [
        { id: '1', name: 'Year 1' }, { id: '2', name: 'Year 2' }, { id: '3', name: 'Year 3' },
        { id: '4', name: 'Year 4' }, { id: '5', name: 'Year 5' }, { id: '6', name: 'Year 6' },
      ]},
      { id: 'middle', name: 'Secondary School', grades: [
        { id: '7', name: 'Year 7' }, { id: '8', name: 'Year 8' }, { id: '9', name: 'Year 9' },
        { id: '10', name: 'Year 10' }, { id: '11', name: 'Year 11' },
      ]},
      { id: 'high', name: 'Sixth Form', grades: [
        { id: '12', name: 'Year 12' }, { id: '13', name: 'Year 13' },
      ]},
    ],
    terms: [{ id: 'term_1', name: 'Autumn Term' }, { id: 'term_2', name: 'Spring Term' }, { id: 'term_3', name: 'Summer Term' }],
  },
  {
    code: 'DZ', name: 'Algeria', flag: '🇩🇿',
    educationLevels: [
      { id: 'primary', name: 'Primary School', grades: [
        { id: '1', name: '1st Year' }, { id: '2', name: '2nd Year' }, { id: '3', name: '3rd Year' },
        { id: '4', name: '4th Year' }, { id: '5', name: '5th Year' },
      ]},
      { id: 'middle', name: 'Middle School', grades: [
        { id: '6', name: '1st Year' }, { id: '7', name: '2nd Year' },
        { id: '8', name: '3rd Year' }, { id: '9', name: '4th Year' },
      ]},
      { id: 'high', name: 'Secondary School', grades: [
        { id: '10', name: '1st Year' }, { id: '11', name: '2nd Year' }, { id: '12', name: '3rd Year' },
      ]},
    ],
    terms: [{ id: 'term_1', name: 'Trimester 1' }, { id: 'term_2', name: 'Trimester 2' }, { id: 'term_3', name: 'Trimester 3' }],
  },
];

export function getCountry(code: string): CountryConfig | undefined {
  return countries.find(c => c.code === code);
}
