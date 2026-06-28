import { useAuth } from '../context/AuthContext';
import { BADGES } from '../constants';
import { Award, Lock, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';

export default function Conquistas() {
  const { user } = useAuth();

  if (!user) return null;

  const unlockedCount = user.badges.length;
  const totalCount = BADGES.length;
  const percentComplete = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-6 animate-fade-in" id="achievements-view">
      {/* Visual statistics banner */}
      <div className="bg-art-orange rounded-3xl p-8 text-white relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Subtle background decoration */}
        <div className="absolute -right-10 -bottom-10 opacity-10 text-white">
          <svg width="250" height="250" viewBox="0 0 200 200">
            <polygon points="100,10 40,198 190,78 10,78 160,198" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10 space-y-3">
          <span className="inline-block text-[10px] bg-white/20 border border-white/20 font-bold px-3 py-1 rounded-full uppercase tracking-wider text-white">
            Gamificação & Mérito 🏆
          </span>
          <h1 className="font-serif font-medium text-3xl md:text-5xl leading-tight tracking-tighter">
            Suas <span className="italic underline decoration-2 underline-offset-8">Medalhas</span> de CajuTech!
          </h1>
          <p className="text-sm opacity-90 max-w-md font-light italic">
            Parabéns pelo seu esforço em estudar e gerenciar as plantações de caju no Piauí! Continue coletando conquistas e subindo de nível.
          </p>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex gap-5 text-center items-center w-full md:w-auto justify-around shrink-0">
          <div className="space-y-1 flex-1">
            <span className="text-[10px] font-bold uppercase text-white/80">Sua Coleção</span>
            <p className="text-xl font-bold text-white">{unlockedCount} de {totalCount}</p>
          </div>
          <div className="w-px bg-white/20 self-stretch"></div>
          <div className="space-y-1 flex-1">
            <span className="text-[10px] font-bold uppercase text-white/80">Aproveitamento</span>
            <p className="text-xl font-bold text-white font-mono">{percentComplete}%</p>
          </div>
        </div>
      </div>

      {/* Grid of badges */}
      <div className="space-y-4">
        <div className="border-b border-art-border pb-2">
          <h3 className="font-serif font-bold text-lg text-art-dark">Galeria de Medalhas CajuTech</h3>
          <p className="text-xs text-art-muted">Ajude no fórum, assista as aulas e faça diagnósticos de pragas para liberar todos os troféus</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BADGES.map((badge) => {
            const isUnlocked = user.badges.includes(badge.id);

            return (
              <div 
                key={badge.id}
                className={`p-6 rounded-3xl border shadow-sm transition-all flex gap-4 items-center ${
                  isUnlocked 
                    ? 'bg-white dark:bg-art-gray-bg/40 border-art-border' 
                    : 'bg-art-bg/40 border-art-border/60 opacity-75'
                }`}
              >
                {/* Badge Icon */}
                <div 
                  className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-3xl border shadow-inner ${
                    isUnlocked 
                      ? 'bg-art-cream border-art-cream-border animate-pulse' 
                      : 'bg-art-bg border-art-border text-art-muted'
                  }`}
                >
                  {isUnlocked ? (
                    <span>{badge.emoji}</span>
                  ) : (
                    <Lock className="w-5 h-5 text-art-muted" />
                  )}
                </div>

                {/* Badge text details */}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className={`font-serif font-bold text-sm ${isUnlocked ? 'text-art-dark' : 'text-art-muted'}`}>
                      {badge.titulo}
                    </h4>
                    {isUnlocked && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </div>
                  <p className="text-xs text-art-muted leading-relaxed font-medium">{badge.descricao}</p>
                  
                  {isUnlocked ? (
                    <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                      Desbloqueado! ✓
                    </span>
                  ) : (
                    <span className="inline-block text-[9px] font-bold text-art-muted bg-art-bg px-2 py-0.5 rounded-md border border-art-border/40">
                      Indisponível (Em andamento)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
