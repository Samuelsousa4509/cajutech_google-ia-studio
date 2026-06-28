import { BookOpen, MessageSquare, Award, Sprout, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  const { user } = useAuth();
  
  if (!user) return null;

  const isAluno = user.perfil === 'aluno';
  const isAgricultor = user.perfil === 'agricultor';
  const isProfessor = user.perfil === 'professor';

  return (
    <>
      {/* Desktop Top Tab Navigation Bar (Visible only on md screens and above, right below main navbar) */}
      <div className="hidden md:flex justify-center bg-white dark:bg-art-gray-bg/40 border-b border-art-border py-3 px-8 gap-4 shadow-sm" id="desktop-tabs">
        {/* Main Dashboard option depends on role */}
        {isAluno && (
          <button
            onClick={() => onTabChange('estudos')}
            className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'estudos'
                ? 'bg-art-green text-white shadow-sm'
                : 'bg-art-bg text-art-muted border border-art-border hover:bg-art-gray-bg'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Escola do Caju</span>
          </button>
        )}

        {isAgricultor && (
          <button
            onClick={() => onTabChange('pomar')}
            className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pomar'
                ? 'bg-art-green text-white shadow-sm'
                : 'bg-art-bg text-art-muted border border-art-border hover:bg-art-gray-bg'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Meu Pomar</span>
          </button>
        )}

        {isProfessor && (
          <button
            onClick={() => onTabChange('professor')}
            className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'professor'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-art-bg text-art-muted border border-art-border hover:bg-art-gray-bg'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Painel do Educador</span>
          </button>
        )}

        {/* Common community forum tab */}
        <button
          onClick={() => onTabChange('forum')}
          className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'forum'
              ? 'bg-art-green text-white shadow-sm'
              : 'bg-art-bg text-art-muted border border-art-border hover:bg-art-gray-bg'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Fórum Comunitário</span>
        </button>

        {/* Common gamification achievements tab */}
        <button
          onClick={() => onTabChange('conquistas')}
          className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'conquistas'
              ? 'bg-art-green text-white shadow-sm'
              : 'bg-art-bg text-art-muted border border-art-border hover:bg-art-gray-bg'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Insígnias & Conquistas</span>
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed bottom, visible only on screens smaller than md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-art-gray-bg border-t border-art-border px-4 py-3 flex justify-around items-center z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]" id="mobile-tabs">
        {/* Role-specific main page */}
        {isAluno && (
          <button
            onClick={() => onTabChange('estudos')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === 'estudos' ? 'text-art-green font-extrabold' : 'text-art-muted'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[9px] font-bold">Estudos</span>
          </button>
        )}

        {isAgricultor && (
          <button
            onClick={() => onTabChange('pomar')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === 'pomar' ? 'text-art-green font-extrabold' : 'text-art-muted'
            }`}
          >
            <Sprout className="w-5 h-5" />
            <span className="text-[9px] font-bold">Meu Pomar</span>
          </button>
        )}

        {isProfessor && (
          <button
            onClick={() => onTabChange('professor')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === 'professor' ? 'text-purple-700 font-extrabold' : 'text-art-muted'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] font-bold">Educador</span>
          </button>
        )}

        {/* Forum */}
        <button
          onClick={() => onTabChange('forum')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'forum' ? 'text-art-green font-extrabold' : 'text-art-muted'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[9px] font-bold">Fórum</span>
        </button>

        {/* Achievements */}
        <button
          onClick={() => onTabChange('conquistas')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'conquistas' ? 'text-art-green font-extrabold' : 'text-art-muted'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[9px] font-bold">Insígnias</span>
        </button>
      </div>
    </>
  );
}
