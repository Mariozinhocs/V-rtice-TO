import React, { useState, useMemo } from 'react';
import { X, Navigation, MapPin, User, Search, ShieldCheck, ArrowRight, Compass, Link2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Agent, Objective } from '../types';
import { calculateDistanceKm } from '../services/mockAgentGenerator';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  onDispatchObjective: (newObj: Partial<Objective>, assignedAgentId: string) => void;
}

// Pontos de interesse / Pontos operacionais em Manaus - AM
const PRESET_LOCATIONS_MANAUS = [
  { name: 'Teatro Amazonas (Centro - Manaus)', lat: -3.1302, lng: -60.0234 },
  { name: 'Aeroporto Internacional Eduardo Gomes', lat: -3.0386, lng: -60.0497 },
  { name: 'Arena da Amazônia (Flores)', lat: -3.0831, lng: -60.0281 },
  { name: 'Praia da Ponta Negra', lat: -3.0631, lng: -60.1009 },
  { name: 'Porto de Manaus / Centro Comercial', lat: -3.1389, lng: -60.0298 },
  { name: 'Distrito Industrial I', lat: -3.1250, lng: -59.9750 },
  { name: 'Manauara Shopping (Adrianópolis)', lat: -3.1025, lng: -60.0125 }
];

// Função auxiliar para extrair coordenadas GPS de links ou textos do Google Maps
export function parseGoogleMapsInput(input: string): { lat: number; lng: number; success: boolean } {
  if (!input || !input.trim()) return { lat: 0, lng: 0, success: false };

  const cleanInput = input.trim();

  // 1. Formato Padrão de URL Google Maps com @lat,lng (ex: .../@-3.1302,-60.0234,17z/...)
  const atMatch = cleanInput.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]), success: true };
  }

  // 2. Formato de parâmetro q=lat,lng ou ll=lat,lng (ex: ...?q=-3.1302,-60.0234)
  const qMatch = cleanInput.match(/[?&](?:q|ll|destination)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]), success: true };
  }

  // 3. Formato de Coordenadas brutas coladas diretamente (ex: "-3.1302, -60.0234" ou "-3.1302 -60.0234")
  const rawCoordsMatch = cleanInput.match(/(-?\d+\.\d+)\s*[\s,]\s*(-?\d+\.\d+)/);
  if (rawCoordsMatch) {
    return { lat: parseFloat(rawCoordsMatch[1]), lng: parseFloat(rawCoordsMatch[2]), success: true };
  }

  return { lat: 0, lng: 0, success: false };
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  onClose,
  agents,
  onDispatchObjective
}) => {
  const [passageiroNome, setPassageiroNome] = useState('');
  
  // Modo de seleção para Origem: 'preset' | 'link'
  const [origemMode, setOrigemMode] = useState<'preset' | 'link'>('preset');
  const [selectedPresetOrigem, setSelectedPresetOrigem] = useState(0);
  const [origemLinkInput, setOrigemLinkInput] = useState('');

  // Modo de seleção para Destino: 'preset' | 'link'
  const [destinoMode, setDestinoMode] = useState<'preset' | 'link'>('preset');
  const [selectedPresetDestino, setSelectedPresetDestino] = useState(1);
  const [destinoLinkInput, setDestinoLinkInput] = useState('');

  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  // Resolução da Origem (Preset vs Link Colado)
  const origemParsed = useMemo(() => {
    if (origemMode === 'link') {
      return parseGoogleMapsInput(origemLinkInput);
    }
    const preset = PRESET_LOCATIONS_MANAUS[selectedPresetOrigem];
    return { lat: preset.lat, lng: preset.lng, success: true };
  }, [origemMode, selectedPresetOrigem, origemLinkInput]);

  // Resolução do Destino (Preset vs Link Colado)
  const destinoParsed = useMemo(() => {
    if (destinoMode === 'link') {
      return parseGoogleMapsInput(destinoLinkInput);
    }
    const preset = PRESET_LOCATIONS_MANAUS[selectedPresetDestino];
    return { lat: preset.lat, lng: preset.lng, success: true };
  }, [destinoMode, selectedPresetDestino, destinoLinkInput]);

  // Ordenar agentes por proximidade à Origem resolvida
  const nearestAgents = useMemo(() => {
    if (!origemParsed.success) return [];
    return agents
      .filter(a => a.status === 'libre' && a.validado !== false)
      .map(agent => ({
        ...agent,
        distanciaOrigemKm: calculateDistanceKm(agent.latitude, agent.longitude, origemParsed.lat, origemParsed.lng)
      }))
      .sort((a, b) => a.distanciaOrigemKm - b.distanciaOrigemKm);
  }, [agents, origemParsed]);

  const nearestAgentCandidate = nearestAgents[0];

  if (!isOpen) return null;

  const handleConfirmDispatch = () => {
    if (!origemParsed.success) {
      alert("Por favor, selecione um ponto de Origem válido ou cole um link do Google Maps válido.");
      return;
    }

    if (!destinoParsed.success) {
      alert("Por favor, selecione um ponto de Destino válido ou cole um link do Google Maps válido.");
      return;
    }

    const targetAgentId = selectedAgentId || (nearestAgentCandidate ? nearestAgentCandidate.id : agents[0]?.id);
    if (!targetAgentId) return;

    const newObj: Partial<Objective> = {
      passageiro_nome: passageiroNome || 'Chamado Operacional (Manaus - AM)',
      origem_lat: origemParsed.lat,
      origem_lng: origemParsed.lng,
      destino_lat: destinoParsed.lat,
      destino_lng: destinoParsed.lng,
      status: 'atribuido',
      created_at: new Date().toISOString()
    };

    onDispatchObjective(newObj, targetAgentId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl glass-panel">
        {/* Header do Modal */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-700 flex items-center justify-center text-blue-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">NOVO DISPATCH DE CAMPO (MANAUS - AM)</h2>
              <p className="text-xs text-slate-400 font-mono">Suporte a links do Google Maps ou pontos cadastrados</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo do Formulário */}
        <div className="p-6 space-y-5">
          {/* Nome do Passageiro / Solicitante */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              NOME DO PASSAGEIRO / SOLICITANTE
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={passageiroNome}
                onChange={(e) => setPassageiroNome(e.target.value)}
                placeholder="Ex: Dra. Mariana Costa (Operação Manaus)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>
          </div>

          {/* Seleção de Origem e Destino com Suporte a Link do Google Maps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* --- ORIGEM --- */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> ORIGEM (EMBARQUE)
                </label>

                {/* Alternador de Modo: Lista vs Link */}
                <button
                  type="button"
                  onClick={() => setOrigemMode(origemMode === 'preset' ? 'link' : 'preset')}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800"
                >
                  <Link2 className="w-3 h-3" />
                  <span>{origemMode === 'preset' ? 'COLAR LINK MAPS' : 'LISTA DE PONTOS'}</span>
                </button>
              </div>

              {origemMode === 'preset' ? (
                <select
                  value={selectedPresetOrigem}
                  onChange={(e) => setSelectedPresetOrigem(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                >
                  {PRESET_LOCATIONS_MANAUS.map((loc, idx) => (
                    <option key={idx} value={idx}>{loc.name}</option>
                  ))}
                </select>
              ) : (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={origemLinkInput}
                    onChange={(e) => setOrigemLinkInput(e.target.value)}
                    placeholder="Cole o link do Google Maps ou coordenadas (ex: https://maps.app.goo.gl/...)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />

                  {/* Feedback de Validação da URL/Coordenadas coladas */}
                  {origemLinkInput && (
                    <div className="text-[10px] font-mono">
                      {origemParsed.success ? (
                        <div className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>GPS Extraído: {origemParsed.lat.toFixed(4)}, {origemParsed.lng.toFixed(4)}</span>
                        </div>
                      ) : (
                        <div className="text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Aguardando link válido do Google Maps...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* --- DESTINO --- */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" /> DESTINO (DESEMBARQUE)
                </label>

                {/* Alternador de Modo: Lista vs Link */}
                <button
                  type="button"
                  onClick={() => setDestinoMode(destinoMode === 'preset' ? 'link' : 'preset')}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800"
                >
                  <Link2 className="w-3 h-3" />
                  <span>{destinoMode === 'preset' ? 'COLAR LINK MAPS' : 'LISTA DE PONTOS'}</span>
                </button>
              </div>

              {destinoMode === 'preset' ? (
                <select
                  value={selectedPresetDestino}
                  onChange={(e) => setSelectedPresetDestino(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                >
                  {PRESET_LOCATIONS_MANAUS.map((loc, idx) => (
                    <option key={idx} value={idx}>{loc.name}</option>
                  ))}
                </select>
              ) : (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={destinoLinkInput}
                    onChange={(e) => setDestinoLinkInput(e.target.value)}
                    placeholder="Cole o link do Google Maps ou coordenadas (ex: https://maps.app.goo.gl/...)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />

                  {/* Feedback de Validação da URL/Coordenadas coladas */}
                  {destinoLinkInput && (
                    <div className="text-[10px] font-mono">
                      {destinoParsed.success ? (
                        <div className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>GPS Extraído: {destinoParsed.lat.toFixed(4)}, {destinoParsed.lng.toFixed(4)}</span>
                        </div>
                      ) : (
                        <div className="text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Aguardando link válido do Google Maps...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sugestão do Agente Mais Próximo (Recalculado dinamicamente com base no link do Google Maps) */}
          {nearestAgentCandidate && (
            <div className="p-3.5 bg-cyan-950/40 border border-cyan-800/80 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 font-mono">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>SUGESTÃO AUTOMÁTICA — AGENTE MAIS PRÓXIMO</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900 text-cyan-300 font-bold">
                  {nearestAgentCandidate.distanciaOrigemKm} KM DA ORIGEM
                </span>
              </div>

              <div className="flex items-center justify-between text-xs bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="font-bold text-white">{nearestAgentCandidate.nome}</span>
                  <span className="text-slate-400 font-mono text-[11px] ml-2">({nearestAgentCandidate.matricula})</span>
                </div>
                <div className="text-slate-300 font-mono text-[11px]">
                  Status: <strong className="text-emerald-400 uppercase">{nearestAgentCandidate.status}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Escolha Manual de Agente Alternativo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              OU SELECIONE OUTRO AGENTE DA LISTA
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="">Usar sugestão do Agente Mais Próximo</option>
              {nearestAgents.map(ag => (
                <option key={ag.id} value={ag.id}>
                  {ag.nome} ({ag.matricula}) — {ag.distanciaOrigemKm} km da Origem
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            CANCELAR
          </button>
          <button
            onClick={handleConfirmDispatch}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <span>CONFIRMAR DISPATCH DE ROTA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
