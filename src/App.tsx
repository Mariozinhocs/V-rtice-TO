import React, { useState, useEffect, useCallback } from 'react';
import { Agent, Objective, AuthUser, AgentStatus } from './types';
import { generateInitialAgents, simulateMovementTick } from './services/mockAgentGenerator';
import { apiService } from './services/apiService';
import { notificationService, PushNotificationPayload } from './services/notificationService';
import { Navbar } from './components/Navbar';
import { SidebarPanel } from './components/SidebarPanel';
import { MapControl } from './components/MapControl';
import { DispatchModal } from './components/DispatchModal';
import { AgentSimulatorController } from './components/AgentSimulatorController';
import { LoginModal } from './components/LoginModal';
import { AgentView } from './components/AgentView';
import { WhatsAppRegisterModal } from './components/WhatsAppRegisterModal';
import { ShareLinkModal } from './components/ShareLinkModal';

const LOCAL_STORAGE_VIEW_KEY = 'vertice_to_view_mode';
const LOCAL_STORAGE_USER_KEY = 'vertice_to_current_user';
const LOCAL_STORAGE_SELECTED_AGENT_KEY = 'vertice_to_selected_agent_id';

export function App() {
  const [agents, setAgents] = useState<Agent[]>(() => generateInitialAgents(100));

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_SELECTED_AGENT_KEY) || null;
  });

  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);
  const [flyToCoords, setFlyToCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [notifications, setNotifications] = useState<PushNotificationPayload[]>([]);

  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);
  const [isWhatsAppRegisterOpen, setIsWhatsAppRegisterOpen] = useState<boolean>(false);
  const [isShareLinkOpen, setIsShareLinkOpen] = useState<boolean>(false);
  const [isHostingerConnected, setIsHostingerConnected] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'todos'>('todos');

  // Estado de Autenticação com persistência para F5
  const [viewMode, setViewMode] = useState<'login' | 'admin_dashboard' | 'agent_view'>(() => {
    const savedMode = localStorage.getItem(LOCAL_STORAGE_VIEW_KEY) as 'login' | 'admin_dashboard' | 'agent_view';
    return savedMode || 'login';
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch { return null; }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_VIEW_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (selectedAgentId) {
      localStorage.setItem(LOCAL_STORAGE_SELECTED_AGENT_KEY, selectedAgentId);
    }
  }, [selectedAgentId]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'register' || urlParams.get('register') === 'true') {
      setIsWhatsAppRegisterOpen(true);
    }
  }, []);

  useEffect(() => {
    apiService.testConnection().then(connected => {
      setIsHostingerConnected(connected);
    });
  }, []);

  // Loop de Simulação de GPS em Tempo Real
  useEffect(() => {
    if (!isSimulating) return;

    const intervalMs = Math.max(200, 1000 / simulationSpeed);

    const timer = setInterval(() => {
      setAgents(prevAgents => simulateMovementTick(prevAgents, objectives, hoveredAgentId));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isSimulating, simulationSpeed, objectives, hoveredAgentId]);

  const handleSelectAgent = useCallback((agentId: string) => {
    setSelectedAgentId(agentId);
  }, []);

  const handleHoverAgent = useCallback((agentId: string | null) => {
    setHoveredAgentId(agentId);
  }, []);

  const handleDoubleClickAgent = useCallback((agent: Agent) => {
    setSelectedAgentId(agent.id);
    setFlyToCoords({ lat: agent.latitude, lng: agent.longitude });
  }, []);

  // TRIGGER 1: APROVAÇÃO DO CADASTRO PELO ADM -> DISPARAR PUSH NOTIFICATION
  const handleApproveAgent = (agentId: string) => {
    const targetAgent = agents.find(a => a.id === agentId);
    const agentName = targetAgent ? targetAgent.nome : 'Agente';

    setAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, validado: true, status: 'libre' } : ag));

    const title = 'Vértice-TO — Cadastro Aprovado!';
    const body = `Olá ${agentName}! Seu credenciamento foi validado pelo Administrador. Seu transponder está ativo no Teatro de Operações (Manaus - AM).`;

    // 1. Disparar Web Push Nativo no Navegador
    notificationService.sendNativePush(title, body);

    // 2. Registrar no Estado de Notificações
    const newNotif: PushNotificationPayload = {
      id: `notif-${Date.now()}`,
      agentId,
      title,
      body,
      type: 'approval',
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };

    setNotifications(prev => [...prev, newNotif]);
  };

  const handleRejectAgent = (agentId: string) => {
    setAgents(prev => prev.filter(ag => ag.id !== agentId));
  };

  // TRIGGER 2: DESIGNAÇÃO DE NOVA MISSÃO / DISPATCH PELO ADM -> DISPARAR PUSH NOTIFICATION
  const handleDispatchObjective = (newObj: Partial<Objective>, assignedAgentId: string) => {
    const createdObj: Objective = {
      id: `obj-${Date.now()}`,
      passageiro_nome: newObj.passageiro_nome || 'Passageiro de Operação',
      origem_lat: newObj.origem_lat || -3.10719,
      origem_lng: newObj.origem_lng || -60.0261,
      destino_lat: newObj.destino_lat || -3.0386,
      destino_lng: newObj.destino_lng || -60.0497,
      status: 'atribuido',
      assigned_agent_id: assignedAgentId,
      created_at: new Date().toISOString()
    };

    setObjectives(prev => [...prev, createdObj]);

    setAgents(prev => prev.map(ag => {
      if (ag.id === assignedAgentId) {
        return {
          ...ag,
          status: 'caminho',
          objetivo_atual_id: createdObj.id
        };
      }
      return ag;
    }));

    setSelectedAgentId(assignedAgentId);

    // Disparar Web Push Nativo de Nova Missão para o Agente Designado
    const title = 'Vértice-TO — Nova Missão Designada! 🎯';
    const body = `Você recebeu um chamado de campo: ${createdObj.passageiro_nome}. Abra o aplicativo para iniciar a navegação.`;

    notificationService.sendNativePush(title, body);

    const newNotif: PushNotificationPayload = {
      id: `notif-${Date.now()}`,
      agentId: assignedAgentId,
      title,
      body,
      type: 'mission',
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };

    setNotifications(prev => [...prev, newNotif]);

    if (isHostingerConnected) {
      apiService.createObjective(createdObj);
    }
  };

  const handleAddAgents = () => {
    const newAgents = generateInitialAgents(10).map((ag, idx) => ({
      ...ag,
      id: `agent-${agents.length + idx + 1}`,
      matricula: `AG-${1000 + agents.length + idx + 1}`,
      nome: `${ag.nome} (Novo)`
    }));
    setAgents(prev => [...prev, ...newAgents]);
  };

  const handleRegisterAgentSuccess = (newAgent: Agent) => {
    setAgents(prev => [newAgent, ...prev]);
    setSelectedAgentId(newAgent.id);
  };

  const handleTriggerSOSMock = (agentId: string) => {
    setAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, status: 'sos' } : ag));
    setSelectedAgentId(agentId);
  };

  const handleTriggerRandomSOS = () => {
    if (agents.length === 0) return;
    const randomIndex = Math.floor(Math.random() * agents.length);
    const targetAgent = agents[randomIndex];
    handleTriggerSOSMock(targetAgent.id);
  };

  const handleCompleteObjective = (objectiveId: string) => {
    setObjectives(prev => prev.map(o => o.id === objectiveId ? { ...o, status: 'concluido' } : o));
    setAgents(prev => prev.map(ag => ag.objetivo_atual_id === objectiveId ? { ...ag, status: 'libre', objetivo_atual_id: undefined } : ag));
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    setViewMode('admin_dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_VIEW_KEY);
    setViewMode('login');
  };

  const handleSyncHostinger = async () => {
    if (agents.length === 0) return;

    const sample = agents.slice(0, 5);
    let successCount = 0;

    for (const ag of sample) {
      const ok = await apiService.syncAgentPosition(ag);
      if (ok) successCount++;
    }

    alert(`Sincronização enviada para Hostinger MySQL! ${successCount}/${sample.length} pacotes aceitos.`);
  };

  if (viewMode === 'login') {
    return (
      <>
        <LoginModal
          onLoginSuccess={handleLoginSuccess}
          onSwitchToAgentView={() => { setViewMode('agent_view'); localStorage.setItem(LOCAL_STORAGE_VIEW_KEY, 'agent_view'); }}
          onOpenWhatsAppRegister={() => setIsWhatsAppRegisterOpen(true)}
        />
        <WhatsAppRegisterModal
          isOpen={isWhatsAppRegisterOpen}
          onClose={() => setIsWhatsAppRegisterOpen(false)}
          onRegisterAgentSuccess={handleRegisterAgentSuccess}
        />
      </>
    );
  }

  if (viewMode === 'agent_view') {
    const demoAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
    const activeObj = objectives.find(o => o.assigned_agent_id === demoAgent.id && o.status !== 'concluido');

    return (
      <AgentView
        agent={demoAgent}
        objective={activeObj}
        notifications={notifications}
        onCompleteObjective={handleCompleteObjective}
        onTriggerSOS={handleTriggerSOSMock}
        onBackToLogin={handleLogout}
      />
    );
  }

  const filteredAgents = statusFilter === 'todos' ? agents : agents.filter(a => a.status === statusFilter);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090d16] text-[#f8fafc] font-sans">
      <Navbar
        agents={agents}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
        onOpenShareLinkModal={() => setIsShareLinkOpen(true)}
        isHostingerConnected={isHostingerConnected}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <SidebarPanel
          agents={filteredAgents}
          objectives={objectives}
          selectedAgentId={selectedAgentId}
          onSelectAgent={handleSelectAgent}
          onDoubleClickAgent={handleDoubleClickAgent}
          onApproveAgent={handleApproveAgent}
          onRejectAgent={handleRejectAgent}
          onTriggerSOSMock={handleTriggerSOSMock}
          onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
          onLogout={handleLogout}
        />

        <div className="flex-1 h-full relative">
          <MapControl
            agents={filteredAgents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={handleSelectAgent}
            onHoverAgent={handleHoverAgent}
            objectives={objectives}
            flyToCoords={flyToCoords}
            statusFilter={statusFilter}
          />

          <AgentSimulatorController
            isSimulating={isSimulating}
            onToggleSimulation={() => setIsSimulating(!isSimulating)}
            onAddAgents={handleAddAgents}
            onTriggerRandomSOS={handleTriggerRandomSOS}
            onSyncHostinger={handleSyncHostinger}
            simulationSpeed={simulationSpeed}
            onChangeSpeed={setSimulationSpeed}
          />
        </div>
      </div>

      <DispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        agents={filteredAgents}
        onDispatchObjective={handleDispatchObjective}
      />

      <WhatsAppRegisterModal
        isOpen={isWhatsAppRegisterOpen}
        onClose={() => setIsWhatsAppRegisterOpen(false)}
        onRegisterAgentSuccess={handleRegisterAgentSuccess}
      />

      <ShareLinkModal
        isOpen={isShareLinkOpen}
        onClose={() => setIsShareLinkOpen(false)}
      />
    </div>
  );
}

export default App;
