export interface PushNotificationPayload {
  id: string;
  agentId: string;
  title: string;
  body: string;
  type: 'approval' | 'mission';
  timestamp: string;
  read: boolean;
}

export const notificationService = {
  // Solicitar permissão de Notificações Web Push nativas do navegador/dispositivo
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn("Este navegador não suporta Notificações Web Push.");
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  // Disparar Notificação Web Push Nativa no Navegador / Celular do Agente
  sendNativePush(title: string, body: string, iconUrl?: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: iconUrl || '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200]
        });
      } catch (err) {
        console.warn("Erro ao disparar Web Push nativo:", err);
      }
    }
  }
};
