import React, { useState } from 'react';
import { X, MessageSquare, Phone, User, CheckCircle2, ShieldCheck, MapPin, Send, AlertCircle } from 'lucide-react';
import { Agent } from '../types';

interface WhatsAppRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterAgentSuccess: (newAgent: Agent) => void;
}

export const WhatsAppRegisterModal: React.FC<WhatsAppRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterAgentSuccess
}) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [permissaoRastreio, setPermissaoRastreio] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome.trim()) {
      setError('Por favor, informe seu Nome Completo.');
      return;
    }

    if (!telefone.trim() || telefone.length < 9) {
      setError('Por favor, informe um número de WhatsApp válido.');
      return;
    }

    if (!permissaoRastreio) {
      setError('A autorização de rastreio GPS em tempo real é obrigatória para atuação em campo.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Tentar capturar a posição GPS atual do dispositivo (se permitido)
      let currentLat = -3.10719;
      let currentLng = -60.0261;

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            currentLat = pos.coords.latitude;
            currentLng = pos.coords.longitude;
          },
          () => { /* usa padrão caso não haja permissão imediata */ },
          { timeout: 3000 }
        );
      }

      const matricula = `AG-WA${Math.floor(100 + Math.random() * 900)}`;

      const newAgent: Agent = {
        id: `agent-wa-${Date.now()}`,
        matricula,
        nome,
        telefone,
        status: 'pendente_validacao',
        validado: false,
        latitude: currentLat,
        longitude: currentLng,
        velocidade_kmh: 0,
        bateria_pct: 100,
        precisao_m: 5,
        ultima_atualizacao: new Date().toLocaleTimeString(),
        equipe: 'WhatsApp Cadastrado'
      };

      // Adiciona o agente na lista do aplicativo
      onRegisterAgentSuccess(newAgent);

      // Tenta enviar para o backend Hostinger
      fetch('https://vertice.hubdigital360.com/lab/api/to_cadastrar_agente.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          telefone,
          permissao_rastreio: permissaoRastreio,
          latitude: currentLat,
          longitude: currentLng
        })
      }).catch(() => { /* Fallback limpo */ });

      // Gera mensagem preformatada para abrir diretamente no WhatsApp
      const textMessage = `*CADASTRO DE AGENTE — VÉRTICE TEATRO DE OPERAÇÕES*\n\n` +
        `👤 *Nome:* ${nome}\n` +
        `📱 *WhatsApp:* ${telefone}\n` +
        `🆔 *Matrícula Gerada:* ${matricula}\n` +
        `📍 *Rastreio GPS:* ${permissaoRastreio ? 'AUTORIZADO ✅' : 'NÃO AUTORIZADO'}\n` +
        `⏰ *Data/Hora:* ${new Date().toLocaleString('pt-BR')}\n\n` +
        `_Solicito ativação e credenciamento na Central de Operações Vértice-TO._`;

      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMessage)}`;

      // Redireciona diretamente para o WhatsApp
      window.open(whatsappUrl, '_blank');
      onClose();
    } catch {
      setError('Ocorreu um erro ao processar o cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl glass-panel relative">
        {/* Glow de Fundo */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header do Modal */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">CADASTRO DE AGENTE VIA WHATSAPP</h2>
              <p className="text-[11px] text-slate-400 font-mono">Credenciamento rápido e autorização de campo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerta de Erro */}
        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-lg text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulário de Cadastro */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
              NOME COMPLETO DO AGENTE *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Pedro Henrique Silva"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* WhatsApp / Telefone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
              NÚMERO DO WHATSAPP *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(63) 99999-8888"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Permissão de Rastreio GPS em Tempo Real */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={permissaoRastreio}
                onChange={(e) => setPermissaoRastreio(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
              />
              <div>
                <span className="text-xs font-bold text-emerald-400 block font-mono">
                  AUTORIZO O RASTREIO GPS EM TEMPO REAL
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Concordo em disponibilizar o envio periódico de localização GPS durante o cumprimento das missões operacionais de campo.
                </p>
              </div>
            </label>
          </div>

          {/* Botão Enviar e Abrir WhatsApp */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-98 font-mono mt-2"
          >
            <Send className="w-4 h-4" />
            <span>ENVIAR CADASTRO E ABRIR NO WHATSAPP</span>
          </button>
        </form>
      </div>
    </div>
  );
};
