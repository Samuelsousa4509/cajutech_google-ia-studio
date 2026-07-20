import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Trophy, MapPin, Award, Menu, X, Sun, Moon } from 'lucide-react';
import cajutechLogo from '../assets/images/cajutech_logo_1784564028674.jpg';

export default function Navbar({ onTabChange, activeTab }: { onTabChange: (tab: string) => void, activeTab: string }) {
  const { user, logoutUser, changeRegiao } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showRegionEdit, setShowRegionEdit] = useState(false);
  const [tempRegiao, setTempRegiao] = useState(user?.regiao || 'Piripiri - PI');

  if (!user) return null;

  const handleSaveRegiao = () => {
    changeRegiao(tempRegiao);
    setShowRegionEdit(false);
  };

  const getPerfilEmoji = (perfil: string) => {
    switch (perfil) {
      case 'professor': return '👨‍🏫';
      case 'agricultor': return '🌾';
      default: return '🎓';
    }
  };

  const getPerfilLabel = (perfil: string) => {
    switch (perfil) {
      case 'professor': return 'Professor';
      case 'agricultor': return 'Agricultor';
      default: return 'Estudante';
    }
  };

  return (
    <nav className="bg-white dark:bg-art-gray-bg border-b border-art-border shadow-sm sticky top-0 z-50 px-4 py-3 md:px-8 flex justify-between items-center transition-colors duration-300" id="main-navbar">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-black border border-art-border">
          <img 
            src={cajutechLogo} 
            alt="CajuTech Logo" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <h1 className="font-serif text-lg tracking-tight leading-none text-art-dark">
            CajuTech
          </h1>
          <span className="text-[9px] tracking-widest uppercase text-art-orange font-bold font-mono">
            Piauí Digital 🌿
          </span>
        </div>
      </div>

      {/* User Stats & Navigation Options */}
      <div className="flex items-center gap-4">
        {/* Region Indicator / Selector */}
        <div className="relative hidden sm:flex items-center gap-1.5 text-xs font-bold text-art-muted bg-art-bg dark:bg-art-bg/20 border border-art-border px-3 py-1.5 rounded-xl">
          <MapPin className="w-3.5 h-3.5 text-art-green" />
          {showRegionEdit ? (
            <div className="flex items-center gap-1">
              <select
                value={tempRegiao}
                onChange={e => setTempRegiao(e.target.value)}
                className="text-xs font-bold bg-white dark:bg-art-gray-bg text-art-dark outline-none"
              >
                <option value="Piripiri - PI">Piripiri - PI</option>
                <option value="Picos - PI">Picos - PI</option>
                <option value="Pio IX - PI">Pio IX - PI</option>
                <option value="Teresina - PI">Teresina - PI</option>
              </select>
              <button 
                onClick={handleSaveRegiao}
                className="text-[10px] text-art-green hover:underline px-1 font-extrabold"
              >
                Salvar
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowRegionEdit(true)}
              className="hover:text-art-green transition-all text-[11px]"
            >
              {user.regiao}
            </button>
          )}
        </div>

        {/* User XP points badge */}
        <div className="flex items-center gap-1.5 bg-art-cream dark:bg-art-cream/20 border border-art-cream-border text-art-cream-text px-3 py-1.5 rounded-xl text-xs font-bold font-mono shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-art-orange animate-pulse" />
          <span>{user.pontos} XP</span>
        </div>

        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          className="p-2 text-art-muted hover:text-art-green hover:bg-art-gray-bg dark:hover:bg-art-bg/40 rounded-xl transition-all cursor-pointer"
          title={theme === 'light' ? "Ativar Modo Escuro" : "Ativar Modo Claro"}
          id="btn-theme-toggle"
        >
          {theme === 'light' ? (
            <Moon className="w-4.5 h-4.5" />
          ) : (
            <Sun className="w-4.5 h-4.5 text-art-orange" />
          )}
        </button>

        {/* Profile Card & LogOut */}
        <div className="flex items-center gap-2 border-l border-art-border pl-4">
          <div className="text-right hidden md:block">
            <strong className="text-xs text-art-dark block font-bold leading-tight">
              {user.perfil === 'aluno' ? 'Estudante' : user.perfil === 'professor' ? 'Professor(a)' : 'Agricultor(a)'}
            </strong>
            <span className="text-[10px] text-art-muted font-medium">
              {getPerfilEmoji(user.perfil)} {getPerfilLabel(user.perfil)}
            </span>
          </div>

          <button
            onClick={logoutUser}
            className="p-2 text-art-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all cursor-pointer"
            title="Sair da Conta"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
