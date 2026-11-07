import api from "./api";

export const apiServices = {
  // Salva o romaneio completo (usado no painel)
  saveReturnManifest: async (manifestData: any) => {
    try {
      const response = await api.post('/returns/manifest', manifestData);
      return response.data;
    } catch (error) {
      console.error("Erro ao salvar romaneio de devolução:", error);
      throw error;
    }
  },

  // Busca o manifesto pelo código (usado no PC e na Coletora)
  getManifestByCode: async (manifestCode: string) => {
    try {
      const response = await api.get(`/returns/manifest/${manifestCode}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar manifesto:", error);
      throw error;
    }
  },

  // Salva o manifesto no backend
  saveManifestBackend: async (manifestData: any) => {
    try {
      const response = await api.post('/returns/manifest/update', manifestData);
      return response.data;
    } catch (error) {
      console.error("Erro ao salvar manifesto:", error);
      throw error;
    }
  },

  // NOVO: Método para dar baixa unitária ao bipar na Coletora Zebra
  scanItem: async (itemId: number) => {
    try {
      const response = await api.patch(`/returns/items/${itemId}/scan`);
      return response.data;
    } catch (error) {
      console.error("Erro ao bipar item na coletora:", error);
      throw error;
    }
  },

  createReceiving: async (data: any) => {
    const response = await api.post('/receiving/create', data);
    return response.data;
  },



  getReceivingManifests: async () => {
    try {
      const response = await api.get('/receiving/manifests'); // TEM QUE SER GET
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar manifestos:", error);
      throw error;
    }
  },

  // Envia o XML (POST)
  uploadXml: async (receivingCode: string, invoiceNumber: string, xmlData: any) => {
    try {
      const response = await api.post(`/receiving/upload-xml/${receivingCode}/${invoiceNumber}`, xmlData);
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar XML:", error);
      throw error;
    }
  },
  getInvoiceForScanning: async (invoiceNumber: string) => {
    try {
      const response = await api.get(`/receiving/scan-invoice/${invoiceNumber}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar NF:", error);
      throw error;
    }
  }
};