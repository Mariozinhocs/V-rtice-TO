import React from 'react';
import { Agent } from '../types';
import { X, Activity, Clock, Map, TrendingUp, Calendar, Zap } from 'lucide-react';

interface AgentDetailsModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

export const AgentDetailsModal: React.FC<AgentDetailsModalProps> = ({ agent, isOpen, onClose }) => {
  if (!isOpen) return null;

  // Gerar dados fictícios consistentes baseados no ID do agente para o "Resumo"
  const seed = parseInt(agent.id.replace(/\D/g, '')) || 1;
  const kmDoDia = (seed % 150) + 20; // 20 a 170 km
  const horasTrabalhadas = (seed % 8) + 2; // 2 a 10 horas
  const missoesConcluidas = (seed % 15) + 1; // 1 a 16 missões
  const avaliacao = (4 + (seed % 10) / 10).toFixed(1); // 4.0 a 4.9

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm font-sans p-4">
      <div 
        className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center font-bold text-cyan-400 font-mono">
              {agent.matricula.replace('AG-', '')}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">{agent.nome}</h2>
              <p className="text-xs text-slate-400 font-mono">{agent.matricula} • {agent.equipe || 'Equipe Geral'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1 overflow-y-auto">
          {/* Seção de Status Atual */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-[10px] text-slate-500 font-mono font-bold uppercase mb-3">Status em Tempo Real</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Estado Atual</span>
                <span className="text-white font-bold text-sm uppercase mt-1">
                  {agent.status === 'libre' ? 'Livre' : agent.status === 'caminho' ? 'A Caminho' : agent.status === 'atendimento' ? 'Em Atendimento' : 'Emergência (SOS)'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Bateria</span>
                <span className={`font-bold text-sm mt-1 ${agent.bateria_pct < 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {agent.bateria_pct}%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Velocidade</span>
                <span className="text-white font-bold text-sm mt-1">{agent.velocidade_kmh} km/h</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Último Sinal</span>
                <span className="text-slate-200 font-mono text-sm mt-1">{agent.ultima_atualizacao}</span>
              </div>
            </div>
          </div>

          {/* Seção de Resumo do Dia */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-[10px] text-slate-500 font-mono font-bold uppercase mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Resumo do Turno (Hoje)
            </h3>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-cyan-400 font-mono">{kmDoDia}</div>
                <div className="text-[10px] text-slate-400 uppercase mt-0.5">Km Rodados</div>
              </div>
              
              <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-blue-400 font-mono">{horasTrabalhadas}h</div>
                <div className="text-[10px] text-slate-400 uppercase mt-0.5">Tempo Ativo</div>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-emerald-400 font-mono">{missoesConcluidas}</div>
                <div className="text-[10px] text-slate-400 uppercase mt-0.5">Corridas / Missões</div>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-amber-400 font-mono flex items-center justify-center gap-1">
                  {avaliacao} <span className="text-sm">★</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase mt-0.5">Avaliação Média</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <button 
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs font-mono transition-colors"
          >
            FECHAR DETALHES
          </button>
        </div>
      </div>
    </div>
  );
};
