import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, Plus, Clipboard, CheckCircle2, ChevronRight, Award, Trash } from 'lucide-react';

interface MockStudent {
  nome: string;
  email: string;
  regiao: string;
  pontos: number;
  progressoCultivo: number;
  progressoDerivados: number;
  progressoSustentabilidade: number;
  badgesCount: number;
}

const INITIAL_STUDENTS: MockStudent[] = [
  { nome: 'Francisco Silva', email: 'chico.silva@escola.pi.gov.br', regiao: 'Piripiri - PI', pontos: 65, progressoCultivo: 100, progressoDerivados: 40, progressoSustentabilidade: 0, badgesCount: 2 },
  { nome: 'Raimundo Nonato', email: 'nonato.caju@escola.pi.gov.br', regiao: 'Pio IX - PI', pontos: 110, progressoCultivo: 100, progressoDerivados: 100, progressoSustentabilidade: 20, badgesCount: 4 },
  { nome: 'Juliana Mendes', email: 'juliana@escola.pi.gov.br', regiao: 'Picos - PI', pontos: 35, progressoCultivo: 33, progressoDerivados: 0, progressoSustentabilidade: 0, badgesCount: 1 },
  { nome: 'Ana Beatriz Souza', email: 'anabeatriz@escola.pi.gov.br', regiao: 'Teresina - PI', pontos: 180, progressoCultivo: 100, progressoDerivados: 100, progressoSustentabilidade: 100, badgesCount: 6 }
];

export default function ProfessorDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState<MockStudent[]>(INITIAL_STUDENTS);
  const [activeTab, setActiveTab] = useState<'turma' | 'quiz'>('turma');
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // New Student input
  const [newStudentNome, setNewStudentNome] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentRegiao, setNewStudentRegiao] = useState('Piripiri - PI');

  // Dynamic Quiz Creator State
  const [quizTitle, setQuizTitle] = useState('');
  const [quizModule, setQuizModule] = useState('cultivo');
  const [perguntas, setPerguntas] = useState<any[]>([
    {
      enunciado: '',
      alternativas: [
        { id: 'a', texto: '' },
        { id: 'b', texto: '' },
        { id: 'c', texto: '' },
        { id: 'd', texto: '' }
      ],
      respostaCorreta: 'a',
      explicacao: ''
    }
  ]);
  const [quizSuccess, setQuizSuccess] = useState(false);

  if (!user) return null;

  // Chart statistics data
  const chartData = [
    { name: 'Cultivo', MediaProgresso: Math.round(students.reduce((acc, s) => acc + s.progressoCultivo, 0) / students.length) },
    { name: 'Derivados', MediaProgresso: Math.round(students.reduce((acc, s) => acc + s.progressoDerivados, 0) / students.length) },
    { name: 'Sustentabilidade', MediaProgresso: Math.round(students.reduce((acc, s) => acc + s.progressoSustentabilidade, 0) / students.length) }
  ];

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentNome.trim() || !newStudentEmail.trim()) return;

    setIsSubmittingStudent(true);
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newS: MockStudent = {
      nome: newStudentNome,
      email: newStudentEmail,
      regiao: newStudentRegiao,
      pontos: 5,
      progressoCultivo: 0,
      progressoDerivados: 0,
      progressoSustentabilidade: 0,
      badgesCount: 1
    };

    setStudents(prev => [...prev, newS]);
    setNewStudentNome('');
    setNewStudentEmail('');
    setIsSubmittingStudent(false);
  };

  const handleAddQuestion = () => {
    setPerguntas(prev => [
      ...prev,
      {
        enunciado: '',
        alternativas: [
          { id: 'a', texto: '' },
          { id: 'b', texto: '' },
          { id: 'c', texto: '' },
          { id: 'd', texto: '' }
        ],
        respostaCorreta: 'a',
        explicacao: ''
      }
    ]);
  };

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const updated = [...perguntas];
    updated[index][field] = value;
    setPerguntas(updated);
  };

  const handleOptionChange = (qIndex: number, optId: string, value: string) => {
    const updated = [...perguntas];
    updated[qIndex].alternativas = updated[qIndex].alternativas.map((opt: any) => 
      opt.id === optId ? { ...opt, texto: value } : opt
    );
    setPerguntas(updated);
  };

  const handleCreateQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;
    
    setIsSubmittingQuiz(true);
    // Simulate saving quiz successfully
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmittingQuiz(false);
    setQuizSuccess(true);
    
    setTimeout(() => {
      setQuizSuccess(false);
      setQuizTitle('');
      setPerguntas([
        {
          enunciado: '',
          alternativas: [
            { id: 'a', texto: '' },
            { id: 'b', texto: '' },
            { id: 'c', texto: '' },
            { id: 'd', texto: '' }
          ],
          respostaCorreta: 'a',
          explicacao: ''
        }
      ]);
    }, 2000);
  };

  const handleDeleteStudent = (email: string) => {
    setStudents(prev => prev.filter(s => s.email !== email));
  };

  const handleExportCSV = () => {
    // UTF-8 BOM to ensure proper character encoding in Excel
    const BOM = '\uFEFF';
    const headers = ['Nome', 'Email', 'Cidade/Região', 'Progresso Cultivo (%)', 'Progresso Derivados (%)', 'Sustentabilidade (%)', 'Pontos (XP)'];
    
    const rows = students.map(student => [
      `"${student.nome.replace(/"/g, '""')}"`,
      `"${student.email.replace(/"/g, '""')}"`,
      `"${student.regiao.replace(/"/g, '""')}"`,
      `${student.progressoCultivo}%`,
      `${student.progressoDerivados}%`,
      `${student.progressoSustentabilidade}%`,
      `${student.pontos} XP`
    ]);

    const csvContent = BOM + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_alunos_caju_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="teacher-dashboard">
      {/* Welcome & Global stats banner */}
      <div className="bg-purple-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Subtle background decoration */}
        <div className="absolute -right-10 -bottom-10 opacity-10 text-white">
          <svg width="250" height="250" viewBox="0 0 200 200">
            <polygon points="100,10 40,198 190,78 10,78 160,198" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10 space-y-3">
          <span className="inline-block text-[10px] bg-white/20 border border-white/20 font-bold px-3 py-1 rounded-full uppercase tracking-wider text-white">
            Painel do Professor Educador 👨‍🏫
          </span>
          <h1 className="font-serif font-medium text-3xl md:text-5xl leading-tight tracking-tighter">
            Bem-vindo ao Painel do <span className="italic underline decoration-2 underline-offset-8">Educador</span>!
          </h1>
          <p className="text-sm opacity-90 max-w-md font-light italic">
            Monitore o rendimento individual dos alunos, exporte relatórios de desempenho e crie quizzes pedagógicos para suas turmas.
          </p>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex gap-5 text-center items-center shrink-0 self-stretch md:self-auto justify-around">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-white/80">Total Alunos</span>
            <p className="text-2xl font-bold text-amber-300 font-mono">{students.length}</p>
          </div>
          <div className="w-px bg-white/20 self-stretch"></div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-white/80">Turmas</span>
            <p className="text-2xl font-bold text-white">1 Ativa</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Tab selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts progress analysis bar */}
        <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl shadow-sm border border-art-border p-6 space-y-4 lg:col-span-1">
          <div>
            <h3 className="font-serif font-bold text-base text-art-dark">
              Média por Módulo (%)
            </h3>
            <p className="text-xs text-art-muted mt-1 leading-relaxed">Progresso acumulado dos alunos integrados na sua turma</p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E4D9" />
                <XAxis dataKey="name" tick={{ fill: '#7F796B', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#7F796B', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="MediaProgresso" fill="#6B21A8" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tab Controls / View Manager */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 border-b border-art-border pb-1.5">
            <button
              onClick={() => setActiveTab('turma')}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'turma' 
                  ? 'text-purple-700 border-purple-700 font-extrabold' 
                  : 'text-art-muted border-transparent hover:text-art-dark'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Gerenciar Alunos</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'quiz' 
                  ? 'text-purple-700 border-purple-700 font-extrabold' 
                  : 'text-art-muted border-transparent hover:text-art-dark'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Quiz</span>
            </button>
          </div>

          {/* TAB 1: GERENCIAR TURMA */}
          {activeTab === 'turma' && (
            <div className="space-y-4">
              {/* Add Student Form */}
              <form onSubmit={handleAddStudent} className="bg-white dark:bg-art-gray-bg/40 rounded-3xl border border-art-border p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="md:col-span-1.5">
                  <label className="block text-[10px] font-bold text-art-muted uppercase mb-1.5">Nome do Aluno</label>
                  <input 
                    type="text"
                    placeholder="Ex: João Ferreira"
                    value={newStudentNome}
                    onChange={e => setNewStudentNome(e.target.value)}
                    required
                    className="w-full bg-art-bg border border-art-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-700 text-art-dark"
                  />
                </div>

                <div className="md:col-span-1.5">
                  <label className="block text-[10px] font-bold text-art-muted uppercase mb-1.5">E-mail Escolar</label>
                  <input 
                    type="email"
                    placeholder="joao@escola.pi.gov.br"
                    value={newStudentEmail}
                    onChange={e => setNewStudentEmail(e.target.value)}
                    required
                    className="w-full bg-art-bg border border-art-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-700 text-art-dark"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmittingStudent}
                    className="w-full bg-purple-700 hover:opacity-95 disabled:bg-stone-300 disabled:text-stone-500 text-white font-bold py-2.5 rounded-full text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSubmittingStudent ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Adicionando...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Adicionar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Print-only Header Report */}
              <div className="hidden print:block mb-6 border-b-2 border-slate-300 pb-4">
                <h1 className="font-serif text-3xl font-bold text-slate-900">CajuTech - Escola do Caju do Piauí</h1>
                <p className="text-xs text-slate-500 font-bold tracking-wide uppercase mt-1">Relatório Geral de Desempenho e Rendimento</p>
                <div className="grid grid-cols-3 gap-4 text-xs mt-4 text-slate-700">
                  <div>
                    <span className="font-semibold block text-slate-500 uppercase text-[9px]">Professor Responsável</span>
                    <span className="font-bold">{user.nome}</span>
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-500 uppercase text-[9px]">Cidade/Região</span>
                    <span className="font-bold">{user.regiao || "Piauí"}</span>
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-500 uppercase text-[9px]">Data de Emissão</span>
                    <span className="font-bold">{new Date().toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* Student table/list */}
              <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl border border-art-border shadow-sm overflow-hidden">
                <div className="p-4 bg-art-bg dark:bg-art-gray-bg/50 border-b border-art-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h4 className="font-serif font-bold text-xs text-art-dark uppercase tracking-wider">Relatório de Rendimento Individual</h4>
                  <div className="flex items-center gap-2 no-print">
                    <button 
                      onClick={handleExportCSV}
                      className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                      type="button"
                    >
                      <span>📊 Exportar CSV</span>
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="text-[10px] bg-purple-700 hover:bg-purple-800 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                      type="button"
                    >
                      <span>🖨️ Imprimir / PDF</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-art-bg/50 text-art-muted border-b border-art-border font-bold">
                        <th className="p-3">Nome</th>
                        <th className="p-3">Mód. Cultivo</th>
                        <th className="p-3">Mód. Derivados</th>
                        <th className="p-3">Sustentabilidade</th>
                        <th className="p-3">XP</th>
                        <th className="p-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-art-border">
                      {students.map((student) => (
                        <tr key={student.email} className="hover:bg-art-bg/35 text-art-dark font-medium">
                          <td className="p-3">
                            <div className="font-bold text-art-dark">{student.nome}</div>
                            <span className="text-[10px] text-art-muted font-mono">{student.email}</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-art-dark">{student.progressoCultivo}%</td>
                          <td className="p-3 font-mono font-bold text-art-dark">{student.progressoDerivados}%</td>
                          <td className="p-3 font-mono font-bold text-art-dark">{student.progressoSustentabilidade}%</td>
                          <td className="p-3">
                            <span className="bg-purple-50 text-purple-800 font-bold font-mono px-2.5 py-1 rounded-full text-[10px] border border-purple-100">
                              {student.pontos} XP
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => handleDeleteStudent(student.email)}
                              className="text-art-border hover:text-red-500 p-1 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CRIAR NOVO QUIZ */}
          {activeTab === 'quiz' && (
            <form onSubmit={handleCreateQuizSubmit} className="bg-white dark:bg-art-gray-bg/40 rounded-3xl border border-art-border p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-center pb-2 border-b border-art-border">
                <h4 className="font-serif font-bold text-art-dark text-base">Estruture o Questionário</h4>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="text-xs text-purple-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Pergunta
                </button>
              </div>

              {quizSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs rounded-2xl flex gap-2 items-center font-bold">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Sucesso! O novo quiz foi publicado no banco de dados e sincronizado para todos os alunos.</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-art-muted uppercase mb-1.5">Título do Quiz</label>
                  <input 
                    type="text"
                    placeholder="Ex: Quiz de Fixação de Antracnose"
                    value={quizTitle}
                    onChange={e => setQuizTitle(e.target.value)}
                    required
                    className="w-full bg-art-bg border border-art-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-700 text-art-dark"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-art-muted uppercase mb-1.5">Módulo Vinculado</label>
                  <select
                    value={quizModule}
                    onChange={e => setQuizModule(e.target.value)}
                    className="w-full bg-art-bg border border-art-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-700 text-art-dark font-bold"
                  >
                    <option value="cultivo">🌳 Cultivo do Cajueiro</option>
                    <option value="derivados">🌰 Derivados & Cajuína</option>
                    <option value="sustentabilidade">♻️ Sustentabilidade</option>
                  </select>
                </div>
              </div>

              {/* Questions Stack */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {perguntas.map((q, idx) => (
                  <div key={idx} className="bg-art-bg rounded-2xl p-5 border border-art-border space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full font-mono border border-purple-200">
                        Pergunta {idx + 1}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-art-muted uppercase mb-1.5">Enunciado da questão</label>
                      <input 
                        type="text"
                        placeholder="Escreva a pergunta para os alunos..."
                        value={q.enunciado}
                        onChange={e => handleQuestionChange(idx, 'enunciado', e.target.value)}
                        required
                        className="w-full bg-white dark:bg-art-gray-bg/60 border border-art-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-700 text-art-dark"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.alternativas.map((opt: any) => (
                        <div key={opt.id} className="flex gap-2 items-center bg-white dark:bg-art-gray-bg/60 border border-art-border px-3 py-2 rounded-xl">
                          <span className="text-art-muted font-bold font-mono text-xs uppercase">{opt.id})</span>
                          <input 
                            type="text"
                            placeholder={`Alternativa ${opt.id.toUpperCase()}`}
                            value={opt.texto}
                            onChange={e => handleOptionChange(idx, opt.id, e.target.value)}
                            required
                            className="flex-1 text-xs focus:outline-none font-bold text-art-dark bg-transparent"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-art-muted uppercase mb-1.5">Alternativa Correta</label>
                        <select
                          value={q.respostaCorreta}
                          onChange={e => handleQuestionChange(idx, 'respostaCorreta', e.target.value)}
                          className="w-full bg-white dark:bg-art-gray-bg/60 border border-art-border rounded-xl px-2 py-2 text-xs font-bold text-art-dark"
                        >
                          <option value="a">A</option>
                          <option value="b">B</option>
                          <option value="c">C</option>
                          <option value="d">D</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-art-muted uppercase mb-1.5">Explicação / Feedback de resposta</label>
                        <input 
                          type="text"
                          placeholder="Aparece imediatamente após responder a questão..."
                          value={q.explicacao}
                          onChange={e => handleQuestionChange(idx, 'explicacao', e.target.value)}
                          required
                          className="w-full bg-white dark:bg-art-gray-bg/60 border border-art-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-700 text-art-dark"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmittingQuiz}
                className="w-full bg-purple-700 hover:opacity-95 disabled:bg-stone-300 disabled:text-stone-500 text-white font-bold py-3.5 px-4 rounded-full text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSubmittingQuiz ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Publicando Quiz...</span>
                  </>
                ) : (
                  <span>Publicar Quiz Completo 🏆</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
