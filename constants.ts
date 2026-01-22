
import { PatientData } from './types';

export const MOCK_PATIENTS: PatientData[] = [
  {
    id: 'CASE-001',
    name: 'Robert Miller',
    age: 58,
    sex: 'M',
    symptoms: ['Substernal chest pressure', 'Shortness of breath', 'Nausea', 'Diaphoresis'],
    history: 'History of HTN, Type 2 DM, and tobacco use (30 pack-years). Complaining of sudden onset heavy pressure in the chest radiating to the left jaw for 45 minutes.',
    vitals: { hr: 105, bp: '155/95', temp: 37.1, o2: 94 }
  },
  {
    id: 'CASE-002',
    name: 'Sarah Chen',
    age: 24,
    sex: 'F',
    symptoms: ['Pleuritic chest pain', 'Tachycardia', 'Anxiety'],
    history: 'Recent long-haul flight (14 hours) 2 days ago. On oral contraceptive pills. Sudden onset sharp pain on deep inspiration.',
    vitals: { hr: 112, bp: '118/72', temp: 37.4, o2: 91 }
  },
  {
    id: 'CASE-003',
    name: 'Elena Rodriguez',
    age: 67,
    sex: 'F',
    symptoms: ['Confusion', 'Fever', 'Dysuria', 'Hypotension'],
    history: 'Resident of skilled nursing facility. Baseline dementia. Caregivers noticed decreased oral intake and increased lethargy over the last 24 hours.',
    vitals: { hr: 98, bp: '92/58', temp: 38.9, o2: 96 }
  }
];
