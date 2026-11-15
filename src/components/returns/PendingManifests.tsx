import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Copy, Check, ArrowLeft, Truck, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiServices } from '../../services/apiServices';

interface InvoiceData {
  invoiceNumber: string;
  status: 'WAITING_XML' | 'IMPORTED' | 'IN_PROGRESS' | 'CLOSED';
}

interface ManifestData {
  id: string;
  manifestCode: string;
  date: string;
  volumes: number;
  invoices: InvoiceData[];
}

export default function PendingManifests() {
  const [manifests, setManifests] = useState<ManifestData[]>([]); 
  const [isLoading, setIsLoading] = useState(true); 
  
  const [selectedManifest, setSelectedManifest] = useState<ManifestData | null>(null);
  const [copiedInvoice, setCopiedInvoice] = useState<string | null>(null);
  
  const [uploadingInvoice, setUploadingInvoice] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const invoiceToUploadRef = useRef<string | null>(null);

  const fetchManifests = async () => {
    try {
      setIsLoading(true);
      const data = await apiServices.getReceivingManifests();
      
      const formattedData: ManifestData[] = data.map((m: any) => ({
        id: m.id.toString(),
        manifestCode: m.manifestCode || 'GAM-NO-CODE',
        date: new Date(m.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
        volumes: m.volumes || 0,
        invoices: m.invoices ? m.invoices.map((inv: any) => ({
          invoiceNumber: inv.invoiceNumber,
          status: inv.status
        })) : []
      }));

      setManifests(formattedData);
    } catch (error: any) {
      console.error("Error fetching manifests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManifests();
  }, []);

  const handleCopyInvoice = (invoiceNumber: string) => {
    navigator.clipboard.writeText(invoiceNumber);
    setCopiedInvoice(invoiceNumber);
    setTimeout(() => setCopiedInvoice(null), 2000);
  };

  const triggerUpload = (invoiceNumber: string) => {
    invoiceToUploadRef.current = invoiceNumber;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const expectedInvoice = invoiceToUploadRef.current;

    if (!file || !expectedInvoice || !selectedManifest) return;

    setUploadingInvoice(expectedInvoice);
    setAlertMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const xmlText = event.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        const xmlInvoiceNumber = xmlDoc.querySelector("nNF")?.textContent || "";
        const customerName = xmlDoc.querySelector("dest > xNome")?.textContent || "Unknown Customer";
        
        const detailItems = xmlDoc.querySelectorAll("det");
        const items: any[] = [];

        detailItems.forEach(det => {
          items.push({
            code: det.querySelector("cProd")?.textContent || "",
            ean: det.querySelector("cEAN")?.textContent || "",
            desc: det.querySelector("xProd")?.textContent || "",
            noteQty: Number(det.querySelector("qCom")?.textContent || 0),
            batch: det.querySelector("rastro > nLote")?.textContent || det.querySelector("nLote")?.textContent || "S/L"
          });
        });

        const cleanXmlInvoice = xmlInvoiceNumber.replace(/^0+/, '');
        const cleanExpectedInvoice = expectedInvoice.replace(/^0+/, '');

        if (cleanXmlInvoice !== cleanExpectedInvoice) {
          setAlertMessage({ 
            type: 'error', 
            text: `Erro: O XML é da NF ${xmlInvoiceNumber}, mas você selecionou a NF ${expectedInvoice}.` 
          });
          setUploadingInvoice(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        const payload = {
          invoiceNumber: xmlInvoiceNumber,
          customerName: customerName,
          items: items
        };

        await apiServices.uploadXml(
          selectedManifest.manifestCode, 
          expectedInvoice, 
          payload
        );

        // Atualiza a tela para mostrar como importado
        const updatedInvoices = selectedManifest.invoices.map(inv => 
          inv.invoiceNumber === expectedInvoice ? { ...inv, status: 'IMPORTED' as const } : inv
        );
        
        setSelectedManifest({ ...selectedManifest, invoices: updatedInvoices });
        
        setManifests(prev => prev.map(m => 
          m.id === selectedManifest.id ? { ...m, invoices: updatedInvoices } : m
        ));

        setAlertMessage({ type: 'success', text: `XML da NF ${xmlInvoiceNumber} (${items.length} itens) enviado com sucesso!` });
        
      } catch (error: any) {
        setAlertMessage({ type: 'error', text: error.response?.data || 'Erro ao ler ou enviar o XML.' });
      } finally {
        setUploadingInvoice(null);
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
          
          {/* CABEÇALHO DA TELA */}
          <div className="bg-white p-3 px-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between shrink-0">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#354A5F]" />
              Manifestos Pendentes (Aguardando XML)
            </h3>
            <button 
              onClick={fetchManifests} 
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#354A5F] hover:bg-[#2A3A4A] border border-[#2A3A4A] px-3 py-1.5 rounded shadow-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              ATUALIZAR LISTA
            </button>
          </div>

          {/* TABELA */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="overflow-y-auto flex-1 relative">
              
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
                  <Loader2 className="w-8 h-8 text-[#354A5F] animate-spin mb-2" />
                  <p className="text-xs font-bold text-slate-500">Buscando manifestos pendentes...</p>
                </div>
              )}

              <table className="w-full text-left text-xs relative">
                <thead className="bg-[#354A5F] text-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Código Manifesto</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center w-32">Volumes</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center w-32">NFs Pendentes</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-right w-40">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {manifests.map((manifest) => (
                    <tr 
                      key={manifest.id} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedManifest(manifest)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-[#354A5F] text-[13px] group-hover:text-blue-700">{manifest.manifestCode}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{manifest.date}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                          {manifest.volumes} cx
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                          {manifest.invoices.length} pendentes
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-[#354A5F] font-bold text-[10px] group-hover:underline uppercase tracking-wide flex items-center justify-end gap-1 w-full">
                          Abrir <span className="text-lg leading-none">&rarr;</span>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!isLoading && manifests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                          <p className="font-medium text-sm">Tudo em dia!</p>
                          <p className="text-xs">Nenhum manifesto pendente de importação no momento.</p>
                        </div>
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
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                Manifesto: <span className="text-[#354A5F] font-mono text-base">{selectedManifest.manifestCode}</span>
              </h2>
            </div>
          </div>
        </div>

        {alertMessage && (
          <div className={`p-3 rounded-lg border text-xs font-bold flex items-center space-x-2 shadow-sm animate-in fade-in slide-in-from-top-2 ${
            alertMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {alertMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{alertMessage.text}</span>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-xs relative">
              <thead className="bg-[#354A5F] text-white sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Número da Nota Fiscal</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center w-32">Status</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center w-40">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedManifest.invoices.map((invoice) => (
                  <tr key={invoice.invoiceNumber} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-700 font-mono font-bold text-[11px]">
                          {invoice.invoiceNumber}
                        </div>
                        <button onClick={() => handleCopyInvoice(invoice.invoiceNumber)} title="Copy Invoice Number" className="text-slate-400 hover:text-[#354A5F] transition-colors p-1">
                          {copiedInvoice === invoice.invoiceNumber ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {invoice.status === 'WAITING_XML' ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200">
                          <AlertCircle className="w-3 h-3" /> Pendente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Importado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => triggerUpload(invoice.invoiceNumber)}
                        disabled={invoice.status === 'IMPORTED' || uploadingInvoice === invoice.invoiceNumber}
                        className="bg-[#354A5F] hover:bg-[#2A3A4A] disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded font-bold flex items-center justify-center space-x-1.5 mx-auto transition-all shadow-sm text-[10px] w-32"
                      >
                        {uploadingInvoice === invoice.invoiceNumber ? (
                          <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3 h-3"></span><span>Lendo...</span></>
                        ) : (
                          <><UploadCloud className="w-3.5 h-3.5" /><span>{invoice.status === 'IMPORTED' ? 'Importado' : 'Upload XML'}</span></>
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