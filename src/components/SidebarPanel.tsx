import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Navigation, AlertOctagon, Settings, 
  Search, Filter, Phone, Battery, Gauge, MapPin, ChevronRight, 
  ChevronLeft, AlertTriangle, ShieldCheck, Activity, LogOut,
  UserCheck, UserX, Clock, FileText, Send, Lock, Wifi, WifiOff
} from 'lucide-react';
import { Agent, AgentStatus, Objective } from '../types';
import { MissionsReportPanel } from './MissionsReportPanel';

interface SidebarPanelProps {
  agents: Agent[];
  objectives: Objective[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  onDoubleClickAgent: (agent: Agent) => void;
  onApproveAgent: (agentId: string, tempPass: string) => void;
  onRejectAgent: (agentId: string) => void;
  onTriggerSOSMock: (agentId: string) => void;
  onOpenDispatchModal: () => void;
  onLogout: () => void;
}

export type SidebarTab = 'dashboard' | 'agentes' | 'pendentes' | 'operacoes' | 'relatorios' | 'sos' | 'config';

export const SidebarPanel: React.FC<SidebarPanelProps> = ({
  agents,
  objectives,
  selectedAgentId,
  onSelectAgent,
  onDoubleClickAgent,
  onApproveAgent,
  onRejectAgent,
  onTriggerSOSMock,
  onOpenDispatchModal,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('agentes');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'todos'>('todos');

  const pendingAgents = agents.filter(a => a.status === 'pendente_validacao' || a.validado === false);
  const activeAgents = agents.filter(a => a.status !== 'pendente_validacao' && a.validado !== false);
  const sosAgents = agents.filter(a => a.status === 'sos');
  const activeObjectives = objectives.filter(o => o.status !== 'concluido');

  // Filtragem de Agentes Ativos
  const filteredAgents = activeAgents.filter(agent => {
    const matchesSearch = agent.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.matricula.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (agent.equipe && agent.equipe.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' || agent.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  // Função para gerar senha temporária e aprovar enviando via WhatsApp
  const handleApproveWithCredentials = (agent: Agent) => {
    const tempPass = `vtc${Math.floor(100 + Math.random() * 900)}`;
    onApproveAgent(agent.id, tempPass);

    const baseUrl = window.location.origin + window.location.pathname;
    const loginAgentUrl = `${baseUrl}?view=agent_login`;

    const credentialsMessage = `*CADASTRO APROVADO — VÉRTICE TEATRO DE OPERAÇÕES*\n\n` +
      `Olá *${agent.nome}*! Seu credenciamento de campo foi validado com sucesso pelo Administrador.\n\n` +
      `🔑 *CREDENCIAIS DE ACESSO:*\n` +
      `👤 *Usuário / Matrícula:* ${agent.matricula}\n` +
      `🔒 *Senha Temporária:* ${tempPass}\n\n` +
      `👉 *Acesse o sistema aqui:* ${loginAgentUrl}\n\n` +
      `_Ao fazer login, seu transponder ficará ONLINE no mapa da Central de Operações._`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=55${agent.telefone.replace(/\D/g, '')}&text=${encodeURIComponent(credentialsMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] z-20 font-sans">
      {/* 1. NAVIGATION RAIL (Barra Vertical de Ícones Fixos à Esquerda) */}
      <aside className="w-16 bg-[#090d16] border-r border-slate-800/80 flex flex-col items-center py-3 justify-between z-30 shadow-2xl">
        {/* Topo: Ícones de Navegação Principais */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          {/* Aba Agentes */}
          <button
            onClick={() => { setActiveTab('agentes'); setIsDrawerOpen(true); }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center relative transition-all group ${
              activeTab === 'agentes' && isDrawerOpen
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-700/80 shadow-lg shadow-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Agentes Transponders em Campo"
          >
            <Users className="w-5 h-5" />
            <span className="absolute left-14 bg-slate-900 text-white font-mono text-[11px] px-2 py-1 rounded border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
              Agentes ({activeAgents.length})
            </span>
          </button>

          {/* Aba Agentes Pendentes de Validação ADM */}
          <button
            onClick={() => { setActiveTab('pendentes'); setIsDrawerOpen(true); }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center relative transition-all group ${
              activeTab === 'pendentes' && isDrawerOpen
                ? 'bg-amber-950 text-amber-400 border border-amber-700/80 shadow-lg shadow-amber-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Aprovar Cadastros de Agentes (WhatsApp)"
          >
            <UserCheck className="w-5 h-5" />
            {pendingAgents.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-mono text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#090d16] animate-pulse">
                {pendingAgents.length}
              </span>
            )}
            <span className="absolute left-14 bg-slate-900 text-white font-mono text-[11px] px-2 py-1 rounded border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
              Validação ADM ({pendingAgents.length})
            </span>
          </button>

          {/* Aba Operações & Dispatch */}
          <button
            onClick={() => { setActiveTab('operacoes'); setIsDrawerOpen(true); }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center relative transition-all group ${
              activeTab === 'operacoes' && isDrawerOpen
                ? 'bg-blue-950 text-blue-400 border border-blue-700/80 shadow-lg shadow-blue-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Operações & Dispatchs Ativos"
          >
            <Navigation className="w-5 h-5" />
            {activeObjectives.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            )}
            <span className="absolute left-14 bg-slate-900 text-white font-mono text-[11px] px-2 py-1 rounded border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
              Dispatchs ({activeObjectives.length})
            </span>
          </button>

          {/* Aba Painel de Relatórios & Histórico de Missões */}
          <button
            onClick={() => { setActiveTab('relatorios'); setIsDrawerOpen(true); }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center relative transition-all group ${
              activeTab === 'relatorios' && isDrawerOpen
                ? 'bg-indigo-950 text-indigo-400 border border-indigo-700/80 shadow-lg shadow-indigo-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Relatórios & Histórico de Missões"
          >
            <FileText className="w-5 h-5" />
            <span className="absolute left-14 bg-slate-900 text-white font-mono text-[11px] px-2 py-1 rounded border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
              Relatórios
            </span>
          </button>

          {/* Aba Alertas SOS */}
          <button
            onClick={() => { setActiveTab('sos'); setIsDrawerOpen(true); }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center relative transition-all group ${
              activeTab === 'sos' && isDrawerOpen
                ? 'bg-red-950 text-red-400 border border-red-700/80 shadow-lg shadow-red-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Alertas SOS de Emergência"
          >
            <AlertOctagon className={`w-5 h-5 ${sosAgents.length > 0 ? 'text-red-500 animate-bounce' : ''}`} />
            {sosAgents.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-mono text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#090d16]">
                {sosAgents.length}
              </span>
            )}
            <span className="absolute left-14 bg-slate-900 text-white font-mono text-[11px] px-2 py-1 rounded border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
              Alertas SOS ({sosAgents.length})
            </span>
          </button>

          {/* Aba Configurações */}
          <button
            onClick={() => { setActiveTab('config'); setIsDrawerOpen(true); }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center relative transition-all group ${
              activeTab === 'config' && isDrawerOpen
                ? 'bg-slate-800 text-slate-200 border border-slate-600'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Configurações do Teatro de Operações"
          >
            <Settings className="w-5 h-5" />
            <span className="absolute left-14 bg-slate-900 text-white font-mono text-[11px] px-2 py-1 rounded border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
              Configurações
            </span>
          </button>
        </div>

        {/* Rodapé: Expandir/Recolher Gaveta + Logout */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title={isDrawerOpen ? "Recolher Gaveta Lateral" : "Expandir Gaveta Lateral"}
          >
            {isDrawerOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          <button
            onClick={onLogout}
            className="w-10 h-10 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-400 flex items-center justify-center transition-colors"
            title="Sair do Painel ADM"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. GAVETA DE CONTEÚDO EXPANSÍVEL */}
      {isDrawerOpen && (
        <aside className="w-80 md:w-96 bg-[#0f172a]/95 border-r border-slate-800 flex flex-col h-full z-20 glass-panel shadow-2xl transition-all">
          {/* TÍTULO DA ABA ATIVA */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2">
              {activeTab === 'agentes' && <Users className="w-4 h-4 text-cyan-400" />}
              {activeTab === 'pendentes' && <UserCheck className="w-4 h-4 text-amber-400" />}
              {activeTab === 'operacoes' && <Navigation className="w-4 h-4 text-blue-400" />}
              {activeTab === 'relatorios' && <FileText className="w-4 h-4 text-indigo-400" />}
              {activeTab === 'sos' && <AlertOctagon className="w-4 h-4 text-red-500" />}
              {activeTab === 'config' && <Settings className="w-4 h-4 text-slate-400" />}

              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                {activeTab === 'agentes' && `Transponders de Campo (${activeAgents.length})`}
                {activeTab === 'pendentes' && `Validação ADM (${pendingAgents.length})`}
                {activeTab === 'operacoes' && `Operações & Dispatchs (${activeObjectives.length})`}
                {activeTab === 'relatorios' && 'Relatórios & Histórico de Missões'}
                {activeTab === 'sos' && `Alertas de Emergência (${sosAgents.length})`}
                {activeTab === 'config' && 'Configurações de Operação'}
              </h2>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-slate-500 hover:text-slate-300 text-xs font-mono"
            >
              FECHAR ✕
            </button>
          </div>

          {/* ABA AGENTES ATIVOS (Exibe status ONLINE / OFFLINE) */}
          {activeTab === 'agentes' && (
            <>
              <div className="p-3 border-b border-slate-800 space-y-2 font-mono">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar agente, matrícula..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>💡 Duplo-clique para centralizar no mapa</span>
                </div>
              </div>

              {/* Lista Scrollável de Transponders */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                {filteredAgents.map(agent => {
                  const isSelected = agent.id === selectedAgentId;
                  const isOnline = agent.status_conexao === 'online';

                  return (
                    <div
                      key={agent.id}
                      onClick={() => onSelectAgent(agent.id)}
                      onDoubleClick={() => onDoubleClickAgent(agent)}
                      title="Clique para selecionar • Duplo-clique para centralizar no mapa"
                      className={`p-3 transition-all cursor-pointer flex items-center justify-between group select-none ${
                        isSelected ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400 pl-2.5' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          agent.status === 'libre' ? 'bg-emerald-500' :
                          agent.status === 'caminho' ? 'bg-amber-500' :
                          agent.status === 'atendimento' ? 'bg-[#9aa3b3]' : 'bg-red-500 animate-ping'
                        }`} />

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {agent.nome}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">({agent.matricula})</span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                            <span>{agent.equipe || 'Geral'}</span>
                            <span>•</span>
                            <span className={isOnline ? 'text-emerald-400 flex items-center gap-0.5' : 'text-slate-500 flex items-center gap-0.5'}>
                              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                              {isOnline ? 'ONLINE' : 'OFFLINE'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ABA VALIDAÇÃO DE AGENTES CADASTRADOS VIA WHATSAPP (ADM) */}
          {activeTab === 'pendentes' && (
            <div className="p-4 space-y-3 flex-1 overflow-y-auto font-sans">
              {pendingAgents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-mono bg-slate-950 rounded-xl border border-slate-800">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>Todos os agentes cadastrados estão validados. Nenhuma solicitação pendente!</span>
                </div>
              ) : (
                pendingAgents.map(agent => (
                  <div key={agent.id} className="p-3.5 bg-slate-900 border border-amber-800/80 rounded-xl space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-xs">{agent.nome}</div>
                        <div className="text-[10px] font-mono text-amber-400">Tel: {agent.telefone}</div>
                      </div>
                      <span className="text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-bold">
                        PENDENTE VALIDAÇÃO
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                      <div>Rastreio GPS: <strong className="text-emerald-400">AUTORIZADO PELO AGENTE ✅</strong></div>
                      <div>Status Inicial: <strong className="text-slate-400">CADASTRADO / OFFLINE</strong></div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 font-mono">
                      <button
                        onClick={() => handleApproveWithCredentials(agent)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                        title="Aprovar e enviar login/senha temporária via WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>APROVAR & ENVIAR CREDENCIAIS VIA WHATSAPP</span>
                      </button>

                      <button
                        onClick={() => onRejectAgent(agent.id)}
                        className="px-3 py-2 bg-slate-800 hover:bg-red-950 hover:text-red-300 border border-slate-700 text-slate-400 rounded-lg text-xs font-bold transition-colors"
                        title="Rejeitar solicitação"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ABA OPERAÇÕES & DISPATCHS */}
          {activeTab === 'operacoes' && (
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              <button
                onClick={onOpenDispatchModal}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/30 font-mono"
              >
                <Navigation className="w-4 h-4" />
                <span>CRIAR NOVO DISPATCH</span>
              </button>

              <div className="space-y-2">
                <h3 className="text-[11px] font-mono font-bold text-slate-400 uppercase">CHAMADOS ATIVOS DA OPERAÇÃO</h3>
                {activeObjectives.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 font-mono bg-slate-950 rounded-lg border border-slate-800">
                    Nenhum chamado ativo no momento.
                  </div>
                ) : (
                  activeObjectives.map(obj => (
                    <div key={obj.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 font-sans">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{obj.passageiro_nome}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          {obj.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Agente Atribuído: <strong className="text-cyan-400">{obj.assigned_agent_nome || obj.assigned_agent_id || 'Aguardando'}</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ABA RELATÓRIOS & HISTÓRICO DE MISSÕES */}
          {activeTab === 'relatorios' && (
            <MissionsReportPanel objectives={objectives} />
          )}

          {/* ABA ALERTAS SOS */}
          {activeTab === 'sos' && (
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {sosAgents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-mono bg-slate-950 rounded-xl border border-slate-800">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>Nenhum alerta de emergência ativo. Todos os agentes seguros.</span>
                </div>
              ) : (
                sosAgents.map(agent => (
                  <div key={agent.id} className="p-3 bg-red-950/80 border border-red-700/80 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{agent.nome}</span>
                      <span className="font-mono text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold animate-pulse">
                        EMERGÊNCIA SOS
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-red-200">
                      Matrícula: {agent.matricula} • Equipe: {agent.equipe}
                    </div>
                    <button
                      onClick={() => onSelectAgent(agent.id)}
                      className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold font-mono"
                    >
                      FOCAR NO MAPA
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ABA CONFIGURAÇÕES */}
          {activeTab === 'config' && (
            <div className="p-4 space-y-4 font-mono text-xs flex-1 overflow-y-auto">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 block text-[10px]">SERVIDOR REST & MYSQL</span>
                <div className="text-white font-bold">Hostinger MySQL (u576215103_vertice)</div>
                <div className="text-emerald-400 text-[11px]">URL: vertice.hubdigital360.com/TO/lab</div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 block text-[10px]">PARAMETROS DO TEATRO DE OPERAÇÕES</span>
                <div>Agentes Simulado: <strong>100 Transponders</strong></div>
                <div>Frequência de Envio GPS: <strong>1 a 5s</strong></div>
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
};
