import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, AlertTriangle, Smartphone } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [isStandalone, setIsStandalone] = useState(true);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Verificar se o dispositivo é iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Verificar se está em modo Standalone (PWA)
    const checkStandalone = () => {
      const matchMedia = window.matchMedia('(display-mode: standalone)').matches;
      const navigatorStandalone = (window.navigator as any).standalone === true;
      return matchMedia || navigatorStandalone;
    };

    setIsStandalone(checkStandalone());

    // Listener para o caso do usuário adicionar à tela de início e o status mudar (alguns browsers suportam)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      }
    };
  }, []);

  // Se já estiver em modo standalone, ou se estiver num Desktop (vamos assumir que a tela do agente é feita para mobile, mas se precisar forçar apenas em mobile, poderíamos checar a largura da tela).
  // Para a regra de segurança, vamos bloquear o painel do agente SEMPRE que não for standalone (mesmo no PC, assim obriga a instalar o PWA se tiver no PC, ou usar só no celular).
  if (isStandalone) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#090d16] flex flex-col items-center justify-center p-6 text-center font-sans overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-[#0f172a] border border-red-900/50 p-8 rounded-3xl max-w-sm w-full shadow-2xl shadow-red-900/20 relative z-10 flex flex-col items-center">
        
        <div className="w-16 h-16 bg-red-950/50 border border-red-800 rounded-2xl flex items-center justify-center mb-6 text-red-500 animate-pulse">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2 font-mono">ACESSO RESTRITO</h1>
        
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          Para garantir a segurança da operação, o painel do agente só pode ser acessado em <strong>Modo Aplicativo (Tela Cheia)</strong>.
        </p>

        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-500" />
            Como instalar o App
          </h2>

          {isIOS ? (
            <ul className="text-left text-xs text-slate-400 space-y-3 font-medium">
              <li className="flex items-start gap-3">
                <div className="bg-slate-800 p-1.5 rounded-lg text-slate-300 shrink-0 mt-0.5">
                  <Share className="w-3.5 h-3.5" />
                </div>
                <span>Toque no botão <strong>Compartilhar</strong> na barra inferior do Safari.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-slate-800 p-1.5 rounded-lg text-slate-300 shrink-0 mt-0.5">
                  <PlusSquare className="w-3.5 h-3.5" />
                </div>
                <span>Selecione <strong>"Adicionar à Tela de Início"</strong>.</span>
              </li>
            </ul>
          ) : (
            <ul className="text-left text-xs text-slate-400 space-y-3 font-medium">
              <li className="flex items-start gap-3">
                <div className="bg-slate-800 p-1.5 rounded-lg text-slate-300 shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </div>
                <span>Toque no menu <strong>(três pontos)</strong> no canto superior do Chrome.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-slate-800 p-1.5 rounded-lg text-slate-300 shrink-0 mt-0.5">
                  <Download className="w-3.5 h-3.5" />
                </div>
                <span>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à Tela Inicial"</strong>.</span>
              </li>
            </ul>
          )}
        </div>

        <p className="text-[10px] text-slate-500 font-mono mt-6">
          Após instalar, abra o Vértice-TO pelo ícone na sua tela inicial.
        </p>
      </div>
    </div>
  );
};
