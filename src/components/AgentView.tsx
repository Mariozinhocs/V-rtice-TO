import React, { useState, useEffect } from 'react';
import { Shield, MapPin, Navigation, ExternalLink, CheckCircle2, AlertOctagon, Phone, ArrowLeft, Radio, Bell, Sparkles } from 'lucide-react';
import { Agent, Objective } from '../types';
import { notificationService, PushNotificationPayload } from '../services/notificationService';

interface AgentViewProps {
  agent: Agent;
  objective?: Objective;
  notifications: PushNotificationPayload[];
  onCompleteObjective: (objectiveId: string) => void;
  onTriggerSOS: (agentId: string) => void;
  onBackToLogin: () => void;
}

export const AgentView: React.FC<AgentViewProps> = ({
  agent,
  objective,
  notifications,
  onCompleteObjective,
  onTriggerSOS,
  onBackToLogin
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeToast, setActiveToast] = useState<PushNotificationPayload | null>(null);

  // Solicitar permissão Push no carregamento inicial
  useEffect(() => {
    notificationService.requestPermission();
  }, []);

  // Monitorar novas notificações direcionadas a este agente
  useEffect(() => {
    const agentNotifs = notifications.filter(n => n.agentId === agent.id);
    if (agentNotifs.length > 0) {
      const latest = agentNotifs[agentNotifs.length - 1];
      setActiveToast(latest);
    }
  }, [notifications, agent.id]);

  // URLs para abrir Navegação Nativas nos aplicativos de preferência do agente (Manaus - AM)
  const targetLat = objective?.destino_lat || -3.0386;
  const targetLng = objective?.destino_lng || -60.0497;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}`;
  const wazeUrl = `https://waze.com/ul?ll=${targetLat},${targetLng}&navigate=yes`;
  const appleMapsUrl = `maps://?daddr=${targetLat},${targetLng}`;

  const handleCompleteTask = () => {
    if (objective) {
      onCompleteObjective(objective.id);
      setIsCompleted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-4 flex flex-col justify-between max-w-md mx-auto relative font-sans">
      {/* BANNER / TOAST DE NOTIFICAÇÃO PUSH NA TELA DO AGENTE */}
      {activeToast && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-950 via-cyan-950 to-emerald-950 border-2 border-cyan-400 rounded-2xl shadow-2xl animate-bounce relative z-50">
          <button
            onClick={() => setActiveToast(null)}
            className="absolute top-2 right-2 text-slate-400 hover:text-white text-xs font-mono"
          >
            ✕
          </button>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-900 border border-cyan-500 flex items-center justify-center text-cyan-300 flex-shrink-0">
              <Bell className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm">{activeToast.title}</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs text-slate-200 mt-0.5 leading-snug font-sans">{activeToast.body}</p>
              <span className="text-[10px] text-cyan-400 font-mono block mt-1">
                Recebido às {activeToast.timestamp}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBackToLogin}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white font-mono bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>SAIR / LOGIN ADM</span>
          </button>

          <div className="flex items-center gap-1.5 font-mono text-[10px] bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>GPS ATIVO (ONLINE)</span>
          </div>
        </div>

        {/* Card do Agente */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 mb-4 glass-panel shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg text-cyan-400 font-mono">
                {agent.matricula.replace('AG-', '')}
              </div>
              <div>
                <div className="font-bold text-white text-base">{agent.nome}</div>
                <div className="text-xs text-slate-400 font-mono">{agent.matricula} • {agent.equipe || 'Equipe Geral'}</div>
              </div>
            </div>

            {/* Badge de Validação ADM */}
            <div className="text-right">
              {agent.validado !== false ? (
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 font-bold block">
                  APROVADO ADM ✅
                </span>
              ) : (
                <span className="text-[10px] font-mono bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-800 font-bold block animate-pulse">
                  PENDENTE ADM
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tela de Mensagem da Missão / Objetivo */}
        {objective && !isCompleted ? (
          <div className="bg-slate-900/90 border border-blue-800/80 rounded-2xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-4 h-4" /> NOVA DESIGNAÇÃO RECEBIDA
              </span>
              <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-700">
                EM ANDAMENTO
              </span>
            </div>

            {/* Dados do Passageiro / Solicitante */}
            <div>
              <span className="text-[10px] text-slate-400 font-mono block uppercase">SOLICITANTE / PASSAGEIRO</span>
              <div className="text-sm font-bold text-white mt-0.5">{objective.passageiro_nome}</div>
            </div>

            {/* Origem e Destino */}
            <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">PONTO DE ORIGEM</span>
                  <span className="text-slate-200 font-medium">Teatro Amazonas (Centro - Manaus)</span>
                </div>
              </div>

              <div className="w-[1px] h-3 bg-slate-800 ml-2" />

              <div className="flex items-start gap-2">
                <Navigation className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">DESTINO FINAL</span>
                  <span className="text-slate-200 font-medium">Aeroporto Eduardo Gomes (Manaus)</span>
                </div>
              </div>
            </div>

            {/* Seleção do Aplicativo de Navegação Nativo */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 font-mono uppercase mb-2">
                ABRIR NAVEGAÇÃO NO SEU APP FAVORITO:
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl text-center transition-colors group"
                >
                  <span className="text-lg mb-1">🗺️</span>
                  <span className="text-[10px] font-bold text-slate-200 group-hover:text-white font-mono">GOOGLE MAPS</span>
                </a>

                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl text-center transition-colors group"
                >
                  <span className="text-lg mb-1">🚗</span>
                  <span className="text-[10px] font-bold text-cyan-300 group-hover:text-cyan-200 font-mono">WAZE</span>
                </a>

                <a
                  href={appleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl text-center transition-colors group"
                >
                  <span className="text-lg mb-1">🍏</span>
                  <span className="text-[10px] font-bold text-slate-200 group-hover:text-white font-mono">APPLE MAPS</span>
                </a>
              </div>
            </div>

            {/* Botão Concluir Tarefa */}
            <button
              onClick={handleCompleteTask}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95 mt-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>MARCAR MISSÃO COMO CONCLUÍDA</span>
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-bold text-white text-sm">NENHUMA TAREFA PENDENTE</h3>
            <p className="text-xs text-slate-400">
              Você está com status <strong className="text-emerald-400 uppercase">LIVRE</strong>. Aguarde chamados da central de operações.
            </p>
          </div>
        )}
      </div>

      {/* Botão de Emergência SOS */}
      <div className="pt-4 mt-auto">
        <button
          onClick={() => onTriggerSOS(agent.id)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-950 hover:bg-red-900 border border-red-800 text-red-400 rounded-xl font-mono font-bold text-xs transition-colors active:scale-98 shadow-xl shadow-red-950/50"
        >
          <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" />
          <span>DISPARAR BOTÃO DE EMERGÊNCIA SOS</span>
        </button>
      </div>
    </div>
  );
};
