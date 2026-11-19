import type { LucideIcon } from 'lucide-react';
import { 
  PackageCheck, 
  Boxes, 
  RotateCcw, 
  Search, 
  BarChart3,
  LayoutDashboard,
  Box,
  FileSpreadsheet,
  Layers,
  Truck
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
}

export interface MenuModule {
  id: string;
  label: string;
  icon: LucideIcon;
  items: MenuItem[];
}

export const modules: MenuModule[] = [
  {
    id: 'home',
    label: 'Home',
    icon: LayoutDashboard,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    id: 'logistica',
    label: 'Logística',
    icon: Truck,
    items: [
      { id: 'receiving', label: 'Recebimento', icon: PackageCheck, shortcut: '035' },
      { id: 'picking', label: 'Separação', icon: Boxes, shortcut: '045' },
      { id: 'expedition', label: 'Expedição & Cargas', icon: Truck, shortcut: '055' },
    ]
  },
  {
    id: 'operacional',
    label: 'Operacional / Estoque',
    icon: Box,
    items: [
      { id: 'inventory', label: 'Gestão de Estoque', icon: BarChart3, shortcut: '001' },
      { id: 'returns', label: 'Devoluções & SAC', icon: RotateCcw, shortcut: '101' },
    ]
  },
  {
    id: 'gestao',
    label: 'Gestão',
    icon: Layers,
    items: [
      { id: 'reports', label: 'Relatórios Gerenciais', icon: FileSpreadsheet },
      { id: 'masterdata', label: 'Dados Mestres', icon: Layers },
    ]
  }
];

export const getModuleTitle = (activeModule: string) => {
  switch (activeModule) {
    case 'receiving': return 'Recebimento & NFe';
    case 'picking': return 'Separação & Picking';
    case 'returns': return 'Devoluções & SAC';
    case 'inventory': return 'Gestão de Estoque';
    case 'expedition': return 'Expedição & Cargas';
    case 'reports': return 'Relatórios Gerenciais';
    case 'masterdata': return 'Dados Mestres';
    default: return 'Painel Geral & Analytics';
  }
};