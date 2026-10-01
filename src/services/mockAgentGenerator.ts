import { Agent, AgentStatus, Objective } from '../types';

// Coordenadas centrais da operação (Teatro de Operações - Manaus / AM)
const CENTER_LAT = -3.10719;
const CENTER_LNG = -60.0261;

const PRIMEIROS_NOMES = [
  'Carlos', 'Ana', 'Marcos', 'Fernanda', 'Lucas', 'Juliana', 'Rodrigo', 'Patricia',
  'Gabriel', 'Camila', 'Felipe', 'Beatriz', 'Diego', 'Mariana', 'Bruno', 'Larissa',
  'Eduardo', 'Amanda', 'Vinicius', 'Letícia', 'Thiago', 'Vanessa', 'Gustavo', 'Carla',
  'Alexandre', 'Aline', 'Leonardo', 'Renata', 'Rafael', 'Tatiana', 'Guilherme', 'Priscila'
];

const SOBRENOMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes',
  'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade'
];

const EQUIPES = ['Alfa 1', 'Alfa 2', 'Bravo 1', 'Bravo 2', 'Charlie 1', 'Delta Ops', 'Eco Tático'];

export function generateInitialAgents(count: number = 100): Agent[] {
  const agents: Agent[] = [];

  for (let i = 1; i <= count; i++) {
    const nome = `${PRIMEIROS_NOMES[i % PRIMEIROS_NOMES.length]} ${SOBRENOMES[(i * 3) % SOBRENOMES.length]}`;
    const matricula = `AG-${1000 + i}`;
    const telefone = `(92) 9${Math.floor(8000 + Math.random() * 1999)}-${Math.floor(1000 + Math.random() * 8999)}`;
    const equipe = EQUIPES[i % EQUIPES.length];

    let status: AgentStatus = 'libre';
    const rand = Math.random();
    if (rand > 0.96) status = 'sos';
    else if (rand > 0.85) status = 'atendimento';
    else if (rand > 0.60) status = 'caminho';

    const latOffset = (Math.random() - 0.5) * 0.10;
    const lngOffset = (Math.random() - 0.5) * 0.10;

    const velocidade = status === 'libre' ? Math.floor(Math.random() * 20) : Math.floor(15 + Math.random() * 45);
    const bateria = Math.floor(30 + Math.random() * 70);

    agents.push({
      id: `agent-${i}`,
      matricula,
      nome,
      telefone,
      status,
      latitude: CENTER_LAT + latOffset,
      longitude: CENTER_LNG + lngOffset,
      velocidade_kmh: velocidade,
      bateria_pct: bateria,
      precisao_m: Math.floor(3 + Math.random() * 8),
      ultima_atualizacao: new Date().toLocaleTimeString(),
      equipe,
      validado: true
    });
  }

  return agents;
}

export function simulateMovementTick(
  agents: Agent[],
  objectives: Objective[],
  hoveredAgentId?: string | null
): Agent[] {
  return agents.map(agent => {
    // Se o cursor do mouse estiver sob o transponder do agente, PAUSA a simulação de movimento
    if (hoveredAgentId && agent.id === hoveredAgentId) {
      return {
        ...agent,
        velocidade_kmh: 0,
        ultima_atualizacao: new Date().toLocaleTimeString()
      };
    }

    if (agent.status === 'inativo' || agent.status === 'pendente_validacao') return agent;

    let { latitude, longitude, status, velocidade_kmh, bateria_pct } = agent;

    if (agent.objetivo_atual_id) {
      const obj = objectives.find(o => o.id === agent.objetivo_atual_id);
      if (obj) {
        const targetLat = status === 'caminho' ? obj.origem_lat : obj.destino_lat;
        const targetLng = status === 'caminho' ? obj.origem_lng : obj.destino_lng;

        const dLat = targetLat - latitude;
        const dLng = targetLng - longitude;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);

        if (dist > 0.0005) {
          latitude += (dLat / dist) * 0.0003;
          longitude += (dLng / dist) * 0.0003;
          velocidade_kmh = Math.floor(30 + Math.random() * 25);
        } else {
          if (status === 'caminho') {
            status = 'atendimento';
          }
        }
      }
    } else {
      const moveChance = Math.random();
      if (moveChance > 0.3) {
        latitude += (Math.random() - 0.5) * 0.0004;
        longitude += (Math.random() - 0.5) * 0.0004;
        velocidade_kmh = Math.max(0, Math.floor(velocidade_kmh + (Math.random() - 0.5) * 6));
      } else {
        velocidade_kmh = 0;
      }
    }

    if (Math.random() > 0.95 && bateria_pct > 5) {
      bateria_pct -= 1;
    }

    return {
      ...agent,
      latitude,
      longitude,
      status,
      velocidade_kmh,
      bateria_pct,
      ultima_atualizacao: new Date().toLocaleTimeString()
    };
  });
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}
