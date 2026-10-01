# Vértice-TO - Registro de Memória (A-Team)

## Atualizações Recentes

**01/10/2026**
- **Design e Cores (UI):** Padronização das cores dos status na SidebarPanel e Navbar (Livre: #10B981, A Caminho: #F59E0B, Atendimento: #9aa3b3).
- **Interatividade no Mapa:** 
  - Tooltips agora são Popups nativos do Leaflet (ancorados ao agente, não somem ao retirar o mouse).
  - Inclusão do destino no modal popup de agentes A Caminho ou em Atendimento.
  - Adição do Modo Foco ('ISOLAR E FOCAR NA ROTA') que oculta painéis laterais e esconde outros agentes, mantendo o foco exclusivo no agente rastreado.
- **Resumo do Turno:** Inserção do botão 'Ver Resumo do Turno' que abre o AgentDetailsModal, exibindo Km rodados, Horas de atividade, Corridas e Avaliação Média.
- **UX Global:** 
  - Adicionado botão Inteligente de Zoom (Ajustar Zoom / Maximize) na barra de ferramentas superior. O mapa calcula e enquadra automaticamente a área com base no filtro de agentes ativado.
- **Deployments:** 
  - Scripts criados para deploy automático via FTP em pastas isoladas (/TO/lab e /TO/homolog) para evitar conflitos de file-locking pelo Google Drive.

---
