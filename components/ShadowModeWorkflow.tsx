
import React, { useState } from 'react';
import { PatientData, HumanHypothesis, AINudge, AIAnalysis } from '../types';
import { MOCK_PATIENTS } from '../constants';
import { PedagogicalAIService } from '../services/geminiService';

const ShadowModeWorkflow: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isManualMode, setIsManualMode] = useState(false);
  
  // The current active patient state - now fully editable
  const [activePatient, setActivePatient] = useState<PatientData>({ ...MOCK_PATIENTS[0] });
  
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [humanHypo, setHumanHypo] = useState<HumanHypothesis>({
    diagnosis: '',
    confidence: 70,
    reasoning: ''
  });
  const [nudges, setNudges] = useState<AINudge[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize service lazily to handle potential API key updates if needed (though using process.env here)
  const aiService = new PedagogicalAIService();

  const handlePatientSelectChange = (patientId: string) => {
    if (patientId === 'manual') {
      setIsManualMode(true);
      setActivePatient({
        id: 'manual-' + Date.now(),
        name: '',
        age: 0,
        sex: 'M',
        symptoms: [],
        history: '',
        vitals: { hr: 80, bp: '120/80', temp: 37.0, o2: 98 }
      });
    } else {
      setIsManualMode(false);
      const selected = MOCK_PATIENTS.find(p => p.id === patientId);
      if (selected) {
        setActivePatient({ ...selected });
      }
    }
    resetAnalysisStates();
  };

  const resetAnalysisStates = () => {
    setHumanHypo({ diagnosis: '', confidence: 70, reasoning: '' });
    setNudges([]);
    setAiAnalysis(null);
    setStep(1);
  };

  const clearAiAnalysisAndRestart = () => {
    setNudges([]);
    setAiAnalysis(null);
    setStep(1);
  };

  const addSymptom = () => {
    if (currentSymptom.trim()) {
      setActivePatient(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, currentSymptom.trim()]
      }));
      setCurrentSymptom('');
    }
  };

  const removeSymptom = (idx: number) => {
    setActivePatient(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== idx)
    }));
  };

  const handleCommitHypothesis = async () => {
    if (!humanHypo.diagnosis || !humanHypo.reasoning) return;
    
    setLoading(true);
    try {
      const [nudgesResult, aiResult] = await Promise.all([
        aiService.generateSocraticNudges(activePatient, humanHypo),
        aiService.getAIDiagnosis(activePatient)
      ]);
      setNudges(nudgesResult);
      setAiAnalysis(aiResult);
      setStep(2);
    } catch (e) {
      alert("Pedagogical AI is temporarily unavailable. Check your console and API key.");
      // Fallback for demo purposes if desired, or stay on step 1
    } finally {
      setLoading(false);
    }
  };

  const updateVital = (key: keyof PatientData['vitals'], value: string | number) => {
    setActivePatient(prev => ({
      ...prev,
      vitals: { ...prev.vitals, [key]: value }
    }));
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Visual Stepper */}
      <div className="flex justify-center mb-16">
        <div className="flex items-center gap-4 md:gap-10 bg-white px-8 md:px-12 py-5 rounded-full border border-slate-200 shadow-sm ring-4 ring-slate-50">
          <div className="flex items-center gap-3">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
            <span className={`text-sm font-bold tracking-tight hidden sm:block ${step === 1 ? 'text-blue-600' : 'text-slate-400'}`}>Intake Form</span>
          </div>
          <i className="fas fa-chevron-right text-slate-200 text-xs"></i>
          <div className="flex items-center gap-3">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
            <span className={`text-sm font-bold tracking-tight hidden sm:block ${step === 2 ? 'text-blue-600' : 'text-slate-400'}`}>AI Mentorship</span>
          </div>
          <i className="fas fa-chevron-right text-slate-200 text-xs"></i>
          <div className="flex items-center gap-3">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>3</span>
            <span className={`text-sm font-bold tracking-tight hidden sm:block ${step === 3 ? 'text-blue-600' : 'text-slate-400'}`}>Resolution</span>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Patient Selection & Basic Info */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-200 space-y-10">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">Load Template Case</label>
                <div className="relative">
                  <select 
                    value={isManualMode ? 'manual' : activePatient.id}
                    onChange={(e) => handlePatientSelectChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-8 py-5 text-xl font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <optgroup label="Standard Library">
                      {MOCK_PATIENTS.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Workspace">
                      <option value="manual">➕ Blank Patient File</option>
                    </optgroup>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-8 pointer-events-none text-slate-400">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handlePatientSelectChange(activePatient.id)}
                className="px-8 py-5 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold transition-all flex items-center gap-3 h-[68px]"
              >
                <i className="fas fa-rotate-left"></i>
                <span className="whitespace-nowrap">Reset Case</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-10 border-t border-slate-100">
              <div className="md:col-span-2 space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                <div className="relative group">
                  <input 
                    type="text"
                    value={activePatient.name}
                    onChange={(e) => setActivePatient({ ...activePatient, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-xl font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="Enter patient name..."
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Age</label>
                <div className="relative group">
                  <input 
                    type="number"
                    value={activePatient.age || ''}
                    onChange={(e) => setActivePatient({ ...activePatient, age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-xl font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="0"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">Yrs</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Biological Sex</label>
                <div className="relative group">
                  <select 
                    value={activePatient.sex}
                    onChange={(e) => setActivePatient({ ...activePatient, sex: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-xl font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-200 space-y-10">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-4">
              <i className="fas fa-stethoscope text-blue-500"></i>
              Vital Signs & Presentation
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'HR (bpm)', key: 'hr', type: 'number', icon: 'fa-heart-pulse' },
                { label: 'BP (mmHg)', key: 'bp', type: 'text', icon: 'fa-gauge-high' },
                { label: 'Temp (°C)', key: 'temp', type: 'number', icon: 'fa-temperature-high' },
                { label: 'O2 (%)', key: 'o2', type: 'number', icon: 'fa-lungs' },
              ].map((vital) => (
                <div key={vital.key} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group transition-all hover:border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{vital.label}</span>
                    <i className={`fas ${vital.icon} text-slate-300 text-xs`}></i>
                  </div>
                  <input 
                    type={vital.type}
                    value={activePatient.vitals[vital.key as keyof PatientData['vitals']]}
                    onChange={(e) => updateVital(vital.key as keyof PatientData['vitals'], vital.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                    className="w-full bg-transparent text-2xl font-black text-slate-700 outline-none focus:text-blue-600 transition-colors"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Observable Clinical Findings</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <input 
                    type="text"
                    value={currentSymptom}
                    onChange={(e) => setCurrentSymptom(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[1.25rem] px-8 py-5 text-base font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="Enter a symptom or exam finding..."
                  />
                </div>
                <button 
                  onClick={addSymptom} 
                  className="bg-blue-600 text-white px-8 py-5 rounded-[1.25rem] font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200/50 flex items-center justify-center gap-3"
                >
                  <i className="fas fa-plus"></i>
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-3 min-h-[60px] pt-4">
                {activePatient.symptoms.map((s, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 px-6 py-3 rounded-2xl text-sm font-bold border border-blue-100 flex items-center gap-5 group transition-all hover:bg-blue-100">
                    {s}
                    <i className="fas fa-times-circle cursor-pointer text-blue-300 hover:text-red-500 transition-colors" onClick={() => removeSymptom(idx)}></i>
                  </span>
                ))}
                {activePatient.symptoms.length === 0 && (
                  <div className="w-full text-center py-6 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-400 font-bold italic text-sm">
                    No clinical findings documented.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Patient Background & Narrative History</label>
              <textarea 
                value={activePatient.history}
                onChange={(e) => setActivePatient({ ...activePatient, history: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] px-8 py-8 text-lg font-medium h-48 resize-none focus:ring-4 focus:ring-blue-500/10 outline-none transition-all leading-relaxed"
                placeholder="Include medical history, lifestyle factors..."
              />
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden ring-8 ring-blue-500/5">
             <div className="relative z-10">
               <div className="flex flex-col md:flex-row items-start justify-between mb-12 gap-6">
                 <div>
                   <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Human AI Protocol</h2>
                   <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl font-medium">
                     Commit to your hypothesis before verification. Prevents automation bias and keeps your intuition sharp.
                   </p>
                 </div>
                 <div className="bg-blue-500/20 text-blue-400 px-6 py-3 rounded-3xl border border-blue-500/30 flex items-center gap-3">
                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest">Intuition Shield Active</span>
                 </div>
               </div>

               <div className="space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-4">
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Initial Diagnostic Impression</label>
                     <input 
                       type="text" 
                       value={humanHypo.diagnosis}
                       onChange={(e) => setHumanHypo({...humanHypo, diagnosis: e.target.value})}
                       className="w-full bg-slate-800/50 border border-slate-700 rounded-3xl px-8 py-7 text-white text-2xl font-bold focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-700"
                       placeholder="e.g. Myocardial Infarction"
                     />
                   </div>

                   <div className="space-y-4">
                     <div className="flex justify-between items-center mb-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Clinician Confidence</label>
                       <span className="text-blue-400 font-black text-4xl">{humanHypo.confidence}%</span>
                     </div>
                     <input 
                       type="range" 
                       min="1" max="100" 
                       value={humanHypo.confidence}
                       onChange={(e) => setHumanHypo({...humanHypo, confidence: parseInt(e.target.value)})}
                       className="w-full h-4 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500 my-8"
                     />
                   </div>
                 </div>

                 <div className="space-y-4">
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                     <i className="fas fa-feather-pointed text-blue-400"></i>
                     Differential Rationale & Logical Chain
                   </label>
                   <textarea 
                     value={humanHypo.reasoning}
                     onChange={(e) => setHumanHypo({...humanHypo, reasoning: e.target.value})}
                     className="w-full bg-slate-800/50 border border-slate-700 rounded-3xl px-8 py-8 text-xl font-medium focus:ring-4 focus:ring-blue-500/20 outline-none transition-all h-56 resize-none leading-relaxed placeholder:text-slate-700"
                     placeholder="Document why your findings lead to this conclusion..."
                   />
                 </div>

                 <button 
                   disabled={!humanHypo.diagnosis || !humanHypo.reasoning || loading}
                   onClick={handleCommitHypothesis}
                   className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 py-8 md:py-10 rounded-[2rem] md:rounded-[2.5rem] font-black text-2xl md:text-3xl shadow-3xl shadow-blue-900/50 transition-all flex items-center justify-center gap-6 group"
                 >
                   {loading ? (
                     <>
                       <i className="fas fa-circle-notch fa-spin"></i>
                       Consulting Senior AI...
                     </>
                   ) : (
                     <>
                       <i className="fas fa-brain-circuit group-hover:scale-110 transition-transform"></i>
                       {humanHypo.reasoning ? "Unlock Human AI Mentorship" : "Complete Rationale to Proceed"}
                     </>
                   )}
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-700">
          <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 shadow-sm border border-slate-200">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-12 flex items-center gap-6">
              <i className="fas fa-microphone-lines text-purple-600 text-4xl"></i>
              Socratic Calibration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {nudges.map((nudge, idx) => (
                <div key={idx} className="bg-purple-50/50 border border-purple-100 p-8 rounded-[2.5rem] flex flex-col justify-between hover:shadow-xl transition-all border-b-[8px] border-b-purple-200 group">
                   <p className="text-xl text-slate-800 font-bold leading-relaxed mb-10 italic">
                     "{nudge.content}"
                   </p>
                   <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Avoiding Pitfall</span>
                      <span className="text-xs text-amber-600 font-black leading-snug block">{nudge.commonMistake}</span>
                   </div>
                </div>
              ))}
              {nudges.length === 0 && (
                <div className="col-span-3 text-center py-16 text-slate-400 font-bold italic text-lg">
                  Clinical reasoning appears sound. No nudges triggered.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] md:rounded-[3.5rem] p-10 shadow-sm flex flex-col h-full border-t-[12px] border-t-blue-500">
              <h3 className="font-black text-slate-400 uppercase text-[10px] mb-8 tracking-widest flex justify-between">
                <span>Clinician Commitment</span>
                <i className="fas fa-user-doctor text-blue-500 text-2xl"></i>
              </h3>
              <div className="text-4xl font-black text-slate-900 mb-4">{humanHypo.diagnosis}</div>
              <div className="inline-block self-start px-5 py-2 bg-blue-100 text-blue-700 rounded-xl text-xs font-black mb-10">{humanHypo.confidence}% Confidence</div>
              <div className="text-lg text-slate-600 border-t border-slate-100 pt-8 italic leading-relaxed flex-1">
                "{humanHypo.reasoning}"
              </div>
            </div>

            <div className="bg-white border border-purple-200 rounded-[2.5rem] md:rounded-[3.5rem] p-10 shadow-sm relative overflow-hidden flex flex-col h-full border-t-[12px] border-t-purple-500">
              <h3 className="font-black text-purple-400 uppercase text-[10px] mb-8 tracking-widest flex justify-between relative z-10">
                <span>AI Expert Verdict</span>
                <i className="fas fa-bolt-lightning text-purple-500 text-2xl"></i>
              </h3>
              <div className="text-4xl font-black text-slate-900 mb-4 relative z-10">{aiAnalysis?.diagnosis}</div>
              <div className="inline-block self-start px-5 py-2 bg-purple-100 text-purple-700 rounded-xl text-xs font-black relative z-10">{aiAnalysis?.confidence}% Confidence</div>
              
              <div className="mt-10 pt-10 border-t border-slate-100 space-y-6 relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calibration Variance</span>
                  <span className={`text-xl font-black ${Math.abs(humanHypo.confidence - (aiAnalysis?.confidence || 0)) > 20 ? 'text-red-500' : 'text-green-600'}`}>
                    {Math.abs(humanHypo.confidence - (aiAnalysis?.confidence || 0))}% Gap
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex ring-2 ring-slate-50">
                   <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${humanHypo.confidence}%` }}></div>
                   <div className="h-full bg-purple-500 opacity-20 transition-all duration-1000" style={{ width: `${aiAnalysis?.confidence}%` }}></div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">Consider re-examining logic if variance is high.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-8 pt-8">
            <button 
              onClick={clearAiAnalysisAndRestart} 
              className="px-10 py-6 bg-slate-200 text-slate-700 rounded-3xl font-black text-xl hover:bg-slate-300 transition-all flex items-center justify-center gap-4"
            >
              <i className="fas fa-rotate-left"></i>
              Edit Rationale
            </button>
            <button 
              onClick={() => setStep(3)} 
              className="px-10 py-6 bg-blue-600 text-white rounded-3xl font-black text-xl hover:bg-blue-700 shadow-2xl transition-all flex items-center justify-center gap-4"
            >
              Finalize Case
              <i className="fas fa-clipboard-check"></i>
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-20 animate-in zoom-in duration-700 max-w-2xl mx-auto">
          <div className="w-40 h-40 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-6xl mx-auto mb-12 shadow-inner border-[10px] border-white ring-[12px] ring-green-50 animate-bounce">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight">Wisdom Refined.</h2>
          <p className="text-2xl text-slate-500 mb-16 leading-relaxed font-medium">
            You successfully navigated the Human AI protocol for <strong>{activePatient.name}</strong>. Intuition preserved.
          </p>
          <button 
            onClick={() => {
              setStep(1); 
              setHumanHypo({diagnosis: '', confidence: 70, reasoning: ''}); 
              setIsManualMode(false); 
              setActivePatient({ ...MOCK_PATIENTS[0] }); 
              setNudges([]); 
              setAiAnalysis(null);
            }} 
            className="bg-slate-900 text-white px-12 py-8 rounded-[2.5rem] font-black text-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-6 group mx-auto"
          >
            Next Clinical Case
            <i className="fas fa-arrow-right group-hover:translate-x-3 transition-transform"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default ShadowModeWorkflow;
