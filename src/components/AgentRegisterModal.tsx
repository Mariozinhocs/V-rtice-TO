import React, { useState } from 'react';
import { X, User, CheckCircle2, ShieldCheck, MapPin, Send, AlertCircle, Fingerprint, Phone, Lock } from 'lucide-react';
import { Agent } from '../types';

interface AgentRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterAgentSuccess: (newAgent: Agent) => void;
}

export const AgentRegisterModal: React.FC<AgentRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterAgentSuccess
}) => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
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

    if (!cpf.trim() || cpf.length < 11) {
      setError('Por favor, informe um CPF válido.');
      return;
    }

    if (!telefone.trim() || telefone.length < 9) {
      setError('Por favor, informe um número de WhatsApp válido.');
      return;
    }

    if (!senha.trim() || senha.length < 6) {
      setError('A senha deve ter no mínimo 6 dígitos.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Capturar a posição GPS atual do dispositivo
      let currentLat = -3.10719;
      let currentLng = -60.0261;

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            currentLat = pos.coords.latitude;
            currentLng = pos.coords.longitude;
          },
          () => {},
          { timeout: 3000 }
        );
      }

      const matricula = `AG-OP${Math.floor(1000 + Math.random() * 9000)}`;

      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        matricula,
        nome,
        cpf,
        telefone,
        senha,
        status: 'pendente_validacao',
        status_conexao: 'online',
        validado: false,
        latitude: currentLat,
        longitude: currentLng,
        velocidade_kmh: 0,
        bateria_pct: 100,
        precisao_m: 5,
        ultima_atualizacao: new Date().toLocaleTimeString(),
        equipe: 'Pendente'
      };

      // Adiciona o agente na lista do aplicativo
      onRegisterAgentSuccess(newAgent);
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">CADASTRO DE AGENTE</h2>
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
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* CPF */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
              CPF (VÁLIDO) *
            </label>
            <div className="relative">
              <Fingerprint className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* WhatsApp / Telefone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
              TELEFONE (WHATSAPP) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(63) 99999-8888"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
              SENHA (MÍN 6 DÍGITOS) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Botão Enviar */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-98 font-mono mt-4"
          >
            <Send className="w-4 h-4" />
            <span>CADASTRAR E ENVIAR PARA APROVAÇÃO</span>
          </button>
        </form>
      </div>
    </div>
  );
};
