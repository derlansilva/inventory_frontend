import React, { useState, useEffect } from 'react';
import { Search, FileText, Printer, ArrowRight, ShieldAlert, Calendar, RefreshCw, Box, Headphones } from 'lucide-react';
import SapAlertModal from '../SapAlertModal';
import { apiServices } from '../../services/apiServices';

interface Romaneio {
  id: string;
  manifestCode: string;
  nfNumber: string;
  customerName: string;
  date: string;
  status: 'ABERTO' | 'CONCLUIDO' | 'AGUARDANDO_XML';
  totalVolumes: number;
  scannedItems: number;
  totalItems: number;
}

export default function CentralSac() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  
  const [romaneios, setRomaneios] = useState<Romaneio[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRomaneio, setSelectedRomaneio] = useState<Romaneio | null>(null);

  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'warning' | 'error' | 'info'>('info');

  const showAlert = (msg: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setAlertMessage(msg);
    setAlertType(type);
    setAlertOpen(true);
  };

  // Simulação de dados (Mock) - Substituir pela chamada apiServices.getManifests(filters)
  const fetchRomaneios = () => {
    setLoading(true);
    
    // Simulando uma chamada de API com delay de 500ms
    setTimeout(() => {
      const mockData: Romaneio[] = [
        {
          id: '1',
          manifestCode: 'REC-591683',
          nfNumber: '8218174',
          customerName: 'ATEFARMA COM MED LTDA',
          date: new Date().toISOString().split('T')[0],
          status: 'ABERTO',
          totalVolumes: 5,
          scannedItems: 15,
          totalItems: 41
        },
        {
          id: '2',
          manifestCode: 'REC-591684',
          nfNumber: '550012',
          customerName: 'DROGARIA SAO PAULO S/A',
          date: new Date().toISOString().split('T')[0],
          status: 'CONCLUIDO',
          totalVolumes: 2,
          scannedItems: 25,
          totalItems: 25
        },
        {
          id: '3',
          manifestCode: 'REC-591600',
          nfNumber: '112233',
          customerName: 'FARMACIAS NIPON S/A',
          date: '2026-11-06',
          status: 'AGUARDANDO_XML',
          totalVolumes: 1,
          scannedItems: 0,
          totalItems: 0
        }
      ];

      // Aplica os filtros de pesquisa na lista mockada
      let filtered = mockData;

      if (filterDate) {
        filtered = filtered.filter(r => r.date === filterDate);
      }

      if (filterStatus !== 'TODOS') {
        filtered = filtered.filter(r => r.status === filterStatus);
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(r => 
          r.manifestCode.toLowerCase().includes(q) || 
          r.nfNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q)
        );
      }

      setRomaneios(filtered);
      setLoading(false);
    }, 500);
  };

  // Recarrega os dados quando os filtros mudam
  useEffect(() => {
    fetchRomaneios();
  }, [filterDate, filterStatus]);

  const handleSearch = () => {
    fetchRomaneios();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ABERTO':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-700 text-[10px] font-bold"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/> Em Aberto</span>;
      case 'CONCLUIDO':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Concluído</span>;
      case 'AGUARDANDO_XML':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-red-200 bg-red-50 text-red-700 text-[10px] font-bold"><div className="w-1.5 h-1.5 rounded-full bg-red-500"/> Sem XML</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-50 w-full h-full p-4 font-sans text-xs text-slate-700 flex flex-col overflow-hidden">
      
      <SapAlertModal isOpen={alertOpen} message={alertMessage} type={alertType} onClose={() => setAlertOpen(false)} />

      {/* CABEÇALHO DA PÁGINA */}
      <div className="bg-white border border-slate-200 rounded-t-lg p-4 shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-[#002B49] p-1.5 rounded-md">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Central de Romaneios</h2>
              <p className="text-[11px] text-slate-500">Consulte, filtre e acompanhe as devoluções do dia.</p>
            </div>
          </div>
          <button 
            onClick={fetchRomaneios}
            className="text-slate-500 hover:text-[#002B49] flex items-center gap-1.5 font-bold text-[11px] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="flex flex-wrap items-end gap-3">
          
          <div className="flex flex-col space-y-1 w-full max-w-md">
            <label className="text-[10px] font-bold text-slate-500 uppercase pl-1">Pesquisar Romaneio / NF / Cliente</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: REC-591683, 8218174 ou ATEFARMA..." 
                className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-1.5 rounded text-xs text-slate-800 focus:ring-1 focus:ring-[#002B49] outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase pl-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Data</label>
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 px-3 py-1.5 rounded text-xs text-slate-800 focus:ring-1 focus:ring-[#002B49] outline-none transition-all"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase pl-1">Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 px-3 py-1.5 rounded text-xs text-slate-800 focus:ring-1 focus:ring-[#002B49] outline-none transition-all w-40"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="ABERTO">Em Aberto</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="AGUARDANDO_XML">Aguardando XML</option>
            </select>
          </div>

          <button 
            onClick={handleSearch}
            className="bg-[#002B49] hover:bg-[#003d66] text-white px-5 py-1.5 rounded font-bold shadow-sm transition-all flex items-center gap-1.5 h-[30px]"
          >
            <Search className="w-3.5 h-3.5" />
            Buscar
          </button>
        </div>
      </div>

      {/* TABELA DE RESULTADOS */}
      <div className="bg-white border border-t-0 border-slate-200 rounded-b-lg shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin text-[#002B49] opacity-50" />
              <p className="text-xs font-bold">Buscando romaneios...</p>
            </div>
          ) : romaneios.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <ShieldAlert className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">Nenhum romaneio encontrado</p>
              <p className="text-xs">Tente mudar a data ou o status do filtro.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Romaneio</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">NF</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Cliente</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Data</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] text-center">Volumes</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] w-40">Progresso</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {romaneios.map((rom) => (
                  <tr key={rom.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-4 py-3 font-mono font-bold text-[#002B49]">{rom.manifestCode}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{rom.nfNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{rom.customerName}</td>
                    <td className="px-4 py-3 text-slate-500">{rom.date.split('-').reverse().join('/')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-200">
                        {rom.totalVolumes} cx
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {rom.status === 'AGUARDANDO_XML' ? (
                         <span className="text-slate-400 italic text-[10px]">Aguardando importação</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${rom.scannedItems === rom.totalItems ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{ width: `${Math.min(100, (rom.scannedItems / (rom.totalItems || 1)) * 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-600 w-10 text-right">
                            {rom.scannedItems}/{rom.totalItems}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(rom.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSelectedRomaneio(rom)}
                        className="text-[#002B49] hover:text-blue-700 font-bold text-[11px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 justify-end ml-auto"
                      >
                        Detalhes <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* RODAPÉ DA TABELA */}
        <div className="bg-slate-50 border-t border-slate-200 p-2 px-4 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-500 font-mono">Total: {romaneios.length} registro(s)</span>
          <button 
            onClick={() => showAlert('Aqui você pode exportar um relatório em PDF ou Excel.', 'info')}
            className="text-slate-500 hover:text-[#002B49] flex items-center gap-1.5 font-bold text-[11px] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Exportar
          </button>
        </div>
      </div>

      {/* MODAL DE DETALHES DO ROMANEIO (Opcional para expandir depois) */}
      {selectedRomaneio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="bg-[#002B49] p-3 px-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-400" />
                Detalhes do Romaneio: {selectedRomaneio.manifestCode}
              </h3>
              <button onClick={() => setSelectedRomaneio(null)} className="text-white/70 hover:text-white font-bold">X</button>
            </div>
            <div className="p-5 space-y-4 text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Nota Fiscal</span>
                  <span className="font-mono text-sm font-bold">{selectedRomaneio.nfNumber}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Cliente</span>
                  <span className="font-medium">{selectedRomaneio.customerName}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Data Entrada</span>
                  <span>{selectedRomaneio.date.split('-').reverse().join('/')}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Status</span>
                  {getStatusBadge(selectedRomaneio.status)}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <p className="text-xs text-slate-500 text-center">Aqui você pode carregar os itens da nota fiscal, logs de bipagem, e imprimir o romaneio.</p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-end">
              <button onClick={() => setSelectedRomaneio(null)} className="bg-[#002B49] text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-blue-900">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}