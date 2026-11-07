import axios from 'axios';

// Se estiver rodando localmente, usa localhost. Se estiver na Vercel, usa a URL do Render.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

// ... (o resto do seu apiServices continua igual)
export default api;