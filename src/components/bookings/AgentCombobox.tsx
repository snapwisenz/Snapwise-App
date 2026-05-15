/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, memo } from 'react';

interface AgentComboboxProps {
  agentsList: any[];
  agentSearch: string;
  setAgentSearch: (val: string) => void;
  selectedAgent: string;
  setSelectedAgent: (val: string) => void;
  setSelectedPackage: (val: any) => void;
  setShowAgentModal: (val: boolean) => void;
}

export const AgentCombobox = memo(function AgentCombobox({
  agentsList,
  agentSearch,
  setAgentSearch,
  selectedAgent,
  setSelectedAgent,
  setSelectedPackage,
  setShowAgentModal
}: AgentComboboxProps) {
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const agentComboRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (agentComboRef.current && !agentComboRef.current.contains(e.target as Node)) {
        setShowAgentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAgents = agentsList.filter(agent => {
    const search = agentSearch.toLowerCase();
    if (!search) return true;
    const agencyName = agent.sub_agencies?.agencies?.name || agent.sub_agencies?.name || '';
    return agent.name.toLowerCase().includes(search) || agencyName.toLowerCase().includes(search);
  });

  return (
    <section className="space-y-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <span className="material-icons-outlined text-base">person</span> 1. Agent
      </h2>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <div ref={agentComboRef} className="relative">
          <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Search Agent</label>
          <div className="relative">
            <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              type="text"
              value={agentSearch}
              onChange={(e) => {
                setAgentSearch(e.target.value);
                setShowAgentDropdown(true);
                if (!e.target.value) {
                  setSelectedAgent('');
                  setSelectedPackage(null);
                }
              }}
              onFocus={() => setShowAgentDropdown(true)}
              placeholder="Search Agent..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-10 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            {selectedAgent && (
              <button 
                type="button"
                onClick={() => {
                  setSelectedAgent('');
                  setAgentSearch('');
                  setSelectedPackage(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-icons-outlined text-lg">close</span>
              </button>
            )}
          </div>

          {showAgentDropdown && (
            <div className="absolute z-40 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto custom-scrollbar">
              {filteredAgents.map(agent => {
                const agencyName = agent.sub_agencies?.agencies?.name || agent.sub_agencies?.name || '';
                const isActive = selectedAgent === agent.id;
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => {
                      setSelectedAgent(agent.id);
                      setAgentSearch(agent.name);
                      setShowAgentDropdown(false);
                      setSelectedPackage(null);
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-primary/5 transition-colors ${isActive ? 'bg-primary/10' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {agent.name}
                        {agencyName && <span className="text-slate-400 dark:text-slate-500 font-normal ml-1.5">({agencyName})</span>}
                      </span>
                    </div>
                    {isActive && <span className="material-icons-outlined text-primary text-sm">check</span>}
                  </button>
                );
              })}
              
              {filteredAgents.length === 0 && agentSearch && (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">No agents found</div>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowAgentDropdown(false);
                  setShowAgentModal(true);
                }}
                className="w-full text-left px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-primary text-sm font-bold hover:bg-primary/5 transition-colors flex items-center gap-2"
              >
                <span className="material-icons-outlined text-sm">add</span>
                Add New Agent
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});
