import React, { useRef, useEffect } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { modules } from '../../utils/menuData';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  setActiveModule: (val: string) => void;
}

export default function Header({ searchQuery, setSearchQuery, setActiveModule }: HeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = searchQuery.trim().toUpperCase();
      let targetModuleId = null;
      
      for (const mod of modules) {
        const foundItem = mod.items.find(item => item.shortcut === query || item.id.toUpperCase() === query);
        if (foundItem) {
          targetModuleId = foundItem.id;
          break;
        }
      }

      if (targetModuleId) {
        setActiveModule(targetModuleId);
        setSearchQuery('');
      } else {
        alert(`Transação "${query}" não encontrada.`);
      }
    }
  };

  return (
    <header className="bg-[#354A5F] text-white h-12 px-4 flex items-center justify-between shadow-md w-full z-50 shrink-0">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveModule('dashboard')}>
          <span className="bg-white text-[#354A5F] text-xs font-bold px-1.5 py-0.5 rounded-sm">WMS</span>
          <span className="font-semibold tracking-wide text-sm">Logistics Cloud</span>
        </div>
      </div>

      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-300">
          <Search className="w-4 h-4" />
        </span>
        <input
          ref={searchInputRef}
          type="text"
          className="w-full bg-[#2A3A4A] text-white text-sm rounded-sm pl-10 pr-14 py-1.5 focus:outline-none border border-[#42586D] focus:border-[#91C8F2] transition-colors placeholder-slate-400"
          placeholder="Buscar transação (ex: 035, 101)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleGlobalSearch}
        />
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[10px] text-slate-400 font-mono">
          Ctrl + K
        </span>
      </div>

      <div className="flex items-center space-x-5 text-slate-200">
        <button className="relative hover:text-white transition">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">2</span>
        </button>
        <div className="flex items-center space-x-2 border-l border-[#5C6F82] pl-4 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-[#0A6ED1] flex items-center justify-center text-white font-bold text-xs">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium text-white">Operador Logística</span>
        </div>
      </div>
    </header>
  );
}