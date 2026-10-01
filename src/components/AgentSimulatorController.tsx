import React from 'react';
import { Play, Pause, Zap, PlusCircle, AlertOctagon, CloudUpload, RefreshCw } from 'lucide-react';

interface AgentSimulatorControllerProps {
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onAddAgents: () => void;
  onTriggerRandomSOS: () => void;
  onSyncHostinger: () => void;
  simulationSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export const AgentSimulatorController: React.FC<AgentSimulatorControllerProps> = ({
  isSimulating,
  onToggleSimulation,
  onAddAgents,
  onTriggerRandomSOS,
  onSyncHostinger,
  simulationSpeed,
  onChangeSpeed
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 glass-panel shadow-2xl flex items-center gap-3">
      {/* Botão Play / Pause */}
      <button
        onClick={onToggleSimulation}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
          isSimulating
            ? 'bg-amber-950 border border-amber-700 text-amber-300'
            : 'bg-emerald-950 border border-emerald-700 text-emerald-300'
        }`}
      >
        {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        <span>{isSimulating ? 'PAUSAR GPS' : 'INICIAR GPS'}</span>
      </button>

      <div className="w-[1px] h-5 bg-slate-800" />

      {/* Velocidades de Simulação */}
      <div className="flex items-center gap-1 font-mono text-[11px]">
        {[1, 2, 5].map(speed => (
          <button
            key={speed}
            onClick={() => onChangeSpeed(speed)}
            className={`px-2 py-1 rounded border transition-all ${
              simulationSpeed === speed
                ? 'bg-cyan-950 border-cyan-700 text-cyan-300 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>

      <div className="w-[1px] h-5 bg-slate-800" />

      {/* Adicionar +10 Agentes */}
      <button
        onClick={onAddAgents}
        className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors font-mono"
        title="Adicionar mais 10 agentes transponders em campo"
      >
        <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline">+10 AGENTES</span>
      </button>

      {/* Gerar Alerta SOS Aleatório */}
      <button
        onClick={onTriggerRandomSOS}
        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/60 hover:bg-red-950 border border-red-800 px-2.5 py-1.5 rounded-lg transition-colors font-mono font-bold"
        title="Simular disparo de alerta SOS de emergência"
      >
        <AlertOctagon className="w-3.5 h-3.5 text-red-500 animate-pulse" />
        <span className="hidden sm:inline">TESTE SOS</span>
      </button>

      <div className="w-[1px] h-5 bg-slate-800" />

      {/* Sincronizar Hostinger MySQL */}
      <button
        onClick={onSyncHostinger}
        className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-800 px-2.5 py-1.5 rounded-lg transition-colors font-mono"
        title="Enviar pacote de telemetria GPS para Hostinger MySQL"
      >
        <CloudUpload className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden md:inline">SYNC HOSTINGER</span>
      </button>
    </div>
  );
};
