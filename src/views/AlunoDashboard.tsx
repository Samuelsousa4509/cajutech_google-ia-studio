import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MODULOS, QUIZZES } from '../constants';
import { BookOpen, CheckCircle, Video, Award, Trophy, Play, ArrowLeft, ArrowRight, BookOpenCheck, Sparkles, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Modulo, Aula, Quiz } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import CursoCultivo from '../components/CursoCultivo';

export default function AlunoDashboard() {
  const { user, updateUserProgress, completeQuiz } = useAuth();
  const { theme } = useTheme();
  
  // State for interactive course
  const [viewingCursoCultivo, setViewingCursoCultivo] = useState(false);
  
  // Navigation inside course
  const [selectedModulo, setSelectedModulo] = useState<Modulo | null>(null);
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
  
  // Quiz states
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!user) return null;

  const cultivoVal = user.progresso?.cultivo || 0;
  const derivadosVal = user.progresso?.derivados || 0;
  const sustVal = user.progresso?.sustentabilidade || 0;

  const hasProgress = cultivoVal > 0 || derivadosVal > 0 || sustVal > 0;
  const pieData = hasProgress 
    ? [
        { name: 'Cultivo', value: cultivoVal, color: '#16a34a' },
        { name: 'Derivados', value: derivadosVal, color: '#fbbf24' },
        { name: 'Sustentabilidade', value: sustVal, color: '#15803d' }
      ].filter(item => item.value > 0)
    : [
        { name: 'Sem progresso iniciado', value: 100, color: '#e5e7eb' }
      ];

  const totalModulos = 3;
  const progressoMedio = Math.round((cultivoVal + derivadosVal + sustVal) / totalModulos);

  const handleSelectModulo = (modulo: Modulo) => {
    setSelectedModulo(modulo);
    setSelectedAula(null);
    setActiveQuiz(null);
  };

  const handleSelectAula = (aula: Aula) => {
    setSelectedAula(aula);
    setActiveQuiz(null);
  };

  const handleStartQuiz = (moduloId: string) => {
    const foundQuiz = QUIZZES.find(q => q.moduloId === moduloId);
    if (foundQuiz) {
      setActiveQuiz(foundQuiz);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setCorrectAnswersCount(0);
      setQuizFinished(false);
    }
  };

  const handleAnswerSelect = (optionId: string, correctId: string) => {
    if (isAnswered) return;
    setSelectedAnswer(optionId);
    setIsAnswered(true);
    if (optionId === correctId) {
      setCorrectAnswersCount(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < activeQuiz.perguntas.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Finished!
      setQuizFinished(true);
      const percent = Math.round((correctAnswersCount / activeQuiz.perguntas.length) * 100);
      completeQuiz(activeQuiz.id, percent);
    }
  };

  const handleCompleteAula = async () => {
    if (!selectedModulo || !selectedAula) return;
    // Update user's progress and award points
    await updateUserProgress(
      selectedModulo.id as any,
      selectedAula.id,
      100
    );
  };

  const getModuleProgress = (moduloId: string) => {
    if (moduloId === 'cultivo') return user.progresso.cultivo;
    if (moduloId === 'derivados') return user.progresso.derivados;
    if (moduloId === 'sustentabilidade') return user.progresso.sustentabilidade;
    return 0;
  };

  if (viewingCursoCultivo) {
    return (
      <div className="space-y-4" id="viewing-curso-cultivo-wrapper">
        <button
          onClick={() => setViewingCursoCultivo(false)}
          className="flex items-center gap-1.5 text-xs text-art-muted hover:text-art-green font-bold transition-all cursor-pointer bg-white dark:bg-art-gray-bg/60 border border-art-border px-4 py-2 rounded-full shadow-xs w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Módulos de Estudo</span>
        </button>
        <CursoCultivo />
      </div>
    );
  }

  return (
    <div className="space-y-6" id="student-dashboard">
      {/* Welcome & Global progress banner */}
      {!selectedModulo && !activeQuiz && (
        <div className="bg-art-green rounded-3xl p-8 text-white relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Subtle background decoration */}
          <div className="absolute -right-10 -bottom-10 opacity-10 text-white">
            <svg width="250" height="250" viewBox="0 0 200 200">
              <rect width="180" height="180" rx="30" fill="currentColor" transform="rotate(15 100 100)" />
            </svg>
          </div>

          <div className="relative z-10 space-y-3">
            <span className="inline-block text-[10px] bg-white/20 border border-white/20 font-bold px-3 py-1 rounded-full uppercase tracking-wider text-white">
              Escola do Caju Piauí 🎓
            </span>
            <h1 className="font-serif font-medium text-3xl md:text-5xl leading-tight tracking-tighter">
              Bem-vindo à Escola do <span className="italic underline decoration-2 underline-offset-8">Caju</span> Estudante!
            </h1>
            <p className="text-sm opacity-90 max-w-md font-light italic">
              Aprenda a plantar, processar e vender derivados de caju. Conclua as lições práticas e faça quizzes para testar seus conhecimentos e faturar insígnias!
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex gap-5 text-center items-center shrink-0 self-stretch md:self-auto justify-around">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-white/80">Pontuação</span>
              <p className="text-2xl font-bold text-art-orange font-mono">{user.pontos} XP</p>
            </div>
            <div className="w-px bg-white/20 self-stretch"></div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-white/80">Insígnias</span>
              <p className="text-2xl font-bold text-white">{user.badges.length} 🏅</p>
            </div>
          </div>
        </div>
      )}

      {/* Promo banner for interactive tutorial */}
      {!selectedModulo && !activeQuiz && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-3xl p-6 text-white relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-art-border/40" id="interactive-promo-banner">
          <div className="space-y-1 z-10">
            <span className="bg-white/20 border border-white/10 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase text-white tracking-wider">
              Módulo Prático Interativo 🌳
            </span>
            <h3 className="font-serif font-extrabold text-lg leading-tight mt-1">
              Curso de Cultivo & Simulador de Cova
            </h3>
            <p className="text-xs text-white/90 max-w-xl leading-relaxed">
              Aprenda a plantar, adubar e proteger cajueiros anões precoces com base no solo e nas chuvas reais do Piauí! Conclua o curso e ganhe a insígnia <strong className="text-art-orange">Mestre do Plantio</strong>.
            </p>
          </div>
          <button
            onClick={() => setViewingCursoCultivo(true)}
            className="bg-art-orange hover:bg-orange-600 text-white font-extrabold px-5 py-2.5 rounded-full text-xs shadow-sm transition-all cursor-pointer shrink-0 z-10 hover:scale-103"
          >
            Iniciar Aprendizado Prático →
          </button>
        </div>
      )}

      {/* Main View Manager */}
      {activeQuiz ? (
        /* QUIZ SCREEN */
        <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl border border-art-border shadow-sm p-6 max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-center border-b border-art-border pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-art-green">QUIZ EM ANDAMENTO</span>
              <h3 className="font-serif font-bold text-art-dark text-base mt-0.5">{activeQuiz.titulo}</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-art-bg text-art-muted px-3 py-1 rounded-full border border-art-border">
              {currentQuestionIndex + 1} de {activeQuiz.perguntas.length}
            </span>
          </div>

          {!quizFinished ? (
            <div className="space-y-5">
              {/* Question description */}
              <p className="text-sm font-bold text-art-dark bg-art-bg p-5 rounded-2xl border border-art-border leading-relaxed font-serif">
                {activeQuiz.perguntas[currentQuestionIndex].enunciado}
              </p>

              {/* Options */}
              <div className="space-y-2.5">
                {activeQuiz.perguntas[currentQuestionIndex].alternativas.map((opt) => {
                  const isSelected = selectedAnswer === opt.id;
                  const isCorrectAnswer = opt.id === activeQuiz.perguntas[currentQuestionIndex].respostaCorreta;
                  
                  let optionStyle = "border-art-border hover:bg-art-gray-bg/50 text-art-dark bg-white dark:bg-art-gray-bg/60 dark:hover:bg-art-gray-bg/80";
                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      optionStyle = "bg-green-50 dark:bg-green-950/40 border-green-400 text-green-900 dark:text-green-300 shadow-sm";
                    } else if (isSelected) {
                      optionStyle = "bg-red-50 dark:bg-red-950/40 border-red-400 text-red-900 dark:text-red-300";
                    } else {
                      optionStyle = "border-art-border/50 text-art-muted/60 opacity-60 bg-white dark:bg-art-gray-bg/40";
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswerSelect(opt.id, activeQuiz.perguntas[currentQuestionIndex].respostaCorreta)}
                      disabled={isAnswered}
                      className={`w-full text-left px-5 py-3.5 border-2 rounded-2xl text-xs font-bold transition-all flex justify-between items-center cursor-pointer ${optionStyle}`}
                    >
                      <span>{opt.texto}</span>
                      {isAnswered && isCorrectAnswer && <span className="text-green-600 font-bold">✓ Correto</span>}
                      {isAnswered && isSelected && !isCorrectAnswer && <span className="text-red-500 font-bold">✗ Incorreto</span>}
                    </button>
                  );
                })}
              </div>

              {/* Explanation bubble */}
              {isAnswered && (
                <div className="bg-art-cream border border-art-cream-border rounded-2xl p-4 text-xs text-art-cream-text leading-relaxed animate-fade-in font-medium">
                  <strong>💡 Explicação:</strong> {activeQuiz.perguntas[currentQuestionIndex].explicacao}
                </div>
              )}

              {/* Action */}
              {isAnswered && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full bg-art-green hover:opacity-90 text-white font-bold py-3.5 px-4 rounded-full text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{currentQuestionIndex + 1 === activeQuiz.perguntas.length ? 'Concluir Quiz 🏆' : 'Próxima Pergunta'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* FINISHED QUIZ RESULTS */
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 bg-art-cream border border-art-cream-border rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                🏆
              </div>
              
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-2xl text-art-dark">Quiz Concluído!</h4>
                <p className="text-xs text-art-muted">Veja o seu desempenho nas questões do módulo</p>
              </div>

              <div className="bg-art-bg border border-art-border rounded-3xl p-5 max-w-sm mx-auto grid grid-cols-2 gap-4">
                <div className="text-center border-r border-art-border">
                  <span className="text-[10px] uppercase font-bold text-art-muted block">Acertos</span>
                  <strong className="text-xl font-bold text-art-green">{correctAnswersCount} / {activeQuiz.perguntas.length}</strong>
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-art-muted block">Aproveitamento</span>
                  <strong className="text-xl font-bold text-art-orange">
                    {Math.round((correctAnswersCount / activeQuiz.perguntas.length) * 100)}%
                  </strong>
                </div>
              </div>

              <div className="p-3 bg-art-gray-bg border border-art-gray-border rounded-2xl max-w-md mx-auto text-xs text-art-green font-medium">
                🎉 Parabéns! Seus novos pontos foram computados com sucesso e adicionados ao seu perfil geral.
              </div>

              <button
                onClick={() => {
                  setActiveQuiz(null);
                  setSelectedModulo(null);
                  setSelectedAula(null);
                }}
                className="bg-art-green hover:opacity-90 text-white font-bold px-6 py-3 rounded-full text-xs transition-all cursor-pointer shadow-sm"
              >
                Voltar aos Módulos
              </button>
            </div>
          )}
        </div>
      ) : selectedModulo ? (
        /* LESSON VIEWER OR MODULE DETAILS */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lessons List - Left Sidebar */}
          <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl border border-art-border p-5 shadow-sm space-y-4 lg:col-span-1">
            <button
              onClick={() => setSelectedModulo(null)}
              className="flex items-center gap-1 text-xs text-art-muted hover:text-art-green font-bold transition-all mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar aos Módulos</span>
            </button>

            <div className="border-b border-art-border pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-art-muted">MÓDULO SELECIONADO</span>
              <h3 className="font-serif font-bold text-art-dark text-lg mt-0.5">{selectedModulo.titulo}</h3>
            </div>

            <div className="space-y-2">
              {selectedModulo.aulas.map((aula) => {
                const isCompleted = user.progresso.aulasConcluidas.includes(aula.id);
                const isActive = selectedAula?.id === aula.id;
                
                return (
                  <button
                    key={aula.id}
                    onClick={() => handleSelectAula(aula)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                      isActive 
                        ? 'border-art-green bg-art-gray-bg/40 text-art-green shadow-sm'
                        : 'border-art-border hover:bg-art-bg text-art-dark'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {aula.tipo === 'video' ? (
                        <Video className={`w-4 h-4 ${isActive ? 'text-art-green' : 'text-art-muted'}`} />
                      ) : (
                        <BookOpen className={`w-4 h-4 ${isActive ? 'text-art-green' : 'text-art-muted'}`} />
                      )}
                    </span>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-xs block leading-tight font-bold">{aula.titulo}</strong>
                        {isCompleted && <span className="text-art-green font-bold text-xs">✓</span>}
                      </div>
                      <p className="text-[10px] text-art-muted">{aula.duracao} min de estudo</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Start module quiz button */}
            <div className="pt-4 border-t border-art-border">
              <button
                onClick={() => handleStartQuiz(selectedModulo.id)}
                className="w-full bg-art-orange hover:opacity-90 text-white font-bold py-3 px-4 rounded-full text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                Fazer Quiz do Módulo 🏆
              </button>
            </div>
          </div>

          {/* Lesson Content Viewer - Right Side */}
          <div className="lg:col-span-2 space-y-4">
            {selectedAula ? (
              <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl border border-art-border p-5 md:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-art-border pb-3">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-art-green">AULA SELECIONADA</span>
                    <h3 className="font-serif font-bold text-art-dark text-xl leading-tight mt-0.5">{selectedAula.titulo}</h3>
                  </div>
                  {user.progresso.aulasConcluidas.includes(selectedAula.id) && (
                    <span className="text-[10px] bg-green-50 text-green-800 border border-green-200 px-3 py-1 rounded-full font-bold">
                      Concluída ✅
                    </span>
                  )}
                </div>

                {/* Lesson Description */}
                <p className="text-xs text-art-muted leading-relaxed font-medium italic">{selectedAula.descricao}</p>

                {/* Video Embed */}
                {selectedAula.tipo === 'video' && (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-sm border border-art-border bg-black">
                    <iframe 
                      src={selectedAula.conteudo}
                      title={selectedAula.titulo}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                )}

                {/* Written Content (Markdown) */}
                {selectedAula.tipo === 'texto' && (
                  <div className="prose prose-stone max-w-none text-xs text-art-dark leading-relaxed whitespace-pre-wrap bg-art-bg p-5 md:p-8 rounded-2xl border border-art-border">
                    <ReactMarkdown>{selectedAula.conteudo}</ReactMarkdown>
                  </div>
                )}

                {/* Bottom completion control */}
                <div className="pt-4 border-t border-art-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-art-muted">
                    Ao concluir os estudos desta lição, marque como finalizada para receber seus pontos.
                  </div>
                  
                  {user.progresso.aulasConcluidas.includes(selectedAula.id) ? (
                    <button 
                      disabled
                      className="bg-art-bg text-art-muted/50 border border-art-border font-bold px-5 py-2.5 rounded-full text-xs cursor-not-allowed"
                    >
                      Aula Concluída (+20 XP)
                    </button>
                  ) : (
                    <button
                      onClick={handleCompleteAula}
                      className="bg-art-green hover:opacity-90 text-white font-bold px-6 py-2.5 rounded-full text-xs transition-all shadow-sm cursor-pointer"
                    >
                      Marcar como Concluída 🌱
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl border border-art-border p-8 shadow-sm text-center flex flex-col items-center justify-center min-h-[350px]">
                <BookOpenCheck className="w-12 h-12 text-art-border mb-3 animate-bounce" />
                <h4 className="font-serif font-bold text-art-dark text-base">Selecione uma aula à esquerda</h4>
                <p className="text-xs text-art-muted max-w-xs mx-auto mt-2 leading-relaxed">
                  Abra qualquer uma das lições para ler os materiais práticos de manejo ou assistir aos vídeos recomendados.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* COURSE GENERAL MODULES LISTING */
        <div className="space-y-6">
          {/* Donut Chart & Progress Insights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-progress-analytics">
            {/* Donut Chart Card */}
            <div className="lg:col-span-2 bg-white dark:bg-art-gray-bg/40 rounded-3xl border border-art-border p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6" id="card-donut-chart">
              <div className="space-y-4 flex-1 w-full sm:w-auto">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-art-green flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-art-orange" /> DESEMPENHO ACADÊMICO
                  </span>
                  <h3 className="font-serif font-bold text-xl text-art-dark mt-1">Distribuição do seu Progresso</h3>
                  <p className="text-xs text-art-muted mt-1 leading-relaxed">
                    Acompanhe visualmente a sua evolução em cada um dos três pilares da Escola do Caju do Piauí.
                  </p>
                </div>
                
                {/* Pillar list with custom progress meters */}
                <div className="space-y-2.5 pt-2" id="pillar-legend-container">
                  <div className="flex items-center justify-between text-xs font-semibold" id="pilar-legend-cultivo">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-art-green"></span> Cultivo do Cajueiro</span>
                    <span className="text-art-dark font-mono bg-art-green/10 text-art-green px-2 py-0.5 rounded-full text-[10px] font-bold">{cultivoVal}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold" id="pilar-legend-derivados">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#fbbf24]"></span> Processamento & Derivados</span>
                    <span className="text-art-dark font-mono bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{derivadosVal}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold" id="pilar-legend-sustentabilidade">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#15803d]"></span> Sustentabilidade</span>
                    <span className="text-art-dark font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">{sustVal}%</span>
                  </div>
                </div>
              </div>
              
              {/* Pie Chart container */}
              <div className="w-full sm:w-48 h-48 flex items-center justify-center relative shrink-0" id="recharts-donut-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={hasProgress ? 4 : 0}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any) => [
                        hasProgress ? `${value}%` : '0%', 
                        name
                      ]}
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#142016' : '#fff', 
                        borderRadius: '12px', 
                        border: theme === 'dark' ? '1px solid #2B4231' : '1px solid #e2e8f0',
                        color: theme === 'dark' ? '#ECFDF5' : '#1A2E1A',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        fontFamily: 'sans-serif',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Centered Text indicator */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" id="donut-center-text">
                  <span className="text-2xl font-bold font-mono text-art-dark">{progressoMedio}%</span>
                  <span className="text-[9px] text-art-muted font-bold uppercase tracking-wider">Média Geral</span>
                </div>
              </div>
            </div>
            
            {/* Right column: Motivational / Stats Card */}
            <div className="lg:col-span-1 bg-white dark:bg-art-gray-bg/40 rounded-3xl border border-art-border p-6 shadow-sm flex flex-col justify-between space-y-4" id="card-motivation">
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-art-orange/10 text-art-orange" id="icon-trending-container">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-art-dark">Sua Jornada Agro</h4>
                  <p className="text-xs text-art-muted mt-1 leading-relaxed">
                    {progressoMedio === 0 ? (
                      "Você ainda não iniciou seus estudos. Escolha um dos módulos abaixo e comece sua jornada hoje mesmo!"
                    ) : progressoMedio === 100 ? (
                      "Espetacular! Você completou 100% de todo o curso. Você é agora um verdadeiro Mestre do Caju do Piauí! 🏆"
                    ) : (
                      "Excelente progresso! Você está adquirindo técnicas preciosas de manejo, agregação de valor e sustentabilidade."
                    )}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-art-border pt-4" id="motivation-actions-container">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-art-muted font-medium">Meta sugerida:</span>
                  <span className="font-bold text-art-green">
                    {cultivoVal < 100 ? "Cultivo 🌱" : derivadosVal < 100 ? "Derivados 🌰" : sustVal < 100 ? "Sustentabilidade ♻️" : "Revisão 🏆"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-art-border pb-2">
            <h3 className="font-serif font-bold text-lg text-art-dark">Seus Módulos de Estudo</h3>
            <p className="text-xs text-art-muted">Complete as lições de cada módulo para liberar o quiz correspondente</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MODULOS.map((mod) => {
              const prog = getModuleProgress(mod.id);
              return (
                <div 
                  key={mod.id} 
                  className="bg-white dark:bg-art-gray-bg/40 rounded-3xl shadow-sm border border-art-border p-6 space-y-5 flex flex-col justify-between hover:border-art-orange/30 hover:shadow-md transition-all"
                >
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-start">
                      <span className="text-4xl">{mod.icone}</span>
                      <span className="text-[9px] bg-art-bg text-art-muted px-2.5 py-1 rounded-full font-bold border border-art-border">
                        {mod.aulas.length} Aulas
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-base text-art-dark">{mod.titulo}</h4>
                      <p className="text-xs text-art-muted leading-relaxed line-clamp-3">{mod.descricao}</p>
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-4 border-t border-art-border">
                    {/* Progress Slider */}
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-art-muted mb-1.5">
                        <span>Progresso</span>
                        <span>{prog}%</span>
                      </div>
                      <div className="w-full bg-art-bg rounded-full h-1.5 border border-art-border">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${prog}%`, backgroundColor: mod.cor }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectModulo(mod)}
                      className="w-full bg-art-bg hover:bg-art-gray-bg border border-art-border text-art-dark font-bold py-2.5 rounded-full text-xs transition-all cursor-pointer text-center"
                    >
                      {prog === 100 ? 'Revisar Módulo ✅' : prog > 0 ? 'Continuar Módulo 🚀' : 'Iniciar Módulo'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
