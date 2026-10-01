import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Agent, Objective, AgentStatus } from '../types';

interface MapControlProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  onHoverAgent?: (agentId: string | null) => void;
  objectives: Objective[];
  onMapClick?: (lat: number, lng: number) => void;
  isDispatchingMode?: boolean;
  flyToCoords?: { lat: number; lng: number } | null;
  statusFilter?: AgentStatus | 'todos';
  fitBoundsTrigger?: number;
}

export const MapControl: React.FC<MapControlProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  onHoverAgent,
  objectives,
  onMapClick,
  flyToCoords,
  statusFilter = 'todos',
  fitBoundsTrigger
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const routeLinesRef = useRef<L.Polyline[]>([]);
  const agentsRef = useRef<Agent[]>(agents);

  // Atualiza agentsRef sempre que a prop agents mudar
  useEffect(() => {
    agentsRef.current = agents;
  }, [agents]);

  // Ajustar o zoom do mapa (Fit Bounds) quando o botão for clicado
  useEffect(() => {
    if (fitBoundsTrigger && fitBoundsTrigger > 0 && mapInstanceRef.current && agentsRef.current.length > 0) {
      const bounds = L.latLngBounds(agentsRef.current.map(a => [a.latitude, a.longitude]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true, duration: 1.0 });
    }
  }, [fitBoundsTrigger]);

  // Inicializar o mapa Leaflet com Dark Theme Tiles e MarkerClusterGroup
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Coordenadas centrais de Manaus - AM (Teatro de Operações)
    const initialCenter: [number, number] = [-3.10719, -60.0261];
    const initialZoom = 13;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(initialCenter, initialZoom);

    // Tile Layer OpenStreetMap 100% gratuito sem API Key (com filtro CSS Dark)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: 'OpenStreetMap'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Inicializar Grupo de Agrupamento (Cluster)
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 45,
      iconCreateFunction: (cluster) => {
        const markers = cluster.getAllChildMarkers();
        const count = markers.length;

        const hasSOS = markers.some(m => {
          const iconHtml = (m.options.icon?.options as any)?.html || '';
          return iconHtml.includes('status-sos');
        });

        const size = count < 10 ? 32 : count < 50 ? 40 : 48;
        const sosClass = hasSOS ? 'cluster-has-sos' : '';

        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster-custom ${sosClass}`,
          iconSize: L.point(size, size)
        });
      }
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Efeito para Centralizar / FlyTo no agente quando acionado por duplo-clique
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && flyToCoords) {
      map.flyTo([flyToCoords.lat, flyToCoords.lng], 16, {
        animate: true,
        duration: 1.2
      });
    }
  }, [flyToCoords]);

  // Atualizar Transponders no Cluster ao Vivo em Tempo Real
  useEffect(() => {
    const clusterGroup = clusterGroupRef.current;
    if (!clusterGroup) return;

    const currentMarkerIds = new Set<string>();

    agents.forEach(agent => {
      if (agent.status === 'pendente_validacao' && !agent.validado) return;

      currentMarkerIds.add(agent.id);
      const isSelected = agent.id === selectedAgentId;

      let statusClass = 'status-libre';
      if (agent.status === 'caminho') statusClass = 'status-caminho';
      if (agent.status === 'atendimento') statusClass = 'status-atendimento';
      if (agent.status === 'sos') statusClass = 'status-sos';

      const shouldPulse = statusFilter !== 'todos' || agent.status === 'sos';
      const pulseClass = shouldPulse ? '' : 'no-pulse';

      const customIconHtml = `
        <div class="relative group">
          <div class="transponder-pulse ${statusClass} ${pulseClass} ${isSelected ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-900 scale-125' : ''}"></div>
          ${isSelected ? `
            <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-cyan-950 text-cyan-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-cyan-700 whitespace-nowrap shadow-lg">
              ${agent.matricula}
            </div>
          ` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: customIconHtml,
        className: 'custom-transponder-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      // Detalhamento da Missão Atual ou Status do Agente para o Tooltip/Popup
      let missionDetailHtml = `<div class="text-emerald-400 font-bold">🟢 STATUS: AGENTE LIVRE</div>`;
      if (agent.objetivo_atual_id) {
        const currentObj = objectives.find(o => o.id === agent.objetivo_atual_id);
        if (currentObj) {
          missionDetailHtml = `
            <div class="text-cyan-300 font-bold text-[10px]">🎯 MISSÃO ATUAL:</div>
            <div class="text-white font-sans text-[11px] font-semibold mt-0.5">${currentObj.passageiro_nome}</div>
            <div class="text-[10px] text-slate-400 mb-2 mt-1">Destino: <strong class="text-white">Aeroporto (Manaus)</strong></div>
            <button onclick="window.focusAgentRoute('${agent.id}')" class="w-full mb-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono text-[10px] font-bold transition-colors cursor-pointer pointer-events-auto shadow-lg">
              🎯 ISOLAR E FOCAR NA ROTA
            </button>
          `;
        }
      } else if (agent.status === 'sos') {
        missionDetailHtml = `<div class="text-red-400 font-bold animate-pulse">🚨 ALERTA DE EMERGÊNCIA SOS</div>`;
      }

        // Popup HTML com alto contraste escuro
        const tooltipHtml = `
          <div class="font-sans text-slate-100 min-w-[210px]">
            <div class="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5 mb-2">
              <span class="font-bold text-white text-xs">${agent.nome}</span>
              <span class="font-mono text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800 font-bold">${agent.matricula}</span>
            </div>
            <div class="text-[11px] space-y-1 font-mono">
              <div class="flex items-center justify-between text-slate-300">
                <span>Equipe:</span> <strong class="text-slate-100">${agent.equipe || 'Geral'}</strong>
              </div>
              <div class="flex items-center justify-between text-slate-300">
                <span>Velocidade:</span> <strong class="text-amber-400">${agent.velocidade_kmh} km/h</strong>
              </div>
              <div class="flex items-center justify-between text-slate-300">
                <span>Bateria:</span> <strong class="${agent.bateria_pct < 20 ? 'text-red-400 font-bold' : 'text-emerald-400'}">${agent.bateria_pct}%</strong>
              </div>
              <div class="flex items-center justify-between text-slate-400 text-[10px]">
                <span>Atualizado:</span> <span>${agent.ultima_atualizacao}</span>
              </div>

              <div class="mt-2 pt-1.5 border-t border-slate-800">
                ${missionDetailHtml}
              </div>
            </div>
            <button onclick="window.openAgentDetails('${agent.id}')" class="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded font-mono text-[10px] font-bold transition-colors cursor-pointer pointer-events-auto">
              VER RESUMO DO TURNO
            </button>
          </div>
        `;

        const existingMarker = markersRef.current.get(agent.id);

        if (existingMarker) {
          existingMarker.setLatLng([agent.latitude, agent.longitude]);
          existingMarker.setIcon(customIcon);
          
          // Mantém o popup atualizado se estiver aberto
          if (existingMarker.isPopupOpen()) {
            existingMarker.getPopup()?.setContent(tooltipHtml);
          } else {
            existingMarker.setPopupContent(tooltipHtml);
          }
        } else {
          const newMarker = L.marker([agent.latitude, agent.longitude], { icon: customIcon })
            .bindPopup(tooltipHtml, { offset: [0, -10], className: 'custom-agent-popup', minWidth: 220, closeButton: false });

        // Evento de clique para selecionar
        newMarker.on('click', () => {
          onSelectAgent(agent.id);
        });

        // Eventos de hover para congelar/descongelar movimento do agente
        newMarker.on('mouseover', () => {
          if (onHoverAgent) onHoverAgent(agent.id);
        });

        newMarker.on('mouseout', () => {
          if (onHoverAgent) onHoverAgent(null);
        });

        clusterGroup.addLayer(newMarker);
        markersRef.current.set(agent.id, newMarker);
      }
    });

    markersRef.current.forEach((marker, id) => {
      if (!currentMarkerIds.has(id)) {
        clusterGroup.removeLayer(marker);
        markersRef.current.delete(id);
      }
    });

    clusterGroup.refreshClusters();
  }, [agents, selectedAgentId, onSelectAgent, onHoverAgent, objectives, statusFilter]);

  // Linhas das Rotas dos Objetivos Ativos
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    routeLinesRef.current.forEach(line => line.remove());
    routeLinesRef.current = [];

    objectives.forEach(obj => {
      if (obj.status !== 'concluido' && obj.assigned_agent_id) {
        const assignedAgent = agents.find(a => a.id === obj.assigned_agent_id);
        if (assignedAgent) {
          const polyline = L.polyline([
            [assignedAgent.latitude, assignedAgent.longitude],
            [obj.origem_lat, obj.origem_lng],
            [obj.destino_lat, obj.destino_lng]
          ], {
            color: '#38bdf8',
            weight: 2,
            dashArray: '6, 8',
            opacity: 0.8
          }).addTo(map);

          routeLinesRef.current.push(polyline);
        }
      }
    });
  }, [objectives, agents]);

  return (
    <div className="relative w-full h-full bg-[#090d16] overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-0 dark-map-tiles" />
    </div>
  );
};
