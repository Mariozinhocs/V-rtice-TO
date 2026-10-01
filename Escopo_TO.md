# Sistema de Rastreio e Dispatch de Agentes em Campo

## Visão Geral

Sistema web para gestão de operações de campo com ~100 agentes, inspirado em funcionalidades do Life360 mas voltado para uso institucional/municipal. O sistema permite cadastro de agentes, acompanhamento em tempo real no mapa, criação de objetivos (passageiro + destino), identificação do agente mais próximo, designação de tarefas, notificações e mapeamento de rotas.

## Funcionalidades Principais

### Para o Administrador (Dashboard)

- **Mapa de operação**: visualização de todos os agentes em tempo real como "transponders" discretos
- **Cadastro de agentes**: nome, matrícula, telefone, status (ativo/inativo)
- **Criação de objetivos**: marcar origem (passageiro) e destino no mapa
- **Identificação do agente mais próximo**: cálculo automático baseado na distância
- **Designação de tarefas**: atribuir objetivo a um agente específico
- **Notificações**: alertas de nova designação e conclusão de rota
- **Monitoramento de status**: acompanhamento do progresso de cada objetivo

### Para o Agente (App Mobile/PWA)

- **Login individual**: autenticação segura por agente
- **Rastreio em tempo real**: envio periódico de posição GPS
- **Recebimento de designações**: notificação de novos objetivos
- **Navegação**: integração com apps de mapa para rota até o objetivo
- **Conclusão de tarefa**: botão para marcar objetivo como concluído

## Arquitetura Técnica

### Stack Recomendada

#### Opção A - Supabase + React/Next.js + FlutterFlow
- **Backend/DB**: Supabase (PostgreSQL + Realtime + Auth)
- **Frontend Admin**: React/Next.js com Mapbox GL JS
- **App Agente**: FlutterFlow com integração Supabase
- **Mapa/Rotas**: Mapbox GL JS + Mapbox Directions API
- **Notificações**: Firebase Cloud Messaging (FCM)

#### Opção B - Node.js + Socket.io + PostGIS
- **Backend**: Node.js/Express + Socket.io para WebSockets
- **DB**: PostgreSQL + PostGIS para consultas espaciais
- **Frontend Admin**: React com Leaflet ou Mapbox
- **App Agente**: React Native ou PWA
- **Mapa/Rotas**: Leaflet + OSRM ou Mapbox

### Componentes do Sistema

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Admin Web     │────▶│   Backend API    │◀────│  App Agente     │
│   (Dashboard)   │     │  (Realtime/DB)   │     │  (Mobile/PWA)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                        │
         ▼                       ▼                        ▼
   ┌──────────┐           ┌──────────┐            ┌──────────┐
   │  Mapbox  │           │PostgreSQL│            │   GPS    │
   │   GL JS  │           │ + PostGIS│            │  Sensor  │
   └──────────┘           └──────────┘            └──────────┘
```

## Modelo de Dados

### Tabelas Principais

```sql
-- Agentes
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  matricula VARCHAR(50) UNIQUE,
  telefone VARCHAR(20),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posições dos agentes (atualizado em tempo real)
CREATE TABLE agent_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(5, 2),
  speed DECIMAL(5, 2),
  heading DECIMAL(5, 2),
  captured_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Objetivos (corridas/tarefas)
CREATE TABLE objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50),
  passageiro_nome VARCHAR(255),
  origem_lat DECIMAL(10, 8),
  origem_lng DECIMAL(11, 8),
  destino_lat DECIMAL(10, 8),
  destino_lng DECIMAL(11, 8),
  status VARCHAR(50) DEFAULT 'aberto',
  assigned_agent_id UUID REFERENCES agents(id),
  created_at TIMESTAMP DEFAULT NOW(),
  concluded_at TIMESTAMP
);

-- Designações
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID REFERENCES objectives(id),
  agent_id UUID REFERENCES agents(id),
  status VARCHAR(50) DEFAULT 'pendente',
  notified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usuários administradores
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'operador',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Índices Espaciais (PostGIS)

```sql
-- Habilitar extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Adicionar coluna geometry para consultas espaciais
ALTER TABLE agent_positions 
ADD COLUMN geom geometry(Point, 4326);

-- Atualizar registros existentes
UPDATE agent_positions 
SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326);

-- Criar índice espacial
CREATE INDEX idx_agent_positions_geom 
ON agent_positions USING GIST (geom);
```

## Fluxos de Trabalho

### 1. Cadastro e Login de Agente
```
1. Admin cria agente no dashboard
2. Sistema gera credenciais (email/senha ou token)
3. Agente baixa app e faz login
4. App solicita permissão de localização
5. Agente começa a enviar posições
```

### 2. Criação e Designação de Objetivo
```
1. Admin clica no mapa para marcar origem (passageiro)
2. Admin clica para marcar destino
3. Preenche dados do passageiro (opcional)
4. Sistema calcula agentes próximos (raio de X km)
5. Admin seleciona agente ou usa "mais próximo"
6. Sistema envia notificação push para agente
7. Agente aceita designação no app
```

### 3. Rastreio em Tempo Real
```
1. App agente captura GPS a cada 5-15s (em movimento)
2. Envia posição para backend via API/WebSocket
3. Backend atualiza tabela agent_positions
4. Dashboard admin recebe atualização via Realtime
5. Marcador no mapa se move suavemente
```

### 4. Conclusão de Tarefa
```
1. Agente chega ao destino
2. Clica em "Concluir Rota" no app
3. Backend atualiza status do objetivo
4. Notificação enviada ao admin
5. Agente fica disponível para nova designação
```

## Especificações de Interface

### Dashboard Admin

#### Mapa Principal
- **Estilo**: Dark/Neutro (Mapbox Dark v11 ou similar)
- **Marcadores**: Círculos de 10px com animação de pulso
- **Cores**: 
  - Livre: Cinza-azulado (#9aa3b3)
  - A caminho: Âmbar (#f59e0b)
  - Em atendimento: Verde (#10b981)
- **Tooltip**: Hover mostra ID, status, velocidade, última atualização

#### Painel Lateral
- Lista de objetivos ativos
- Filtros por status
- Contagem de agentes por status
- Botão "Novo Objetivo"

#### Modal de Novo Objetivo
- Mapa para marcar origem/destino
- Campos: passageiro, observações
- Botão "Encontrar Agente Mais Próximo"
- Lista de agentes sugeridos com distância

### App do Agente

#### Tela Principal
- Mapa com rota traçada até destino
- Botão "Iniciar Navegação" (abre Google Maps/Mapbox)
- Botão "Concluir Tarefa"
- Status atual visível

#### Configurações
- Toggle de rastreio (ligado/desligado)
- Frequência de envio de GPS
- Histórico de tarefas

## Implementação Técnica

### Backend - API Endpoints

```typescript
// Exemplo com Express + Socket.io

// Autenticação
POST /api/auth/login
POST /api/auth/logout

// Agentes
GET /api/agents
POST /api/agents
PUT /api/agents/:id
GET /api/agents/:id/positions

// Posições (tempo real)
POST /api/positions  // Agente envia posição
WS /ws/positions     // WebSocket para updates

// Objetivos
GET /api/objectives
POST /api/objectives
PUT /api/objectives/:id/assign
PUT /api/objectives/:id/complete

// Dispatch
GET /api/dispatch/nearest?lat=x&lng=y&radius=5000
```

### Frontend - Componente de Mapa (React + Mapbox)

```tsx
// Componente AgentsMap.tsx
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

type Agent = {
  id: string;
  lat: number;
  lng: number;
  status: "livre" | "a caminho" | "em atendimento";
  speed?: number;
  lastUpdate: string;
};

export default function AgentsMap({ agents, center, zoom }) {
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());

  useEffect(() => {
    // Inicializar mapa Mapbox
    const map = new mapboxgl.Map({
      container: 'map-container',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center || [-60.021, -3.107], // Manaus
      zoom: zoom ?? 12,
    });

    mapRef.current = map;
    return () => map.remove();
  }, []);

  useEffect(() => {
    // Atualizar marcadores quando agentes mudarem
    agents.forEach(agent => {
      const existing = markersRef.current.get(agent.id);
      
      const el = createTransponderMarker(agent);
      
      if (existing) {
        existing.setLngLat([agent.lng, agent.lat]);
      } else {
        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([agent.lng, agent.lat])
          .addTo(mapRef.current);
        markersRef.current.set(agent.id, marker);
      }
    });
  }, [agents]);

  return <div id="map-container" style={{ width: '100%', height: '100%' }} />;
}

function createTransponderMarker(agent) {
  const el = document.createElement('div');
  el.className = 'transponder-marker';
  
  // Tooltip no hover
  el.addEventListener('mouseenter', () => {
    const tooltip = document.createElement('div');
    tooltip.className = 'transponder-tooltip';
    tooltip.innerHTML = `
      <div><strong>Agente:</strong> ${agent.id}</div>
      <div><strong>Status:</strong> ${agent.status}</div>
      <div><strong>Velocidade:</strong> ${agent.speed || 0} km/h</div>
      <div><strong>Atualizado:</strong> ${agent.lastUpdate}</div>
    `;
    el.appendChild(tooltip);
  });
  
  el.addEventListener('mouseleave', () => {
    const tooltip = el.querySelector('.transponder-tooltip');
    if (tooltip) tooltip.remove();
  });
  
  return el;
}
```

### Estilos CSS para Marcadores

```css
/* transponder.css */
.transponder-marker {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #9aa3b3;
  border: 2px solid #0f1724;
  box-shadow: 0 0 0 0 rgba(154, 163, 179, 0.6);
  animation: pulse 2s infinite;
  cursor: pointer;
  position: relative;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(154, 163, 179, 0.6);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(154, 163, 179, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(154, 163, 179, 0);
  }
}

.transponder-tooltip {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 36, 0.95);
  color: #e5e7eb;
  font: 12px/1.4 system-ui;
  padding: 6px 8px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  z-index: 20;
}
```

### Função de Agente Mais Próximo (PostGIS)

```sql
-- Função para encontrar agentes próximos
CREATE OR REPLACE FUNCTION find_nearest_agents(
  target_lat DECIMAL,
  target_lng DECIMAL,
  radius_meters INTEGER DEFAULT 5000,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  agent_id UUID,
  nome VARCHAR,
  distance_meters FLOAT,
  last_lat DECIMAL,
  last_lng DECIMAL,
  last_update TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.nome,
    ST_Distance(
      p.geom::geography,
      ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography
    ) AS distance_meters,
    p.lat,
    p.lng,
    p.created_at AS last_update
  FROM agents a
  JOIN LATERAL (
    SELECT lat, lng, geom, created_at
    FROM agent_positions
    WHERE agent_id = a.id
    ORDER BY created_at DESC
    LIMIT 1
  ) p ON true
  WHERE a.ativo = true
    AND ST_DWithin(
      p.geom,
      ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326),
      radius_meters / 111000.0
    )
  ORDER BY distance_meters
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

## Configuração de Tempo Real

### Supabase Realtime

```typescript
// Subscribe a atualizações de posições
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Escutar mudanças na tabela agent_positions
const channel = supabase
  .channel('positions')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'agent_positions'
    },
    (payload) => {
      // Atualizar estado do React com nova posição
      handlePositionUpdate(payload.new);
    }
  )
  .subscribe();
```

### Socket.io (Opção B)

```typescript
// Backend - servidor Socket.io
import { Server } from 'socket.io';

const io = new Server(3001, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  // Agente envia posição
  socket.on('send_position', (data) => {
    // Salvar no banco
    savePosition(data);
    // Broadcast para admins
    io.to('admins').emit('position_update', data);
  });

  // Admin entra na sala de admins
  socket.on('join_admins', () => {
    socket.join('admins');
  });
});

// Frontend - cliente Socket.io
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Enviar posição (agente)
socket.emit('send_position', {
  agentId: 'xxx',
  lat: -3.107,
  lng: -60.021,
  speed: 45
});

// Receber atualizações (admin)
socket.on('position_update', (data) => {
  updateAgentPosition(data);
});
```

## Notificações Push

### Firebase Cloud Messaging

```typescript
// Backend - enviar notificação
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sendDispatchNotification(agentToken, objective) {
  await admin.messaging().send({
    token: agentToken,
    notification: {
      title: 'Nova Designação',
      body: `Passageiro: ${objective.passenger_name}`
    },
    data: {
      objectiveId: objective.id,
      type: 'dispatch'
    }
  });
}
```

## Considerações de Escala

### Para ~100 Agentes

- **Frequência de GPS**: 5-15s em movimento, 30-60s parado
- **Conexões WebSocket**: ~100-150 conexões simultâneas (trivial)
- **Banco de dados**: 
  - Manter últimas 1000 posições por agente em cache
  - Archive histórico antigo em tabela separada
- **Mapa**: 
  - Clusterizar marcadores se zoom for muito aberto
  - Limitar updates de UI a 1-2fps para suavidade

### Otimizações

```sql
-- Manter apenas últimas posições em tabela principal
CREATE TABLE agent_positions_latest (
  agent_id UUID PRIMARY KEY,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  updated_at TIMESTAMP
);

-- Trigger para atualizar tabela latest
CREATE OR REPLACE FUNCTION update_latest_position()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO agent_positions_latest (agent_id, lat, lng, updated_at)
  VALUES (NEW.agent_id, NEW.lat, NEW.lng, NEW.created_at)
  ON CONFLICT (agent_id) 
  DO UPDATE SET lat = NEW.lat, lng = NEW.lng, updated_at = NEW.created_at;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_latest
AFTER INSERT ON agent_positions
FOR EACH ROW EXECUTE FUNCTION update_latest_position();
```

## Segurança e Privacidade

### Controles de Acesso

- **Admin**: CRUD completo de agentes e objetivos
- **Agente**: Ver apenas suas designações, enviar posições
- **RLS (Row Level Security)** no Supabase para isolar dados

### Logs de Auditoria

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR(50),
  table_name VARCHAR(50),
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Próximos Passos

1. **Configurar ambiente**: Supabase project ou servidor Node + Postgres
2. **Criar schema**: Rodar scripts SQL das tabelas
3. **Desenvolver backend**: API endpoints + WebSocket
4. **Desenvolver frontend admin**: Dashboard com mapa
5. **Desenvolver app agente**: PWA ou FlutterFlow
6. **Testes**: Simular 100 agentes com dados mock
7. **Deploy**: Vercel (frontend) + Railway/Render (backend)

## Referências Técnicas

- Mapbox GL JS: [https://docs.mapbox.com/mapbox-gl-js/](https://docs.mapbox.com/mapbox-gl-js/)
- Supabase Realtime: [https://supabase.com/docs/guides/realtime](https://supabase.com/docs/guides/realtime)
- Leaflet: [https://leafletjs.com/](https://leafletjs.com/)
- PostGIS: [https://postgis.net/](https://postgis.net/)
- Firebase Cloud Messaging: [https://firebase.google.com/docs/cloud-messaging](https://firebase.google.com/docs/cloud-messaging)