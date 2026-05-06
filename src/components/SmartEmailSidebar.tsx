'use client';

import { useState } from 'react';

type SidebarState = 'IDLE' | 'DETECTING' | 'CONTEXT_SELECT' | 'EXTRACTING' | 'FORM';

export default function SmartEmailSidebar({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<SidebarState>('IDLE');
  const [emailInput, setEmailInput] = useState('');
  
  // Form State
  const [extractedData, setExtractedData] = useState({
    meeting_point: '',
    property_highlights: '',
    hazards: '',
    asset_status: ''
  });

  const simulateDetection = () => {
    setStep('DETECTING');
    setTimeout(() => setStep('CONTEXT_SELECT'), 1500);
  };

  const simulateExtraction = () => {
    setStep('EXTRACTING');
    setTimeout(() => {
      setExtractedData({
        meeting_point: 'Meet at the side gate on 4th st.',
        property_highlights: 'Infinity pool, panoramic views.',
        hazards: 'Large dog on premises, locked in garage.',
        asset_status: 'Boundary map attached.'
      });
      setStep('FORM');
    }, 2500);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="h-20 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-icons-outlined">auto_awesome</span>
          <h2 className="font-black text-lg">AI Email Assist</h2>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
          <span className="material-icons-outlined">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {step === 'IDLE' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Paste an email or sender address to auto-detect context and extract relevant property data.</p>
            <textarea 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="agent@example.com or raw email body..."
              className="w-full h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            />
            <button 
              onClick={simulateDetection}
              disabled={!emailInput}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              Analyze Email
            </button>
          </div>
        )}

        {step === 'DETECTING' && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <span className="material-icons-outlined text-4xl animate-spin text-primary">sync</span>
            <p className="text-sm font-bold animate-pulse">Scanning email address against active jobs...</p>
          </div>
        )}

        {step === 'CONTEXT_SELECT' && (
          <div className="space-y-4">
            <div className="bg-primary/10 text-primary p-3 rounded-lg flex items-start gap-3">
              <span className="material-icons-outlined text-sm mt-0.5">check_circle</span>
              <p className="text-xs font-bold">Found 2 active jobs for this agent.</p>
            </div>
            
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mt-6 mb-2">Select Context</h3>
            
            <div className="space-y-2">
              <button onClick={simulateExtraction} className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary transition-all group">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">4242 Beverly Blvd</p>
                <p className="text-xs text-slate-500 mt-1">Shoot: Tomorrow at 2:00 PM</p>
              </button>
              <button onClick={simulateExtraction} className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary transition-all group">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">100 Sunset Strip</p>
                <p className="text-xs text-slate-500 mt-1">Shoot: Friday at 10:00 AM</p>
              </button>
              <button className="w-full text-left p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 text-slate-500">
                <span className="material-icons-outlined text-sm">add</span>
                <span className="text-sm font-bold">Create New Job</span>
              </button>
            </div>
          </div>
        )}

        {step === 'EXTRACTING' && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-primary-300 flex items-center justify-center animate-pulse">
               <span className="material-icons-outlined text-white">auto_awesome</span>
            </div>
            <p className="text-sm font-bold text-primary">Gemini is extracting data...</p>
          </div>
        )}

        {step === 'FORM' && (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg flex items-start gap-3 border border-green-200 dark:border-green-900">
              <span className="material-icons-outlined text-sm mt-0.5">verified</span>
              <p className="text-xs">Extraction complete. Please review before saving.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Meeting Point</label>
                <input 
                  type="text" 
                  value={extractedData.meeting_point}
                  onChange={(e) => setExtractedData({...extractedData, meeting_point: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Property Highlights</label>
                <textarea 
                  value={extractedData.property_highlights}
                  onChange={(e) => setExtractedData({...extractedData, property_highlights: e.target.value})}
                  className="w-full h-20 resize-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Hazards / Access</label>
                <textarea 
                  value={extractedData.hazards}
                  onChange={(e) => setExtractedData({...extractedData, hazards: e.target.value})}
                  className="w-full h-20 resize-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <button 
                onClick={() => setStep('IDLE')}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setStep('IDLE')}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary/30"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
