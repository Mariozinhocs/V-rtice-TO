import { Agent, Objective } from '../types';

const API_BASE_URL = 'https://vertice.hubdigital360.com/lab/api';

export const apiService = {
  // Testar conectividade com a API Hostinger
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/check_db.php`, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  },

  // Sincronizar posição de um agente com o MySQL na Hostinger
  async syncAgentPosition(agent: Agent): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/to_sync_posicao.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agente_id: agent.id,
          nome_agente: agent.nome,
          latitude: agent.latitude,
          longitude: agent.longitude,
          velocidade_kmh: agent.velocidade_kmh,
          bateria_pct: agent.bateria_pct,
          status: agent.status
        })
      });
      return response.ok;
    } catch (err) {
      console.warn("Sync Hostinger offline, usando modo local:", err);
      return false;
    }
  },

  // Criar novo Objetivo no MySQL Hostinger
  async createObjective(obj: Partial<Objective>): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/to_criar_objetivo.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};
