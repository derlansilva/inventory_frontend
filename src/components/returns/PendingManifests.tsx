import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Copy, Check, ArrowLeft, Truck, Loader2, AlertTriangle } from 'lucide-react';
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
      
      console.log("DADOS DO BACKEND:", data); // Olhe isso no F12 do navegador!

      const formattedData: ManifestData[] = data.map((m: any) => {
        return {
          id: String(m.id || Math.random()),
          manifestCode: m.manifestCode || 'GAM-NO-CODE',
          date: m.date ? new Date(m.date).toLocaleString('pt-BR') : '-',
          volumes: m.volumes || 0,
          invoices: m.invoices || []
        };
      });

      setManifests(formattedData);
    } catch (error: any) {
      console.error("Erro na API:", error);
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
            text: `Error: The XML belongs to Invoice ${xmlInvoiceNumber}, but you selected Invoice ${expectedInvoice}.` 
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

        // AQUI ESTÁ A CHAMADA AJUSTADA (Apenas Manifesto e NF)
        await apiServices.uploadXml(
          selectedManifest.manifestCode, 
          expectedInvoice, 
          payload
        );

        const updatedInvoices = selectedManifest.invoices.map(inv => 
          inv.invoiceNumber === expectedInvoice ? { ...inv, status: 'IMPORTED' as const } : inv
        );
        
        setSelectedManifest({ ...selectedManifest, invoices: updatedInvoices });
        
        setManifests(prev => prev.map(m => 
          m.id === selectedManifest.id ? { ...m, invoices: updatedInvoices } : m
        ));

        setAlertMessage({ type: 'success', text: `XML da NF ${xmlInvoiceNumber} (${items.length} itens) enviado com sucesso!` });
        
      } catch (error: any) {
        setAlertMessage({ type: 'error', text: error.response?.data || 'Error reading or uploading XML.' });
      } finally {
        setUploadingInvoice(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // ==========================================
  // SCREEN 1: MANIFEST LIST
  // ==========================================
  if (!selectedManifest) {
    return (
      <div className="w-full h-[calc(100vh-180px)] flex flex-col bg-slate-50 p-4 overflow-hidden">
        <div className="max-w-[1200px] w-full mx-auto flex flex-col flex-1 min-h-0 space-y-3">
          
          <div className="bg-white p-3 px-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between shrink-0">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#002B49]" />
              Manifesto de Recebimento
            </h3>
            <button onClick={fetchManifests} className="text-xs font-bold text-blue-600 hover:underline">
              Refresh List
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="overflow-y-auto flex-1 relative">
              
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
                  <Loader2 className="w-8 h-8 text-[#002B49] animate-spin mb-2" />
                  <p className="text-xs font-bold text-slate-500">atualizar...</p>
                </div>
              )}

              <table className="w-full text-left text-xs relative">
                <thead className="bg-[#002B49] text-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Manifest Code</th>
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] text-center w-32">Volumes</th>
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] text-center w-32">Total Invoices</th>
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] text-right w-40">Action</th>
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
                        <div className="font-mono font-bold text-[#002B49] text-[13px] group-hover:text-blue-700">{manifest.manifestCode}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{manifest.date}</div>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                          {manifest.volumes} cx
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center font-bold text-slate-600 text-[11px]">
                        {manifest.invoices.length} invoices
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button className="text-[#002B49] font-bold text-[10px] group-hover:underline uppercase tracking-wide">
                          Open &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!isLoading && manifests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                        No pending manifests at the moment.
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
  // SCREEN 2: INVOICE DETAILS AND UPLOAD
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
                Manifest: <span className="text-[#002B49] font-mono text-base">{selectedManifest.manifestCode}</span>
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
              <thead className="bg-[#002B49] text-white sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Invoice Number</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] text-center w-32">Status</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] text-center w-40">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedManifest.invoices.map((invoice) => (
                  <tr key={invoice.invoiceNumber} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center space-x-2">
                        <div className="bg-pink-50 border border-pink-200 px-2 py-1 rounded text-pink-700 font-mono font-bold text-[11px]">
                          {invoice.invoiceNumber}
                        </div>
                        <button onClick={() => handleCopyInvoice(invoice.invoiceNumber)} title="Copy Invoice Number" className="text-slate-400 hover:text-[#002B49] transition-colors p-1">
                          {copiedInvoice === invoice.invoiceNumber ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {invoice.status === 'WAITING_XML' ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200">
                          <AlertCircle className="w-3 h-3" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Imported
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button 
                        onClick={() => triggerUpload(invoice.invoiceNumber)}
                        disabled={invoice.status === 'IMPORTED' || uploadingInvoice === invoice.invoiceNumber}
                        className="bg-[#002B49] hover:bg-[#003d66] disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded font-bold flex items-center justify-center space-x-1.5 mx-auto transition-all shadow-sm text-[10px] w-32"
                      >
                        {uploadingInvoice === invoice.invoiceNumber ? (
                          <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3 h-3"></span><span>Reading...</span></>
                        ) : (
                          <><UploadCloud className="w-3.5 h-3.5" /><span>{invoice.status === 'IMPORTED' ? 'Imported' : 'Upload XML'}</span></>
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