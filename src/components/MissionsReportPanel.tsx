import React, { useState } from 'react';
import { FileText, CheckCircle2, Clock, Navigation, Search, Download, Filter, BarChart3, ArrowUpRight } from 'lucide-react';
import { Objective } from '../types';

interface MissionsReportPanelProps {
  objectives: Objective[];
}

export const MissionsReportPanel: React.FC<MissionsReportPanelProps> = ({ objectives }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const total = objectives.length;
  const concluidas = objectives.filter(o => o.status === 'concluido').length;
  const emAndamento = objectives.filter(o => o.status === 'em_andamento' || o.status === 'atribuido').length;
  const taxaSucesso = total > 0 ? Math.round((concluidas / total) * 100) : 100;

  const filteredObjectives = objectives.filter(obj => {
    const matchesSearch = obj.passageiro_nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (obj.assigned_agent_nome && obj.assigned_agent_nome.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === 'todos' || obj.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (objectives.length === 0) {
      alert("Nenhuma missão cadastrada para exportação.");
      return;
    }

    const headers = "ID,Passageiro/Solicitante,Agente Atribuido,Status,Data Criacao,Data Conclusao\n";
    const rows = objectives.map(o => 
      `"${o.id}","${o.passageiro_nome}","${o.assigned_agent_nome || 'N/A'}","${o.status}","${o.created_at}","${o.concluido_em || 'Pendente'}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_vertice_to_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 space-y-4 font-sans text-xs h-full flex flex-col overflow-hidden">
      {/* Cards de Métricas KPIs */}
      <div className="grid grid-cols-3 gap-2 font-mono">
        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[10px] uppercase">TOTAL DE MISSÕES</span>
          <span className="text-lg font-bold text-white">{total}</span>
        </div>

        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[10px] uppercase">CONCLUÍDAS</span>
          <span className="text-lg font-bold text-emerald-400">{concluidas}</span>
        </div>

        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[10px] uppercase">TAXA SUCESSO</span>
          <span className="text-lg font-bold text-cyan-400">{taxaSucesso}%</span>
        </div>
      </div>

      {/* Barra de Ações: Busca + Exportar */}
      <div className="flex items-center justify-between gap-2 font-mono">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por passageiro ou agente..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 rounded-lg font-bold transition-all text-[11px]"
          title="Exportar dados em planilha CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>EXPORTAR CSV</span>
        </button>
      </div>

      {/* Lista de Missões */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredObjectives.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono bg-slate-950 rounded-xl border border-slate-800">
            Nenhuma missão encontrada.
          </div>
        ) : (
          filteredObjectives.map(obj => (
            <div key={obj.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{obj.passageiro_nome}</span>
                <span className={`font-mono text-[9px] px-2 py-0.5 rounded border ${
                  obj.status === 'concluido' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                  obj.status === 'atribuido' ? 'bg-blue-950 text-blue-300 border-blue-800' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {obj.status.toUpperCase()}
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                <div>Agente: <strong className="text-cyan-300">{obj.assigned_agent_nome || 'Designado'}</strong></div>
                <div>Criado em: <span>{new Date(obj.created_at).toLocaleTimeString()}</span></div>
                {obj.concluido_em && (
                  <div className="text-emerald-400">Concluído às: <span>{obj.concluido_em}</span></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
