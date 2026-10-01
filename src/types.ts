export type AgentStatus = 'libre' | 'caminho' | 'atendimento' | 'sos' | 'pendente_validacao' | 'inativo';
export type ConnectionStatus = 'online' | 'offline';
export type UserRole = 'admin' | 'agente';

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  matricula?: string;
}

export interface Agent {
  id: string;
  matricula: string;
  nome: string;
  cpf?: string;
  senha?: string;
  telefone: string;
  status: AgentStatus;
  status_conexao: ConnectionStatus;
  latitude: number;
  longitude: number;
  velocidade_kmh: number;
  bateria_pct: number;
  precisao_m: number;
  ultima_atualizacao: string;
  equipe?: string;
  objetivo_atual_id?: string;
  validado?: boolean;
  senha_temp?: string;
}

export interface Objective {
  id: string;
  passageiro_nome: string;
  origem_lat: number;
  origem_lng: number;
  destino_lat: number;
  destino_lng: number;
  status: 'aberto' | 'atribuido' | 'em_andamento' | 'concluido';
  assigned_agent_id?: string;
  assigned_agent_nome?: string;
  created_at: string;
  aceito_em?: string;
  concluido_em?: string;
  distancia_km?: number;
  instrucoes?: string;
}

export interface DispatchFilter {
  status: AgentStatus | 'todos';
  searchQuery: string;
  equipeFilter: string;
}
