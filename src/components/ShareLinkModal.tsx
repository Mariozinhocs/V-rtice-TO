import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageSquare, ExternalLink, QrCode, ShieldCheck } from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // URL pública direta para o formulário de cadastro de agentes
  const baseUrl = window.location.origin + window.location.pathname;
  const registerUrl = `${baseUrl}?action=register`;

  // Mensagem preformatada de convite via WhatsApp
  const inviteMessage = `*CONVITE DE CREDENCIAMENTO — VÉRTICE TEATRO DE OPERAÇÕES (MANAUS - AM)*\n\n` +
    `Olá! Você foi convidado a integrar a equipe de campo do Teatro de Operações Vértice.\n\n` +
    `Por favor, preencha o formulário de cadastro e aceite os termos de autorização de rastreio GPS para liberação do seu transponder:\n\n` +
    `👉 *Acesse o link de cadastro:* ${registerUrl}\n\n` +
    `_Central de Operações SGO Vértice-TO_`;

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteMessage)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl glass-panel relative">
        {/* Glow de Fundo */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header do Modal */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">GERAR LINK DE CADASTRO DE AGENTE</h2>
              <p className="text-[11px] text-slate-400 font-mono">Envie este convite para novos agentes de campo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 space-y-4 font-sans">
          {/* Link Direto para Copiar */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              LINK DIRETO DE FORMULÁRIO DE CADASTRO
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={registerUrl}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold font-mono transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'COPIADO!' : 'COPIAR'}</span>
              </button>
            </div>
          </div>

          {/* Compartilhar Diretamente via WhatsApp */}
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300 font-mono">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                CONVITE RÁPIDO VIA WHATSAPP
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Dispare uma mensagem preformatada contendo o link de credenciamento e instruções para os novos agentes.
            </p>
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs font-mono shadow-lg shadow-emerald-600/30 transition-all active:scale-98"
            >
              <Share2 className="w-4 h-4" />
              <span>ENVIAR CONVITE NO WHATSAPP</span>
            </a>
          </div>

          {/* Prévia da Mensagem */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 font-mono text-[10px]">
            <span className="text-slate-500 uppercase block">PRÉVIA DA MENSAGEM DO WHATSAPP:</span>
            <p className="text-slate-300 whitespace-pre-line leading-normal">
              {inviteMessage}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};
