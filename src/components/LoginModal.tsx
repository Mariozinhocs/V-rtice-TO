import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, Smartphone, MessageSquare, AlertCircle } from 'lucide-react';
import { AuthUser } from '../types';

interface LoginModalProps {
  onLoginSuccess: (user: AuthUser) => void;
  onSwitchToAgentView: () => void;
  onOpenWhatsAppRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onLoginSuccess,
  onSwitchToAgentView,
  onOpenWhatsAppRegister
}) => {
  const [email, setEmail] = useState('admin@vertice.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, informe e-mail e senha.');
      return;
    }

    if (email === 'admin@vertice.com' && password === 'admin123') {
      onLoginSuccess({
        id: 'admin-1',
        nome: 'Administrador de Operações',
        email: email,
        role: 'admin'
      });
    } else {
      setError('Credenciais inválidas. Tente admin@vertice.com / admin123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090d16]/95 backdrop-blur-xl">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl glass-panel relative overflow-hidden">
        {/* Glow de Fundo Estético */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header do Login */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[2px] shadow-xl shadow-cyan-500/20">
            <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-wide">VÉRTICE SGO</h1>
          <p className="text-xs text-cyan-400 font-mono font-semibold tracking-wider mt-0.5 uppercase">
            Teatro de Operações — Painel de Controle
          </p>
        </div>

        {/* Alerta de Erro */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-lg text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulário de Login ADM */}
        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              E-MAIL DO ADMINISTRADOR
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                placeholder="admin@vertice.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              SENHA DE ACESSO
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all active:scale-98"
          >
            <span>ENTRAR NO PAINEL ADM</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divisor */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-slate-800" />
          <span className="text-[10px] text-slate-500 font-mono uppercase">OU CADASTRO DE CAMPO</span>
          <div className="flex-1 h-[1px] bg-slate-800" />
        </div>

        {/* Botão de Cadastro via WhatsApp */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={onOpenWhatsAppRegister}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 rounded-lg text-xs font-bold font-mono transition-colors shadow-lg shadow-emerald-950/40"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>CADASTRO DE AGENTE VIA WHATSAPP</span>
          </button>

          {/* Botão de Atalho para App do Agente */}
          <button
            type="button"
            onClick={onSwitchToAgentView}
            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>VISUALIZAR TELA DO AGENTE (MOBILE)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
