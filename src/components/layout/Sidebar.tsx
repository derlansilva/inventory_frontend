import React, { useState } from 'react';
import { Menu, Search, Settings, X, ChevronDown, ChevronRight } from 'lucide-react';
import { modules, type MenuItem } from '../../utils/menuData';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (val: string) => void;
}

export default function Sidebar({ activeModule, setActiveModule }: SidebarProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [expandedMenu, setExpandedMenu] = useState<string | null>('operacional');

  const toggleMenu = (menuId: string) => {
    if (!isSidebarExpanded) setIsSidebarExpanded(true);
    setExpandedMenu(prev => prev === menuId ? null : menuId);
  };

  return (
    <aside 
      className={`${
        isSidebarExpanded ? 'w-56' : 'w-10'
      } bg-[#354A5F] text-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out relative z-40 shrink-0 border-r border-[#2A3A4A] select-none`}
    >
      <div className="flex flex-col h-full">
        <div className={`h-10 flex items-center border-b border-[#2A3A4A] shrink-0 px-1 ${isSidebarExpanded ? 'justify-end' : 'justify-center'}`}>
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="text-slate-300 hover:text-white hover:bg-[#2A3A4A] p-1 rounded transition cursor-pointer"
          >
            {isSidebarExpanded ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isSidebarExpanded && (
          <div className="p-1.5 border-b border-[#2A3A4A] animate-in fade-in duration-200">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
              <input 
                type="text"
                placeholder="Pesquisar..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full bg-[#2A3A4A] text-white text-[10px] rounded-sm pl-7 pr-2 py-1 border border-[#42586D] focus:outline-none focus:border-[#91C8F2] placeholder-slate-400"
              />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-1 space-y-0.5 px-1">
          {!isSidebarExpanded ? (
            <div className="flex flex-col items-center space-y-2 pt-2">
              {modules.map(mod => (
                  <button 
                    key={mod.id} 
                    onClick={() => toggleMenu(mod.id)}
                    className={`p-1.5 rounded transition-colors ${
                      expandedMenu === mod.id ? 'bg-[#2A3A4A] text-white' : 'text-slate-400 hover:bg-[#2A3A4A] hover:text-white'
                    }`}
                  >
                    <mod.icon className="w-4 h-4" />
                  </button>
              ))}
            </div>
          ) : (
            modules.map((mod) => (
              <div key={mod.id} className="mb-0.5">
                <button
                  onClick={() => toggleMenu(mod.id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-semibold rounded-sm transition-colors ${
                    expandedMenu === mod.id ? 'text-white bg-[#2A3A4A]' : 'text-slate-300 hover:text-white hover:bg-[#2A3A4A]/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <mod.icon className={`w-3.5 h-3.5 ${expandedMenu === mod.id ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className="uppercase tracking-wide truncate">{mod.label}</span>
                  </div>
                  {expandedMenu === mod.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>

                {expandedMenu === mod.id && (
                  <div className="mt-0.5 ml-1.5 pl-1.5 border-l border-[#5C6F82]/50 space-y-0.5 animate-in slide-in-from-top-1">
                    {mod.items.map((item: MenuItem) => {
                      const isActive = activeModule === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveModule(item.id)}
                          className={`w-full h-7 flex items-center px-1.5 rounded-sm text-[10px] transition-colors ${
                            isActive 
                              ? 'bg-[#0A6ED1] text-white font-semibold' 
                              : 'text-slate-400 hover:bg-[#2A3A4A] hover:text-white'
                          }`}
                        >
                          <item.icon className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                          
                          {item.shortcut && (
                            <span className={`ml-auto text-[8px] font-mono px-1 rounded ${isActive ? 'bg-blue-800 text-blue-200' : 'bg-[#2A3A4A] text-slate-500'}`}>
                              {item.shortcut}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </nav>
      </div>

      <div className="p-1 border-t border-[#2A3A4A]">
        <div className="relative group flex items-center">
          <button 
            className={`w-full h-7 flex items-center ${
              isSidebarExpanded ? 'px-2 justify-start space-x-1.5' : 'justify-center'
            } rounded-sm text-[10px] font-medium text-slate-300 hover:bg-[#2A3A4A] hover:text-white transition`}
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            {isSidebarExpanded && <span className="truncate">Configurações</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}