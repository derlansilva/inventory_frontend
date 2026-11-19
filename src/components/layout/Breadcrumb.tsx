import React from 'react';
import { getModuleTitle } from '../../utils/menuData';

interface BreadcrumbProps {
  activeModule: string;
  setActiveModule: (val: string) => void;
}

export default function Breadcrumb({ activeModule, setActiveModule }: BreadcrumbProps) {
  return (
    <div className="bg-[#42586D] text-slate-200 px-4 py-1.5 flex items-center justify-between text-xs shadow-sm border-b border-[#354A5F] shrink-0">
      <div className="flex items-center space-x-2">
        <span className="hover:text-white cursor-pointer transition" onClick={() => setActiveModule('dashboard')}>Home</span>
        <span className="text-slate-400">&gt;</span>
        <span className="font-semibold text-white">{getModuleTitle(activeModule)}</span>
      </div>
      <div className="text-[#91C8F2] font-mono text-[10px] flex items-center gap-1.5 bg-[#354A5F] px-2 py-0.5 rounded-sm border border-[#5C6F82]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        PROD-SIMULATOR 
      </div>
    </div>
  );
}