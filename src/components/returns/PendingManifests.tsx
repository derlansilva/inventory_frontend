import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Copy, Check, ArrowLeft, PackageOpen, AlertTriangle, Loader2 } from 'lucide-react';
import { apiServices } from '../../services/apiServices';

interface InvoiceData {
  invoiceNumber: string;
  status: 'WAITING_XML' | 'IMPORTED';
}

interface ManifestData {
  id: string;
  receivingCode: string;
  date: string;
  volumes: number;
  invoices: InvoiceData[];
}

export default function PendingManifests() {
  const [manifests, setManifests] = useState<ManifestData[]>([]); 
  const [isLoading, setIsLoading] = useState(true); 
  
  const [selectedManifest, setSelectedManifest] = useState<ManifestData | null>(null);
  const [copiedNf, setCopiedNf] = useState<string | null>(null);
  
  const [uploadingNf, setUploadingNf] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nfParaUploadRef = useRef<string | null>(null);

  const fetchManifests = async () => {
    try {
      setIsLoading(true);
      const data = await apiServices.getReceivingManifests();
      console.log("Dados recebidos do backend:", data); // Ajuda a debugar no F12

      const formattedData = data.map((m: any) => ({
        ...m,
        date: new Date(m.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
      }));

      setManifests(formattedData);
    } catch (error: any) {
      console.error("Erro ao buscar manifestos. Status do Backend:", error.response?.status, error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManifests();
  }, []);

  const handleCopyNf = (nf: string) => {
    navigator.clipboard.writeText(nf);
    setCopiedNf(nf);
    setTimeout(() => setCopiedNf(null), 2000);
  };

  const triggerUpload = (nfNumber: string) => {
    nfParaUploadRef.current = nfNumber;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const nfEsperada = nfParaUploadRef.current;

    if (!file || !nfEsperada || !selectedManifest) return;

    setUploadingNf(nfEsperada);
    setAlertMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const xmlText = event.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        // --- 1. EXTRAÇÃO DOS DADOS DO XML ---
        const nfNumberXml = xmlDoc.querySelector("nNF")?.textContent || "";
        const customerName = xmlDoc.querySelector("dest > xNome")?.textContent || "Cliente Desconhecido";
        
        const detItens = xmlDoc.querySelectorAll("det");
        const items: any[] = [];

        detItens.forEach(det => {
          items.push({
            code: det.querySelector("cProd")?.textContent || "",
            ean: det.querySelector("cEAN")?.textContent || "", // <-- ADICIONE ESTA LINHA
            desc: det.querySelector("xProd")?.textContent || "",
            noteQty: Number(det.querySelector("qCom")?.textContent || 0),
            batch: det.querySelector("nLote")?.textContent || "S/L"
          });
        });

        // --- 2. VALIDAÇÃO ---
        const nfXmlLimpa = nfNumberXml.replace(/^0+/, '');
        const nfEsperadaLimpa = nfEsperada.replace(/^0+/, '');

        if (nfXmlLimpa !== nfEsperadaLimpa) {
          setAlertMsg({ 
            type: 'error', 
            text: `Erro: O XML é da NF ${nfNumberXml}, mas você selecionou a NF ${nfEsperada}.` 
          });
          setUploadingNf(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        // --- 3. ENVIO PARA O BACKEND ---
        const payload = {
          invoiceNumber: nfNumberXml,
          customerName: customerName,
          items: items // Enviando a lista de itens que o backend vai salvar
        };

        await apiServices.uploadXml(
          selectedManifest.receivingCode, 
          nfEsperada, 
          payload
        );

        // --- 4. ATUALIZAÇÃO VISUAL ---
        const updatedInvoices = selectedManifest.invoices.map(inv => 
          inv.invoiceNumber === nfEsperada ? { ...inv, status: 'IMPORTED' as const } : inv
        );
        
        setSelectedManifest({ ...selectedManifest, invoices: updatedInvoices });
        
        setManifests(prev => prev.map(m => 
          m.id === selectedManifest.id ? { ...m, invoices: updatedInvoices } : m
        ));

        setAlertMsg({ type: 'success', text: `XML da NF ${nfNumberXml} (${items.length} itens) enviado com sucesso!` });
        
      } catch (error: any) {
        console.error("Erro no upload:", error);
        setAlertMsg({ type: 'error', text: error.response?.data || 'Erro ao ler ou enviar o XML.' });
      } finally {
        setUploadingNf(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // ==========================================
  // TELA 1: LISTA DE MANIFESTOS
  // ==========================================
  if (!selectedManifest) {
    return (
      <div className="w-full h-[calc(100vh-180px)] flex flex-col bg-slate-50 p-4 overflow-hidden">
        <div className="max-w-[1200px] w-full mx-auto flex flex-col flex-1 min-h-0 space-y-3">
          
          <div className="bg-white p-3 px-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between shrink-0">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <PackageOpen className="w-4 h-4 text-[#002B49]" />
              Manifestos de Recebimento
            </h3>
            <button onClick={fetchManifests} className="text-xs font-bold text-blue-600 hover:underline">
              Atualizar Lista
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="overflow-y-auto flex-1 relative">
              
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
                  <Loader2 className="w-8 h-8 text-[#002B49] animate-spin mb-2" />
                  <p className="text-xs font-bold text-slate-500">Buscando manifestos...</p>
                </div>
              )}

              <table className="w-full text-left text-xs relative">
                <thead className="bg-[#002B49] text-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Código / Data</th>
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] text-center w-32">Volumes</th>
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] text-center w-32">Qtd NFs</th>
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] text-right w-40">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {manifests.map((manifest) => (
                    <tr 
                      key={manifest.id} 
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedManifest(manifest)}
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-mono font-bold text-[#002B49] text-[13px] group-hover:text-blue-700">{manifest.receivingCode}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{manifest.date}</div>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                          {manifest.volumes} cx
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center font-bold text-slate-600 text-[11px]">
                        {manifest.invoices.length} notas
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button className="text-[#002B49] font-bold text-[10px] group-hover:underline uppercase tracking-wide">
                          Abrir &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!isLoading && manifests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                        Nenhum manifesto pendente no momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA 2: DETALHES E UPLOAD
  // ==========================================
  return (
    <div className="w-full h-[calc(100vh-180px)] flex flex-col bg-slate-50 p-4 overflow-hidden">
      <input type="file" accept=".xml" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      <div className="max-w-[1200px] w-full mx-auto flex flex-col flex-1 min-h-0 space-y-3">
        <div className="bg-white p-3 px-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSelectedManifest(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-1.5 rounded transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                Manifesto: <span className="text-[#002B49] font-mono text-base">{selectedManifest.receivingCode}</span>
              </h3>
            </div>
          </div>
        </div>

        {alertMsg && (
          <div className={`p-3 rounded-lg border text-xs font-bold flex items-center space-x-2 shadow-sm animate-in fade-in slide-in-from-top-2 ${
            alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{alertMsg.text}</span>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-xs relative">
              <thead className="bg-[#002B49] text-white sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Número da Nota Fiscal</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] text-center w-32">Status</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] text-center w-40">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedManifest.invoices.map((inv) => (
                  <tr key={inv.invoiceNumber} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center space-x-2">
                        <div className="bg-pink-50 border border-pink-200 px-2 py-1 rounded text-pink-700 font-mono font-bold text-[11px]">
                          {inv.invoiceNumber}
                        </div>
                        <button onClick={() => handleCopyNf(inv.invoiceNumber)} title="Copiar número da NF" className="text-slate-400 hover:text-[#002B49] transition-colors p-1">
                          {copiedNf === inv.invoiceNumber ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {inv.status === 'WAITING_XML' ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200">
                          <AlertCircle className="w-3 h-3" /> Pendente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Importado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button 
                        onClick={() => triggerUpload(inv.invoiceNumber)}
                        disabled={inv.status === 'IMPORTED' || uploadingNf === inv.invoiceNumber}
                        className="bg-[#002B49] hover:bg-[#003d66] disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded font-bold flex items-center justify-center space-x-1.5 mx-auto transition-all shadow-sm text-[10px] w-32"
                      >
                        {uploadingNf === inv.invoiceNumber ? (
                          <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3 h-3"></span><span>Lendo...</span></>
                        ) : (
                          <><UploadCloud className="w-3.5 h-3.5" /><span>{inv.status === 'IMPORTED' ? 'Importado' : 'Upload XML'}</span></>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}