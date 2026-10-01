import React from 'react';
import { Shield, Radio, Activity, AlertTriangle, Users, Navigation, RefreshCw, Share2, Maximize } from 'lucide-react';
import { Agent, AgentStatus } from '../types';

interface NavbarProps {
  agents: Agent[];
  statusFilter: AgentStatus | 'todos';
  onStatusFilterChange: (status: AgentStatus | 'todos') => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onOpenDispatchModal: () => void;
  onOpenShareLinkModal: () => void;
  isHostingerConnected: boolean;
  onFitMapBounds?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  agents,
  isSimulating,
  onToggleSimulation,
  onOpenDispatchModal,
  onOpenShareLinkModal,
  isHostingerConnected,
  statusFilter,
  onStatusFilterChange,
  onFitMapBounds
}) => {
  const totalAgents = agents.length;
  const libres = agents.filter(a => a.status === 'libre').length;
  const aCaminho = agents.filter(a => a.status === 'caminho').length;
  const emAtendimento = agents.filter(a => a.status === 'atendimento').length;
  const sosAlerts = agents.filter(a => a.status === 'sos').length;

  return (
    <header className="h-16 bg-[#0f172a]/95 border-b border-slate-800 px-4 flex items-center justify-between z-30 relative glass-panel">
      {/* Esquerda: Logo & Título */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[2px] shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-wide">VÉRTICE</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold tracking-wider">
              TEATRO DE OPERAÇÕES
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">Central de Rastreio & Dispatch de Campo</p>
        </div>
      </div>

      {/* Meio: KPIs & Status dos Transponders (Filtros) */}
      <div className="hidden md:flex items-center gap-4 bg-slate-900/80 px-4 py-1.5 rounded-lg border border-slate-800 font-mono text-xs">
        <button
          onClick={onFitMapBounds}
          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700 shadow-sm"
          title="Ajustar zoom do mapa para encaixar os agentes filtrados"
        >
          <Maximize className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-slate-800" />

        <div 
          onClick={() => onStatusFilterChange('todos')}
          className={`flex items-center gap-2 cursor-pointer transition-all hover:opacity-100 ${statusFilter === 'todos' ? 'opacity-100 scale-105 font-bold' : 'opacity-60'}`}
        >
          <Users className={`w-4 h-4 ${statusFilter === 'todos' ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span className={statusFilter === 'todos' ? 'text-cyan-300' : 'text-slate-300'}>Total: <strong className="text-white">{totalAgents}</strong></span>
        </div>

        <div className="w-[1px] h-4 bg-slate-800" />

        <div 
          onClick={() => onStatusFilterChange('libre')}
          className={`flex items-center gap-2 cursor-pointer transition-all hover:opacity-100 ${statusFilter === 'libre' ? 'opacity-100 scale-105 font-bold' : 'opacity-60'}`}
        >
          <span className={`w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 ${statusFilter === 'libre' ? 'animate-pulse ring-2 ring-emerald-500 ring-offset-1 ring-offset-slate-900' : ''}`} />
          <span className={statusFilter === 'libre' ? 'text-white' : 'text-slate-400'}>Livre: <strong className="text-emerald-400">{libres}</strong></span>
        </div>

        <div className="w-[1px] h-4 bg-slate-800" />

        <div 
          onClick={() => onStatusFilterChange('caminho')}
          className={`flex items-center gap-2 cursor-pointer transition-all hover:opacity-100 ${statusFilter === 'caminho' ? 'opacity-100 scale-105 font-bold' : 'opacity-60'}`}
        >
          <span className={`w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50 ${statusFilter === 'caminho' ? 'animate-pulse ring-2 ring-amber-500 ring-offset-1 ring-offset-slate-900' : ''}`} />
          <span className={statusFilter === 'caminho' ? 'text-white' : 'text-slate-400'}>A Caminho: <strong className="text-amber-400">{aCaminho}</strong></span>
        </div>

        <div className="w-[1px] h-4 bg-slate-800" />

        <div 
          onClick={() => onStatusFilterChange('atendimento')}
          className={`flex items-center gap-2 cursor-pointer transition-all hover:opacity-100 ${statusFilter === 'atendimento' ? 'opacity-100 scale-105 font-bold' : 'opacity-60'}`}
        >
          <span className={`w-2.5 h-2.5 rounded-full bg-[#9aa3b3] shadow-sm shadow-[#9aa3b3]/50 ${statusFilter === 'atendimento' ? 'animate-pulse ring-2 ring-[#9aa3b3] ring-offset-1 ring-offset-slate-900' : ''}`} />
          <span className={statusFilter === 'atendimento' ? 'text-white' : 'text-slate-400'}>Atendimento: <strong className="text-[#9aa3b3]">{emAtendimento}</strong></span>
        </div>

        {sosAlerts > 0 && (
          <>
            <div className="w-[1px] h-4 bg-slate-800" />
            <div 
              onClick={() => onStatusFilterChange('sos')}
              className={`flex items-center gap-2 px-2 py-0.5 rounded border cursor-pointer transition-all hover:opacity-100 ${
                statusFilter === 'sos' 
                  ? 'bg-red-900/90 border-red-500 text-red-300 scale-105 shadow-md shadow-red-900/50' 
                  : 'bg-red-950/80 border-red-800 text-red-400 opacity-80'
              } animate-bounce`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span>SOS: <strong>{sosAlerts}</strong></span>
            </div>
          </>
        )}
      </div>

      {/* Direita: Ações do Operador */}
      <div className="flex items-center gap-3">
        {/* Indicador de Conexão Hostinger MySQL */}
        <div className={`hidden lg:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border ${
          isHostingerConnected 
            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' 
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isHostingerConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
          <span>{isHostingerConnected ? 'HOSTINGER MYSQL ON' : 'MODO LOCAL SIMULADO'}</span>
        </div>

        {/* Botão Simulação GPS */}
        <button
          onClick={onToggleSimulation}
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
            isSimulating
              ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300 shadow-md shadow-cyan-900/40'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title="Alternar Simulação em Tempo Real dos Transponders GPS"
        >
          <Radio className={`w-4 h-4 ${isSimulating ? 'text-cyan-400 animate-spin' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">{isSimulating ? 'GPS SIMULANDO (EM TEMPO REAL)' : 'PAUSADO'}</span>
        </button>

        {/* Botão Gerar Link de Cadastro de Agente */}
        <button
          onClick={onOpenShareLinkModal}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 hover:bg-emerald-900 transition-all font-mono shadow-md shadow-emerald-950/50"
          title="Gerar link público ou convite via WhatsApp para cadastro de novos agentes"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>GERAR LINK DE CADASTRO</span>
        </button>

        {/* Botão Novo Objetivo / Dispatch */}
        <button
          onClick={onOpenDispatchModal}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-lg shadow-blue-600/30 transition-all active:scale-95"
        >
          <Navigation className="w-4 h-4" />
          <span>NOVO DISPATCH</span>
        </button>
      </div>
    </header>
  );
};
