
export interface PatientData {
  id: string;
  name: string;
  age: number;
  sex: 'M' | 'F' | 'Other';
  symptoms: string[];
  history: string;
  vitals: {
    hr: number;
    bp: string;
    temp: number;
    o2: number;
  };
}

export interface HumanHypothesis {
  diagnosis: string;
  confidence: number;
  reasoning: string;
}

export interface AINudge {
  content: string;
  commonMistake: string;
}

export interface AIAnalysis {
  diagnosis: string;
  confidence: number;
}
