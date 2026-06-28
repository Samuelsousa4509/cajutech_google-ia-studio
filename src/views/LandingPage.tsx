import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Sparkles, Sprout, ShieldCheck, ChevronRight, GraduationCap, CheckCircle, Mail, Lock, User } from 'lucide-react';
import { PerfilUsuario } from '../types';

export default function LandingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { login, signup, loginDemo, error } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Credentials Form
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [nome, setNome] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('aluno');
  const [regiao, setRegiao] = useState('Piripiri - PI');

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<PerfilUsuario | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    // Client-side Validations
    const trimmedEmail = email.trim();
    const trimmedNome = nome.trim();

    if (!trimmedEmail) {
      setFormError('Por favor, informe seu e-mail.');
      setSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError('Formato de e-mail inválido. Por favor, utilize o formato correto (ex: seu_nome@caju.com).');
      setSubmitting(false);
      return;
    }

    if (!pass) {
      setFormError('Por favor, insira sua senha.');
      setSubmitting(false);
      return;
    }

    if (pass.length < 6) {
      setFormError('Sua senha deve conter no mínimo 6 caracteres.');
      setSubmitting(false);
      return;
    }

    if (!isLogin) {
      if (!trimmedNome) {
        setFormError('Por favor, insira seu nome completo.');
        setSubmitting(false);
        return;
      }
      if (trimmedNome.length < 3) {
        setFormError('O nome inserido é muito curto (mínimo de 3 caracteres).');
        setSubmitting(false);
        return;
      }
    }

    try {
      if (isLogin) {
        await login(trimmedEmail, pass);
      } else {
        await signup(trimmedEmail, pass, trimmedNome, perfil, regiao);
      }
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Ocorreu um erro no formulário de acesso.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoAccess = async (role: PerfilUsuario) => {
    setSubmitting(true);
    setDemoLoadingRole(role);
    try {
      await loginDemo(role);
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
      setDemoLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-art-bg text-art-dark font-sans flex flex-col md:flex-row" id="landing-page">
      {/* Visual Banner - Left Side on Desktop */}
      <div className="w-full md:w-1/2 bg-art-green text-white flex flex-col justify-between p-8 md:p-16 relative overflow-hidden shrink-0 md:min-h-screen">
        {/* Subtle background decoration */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-art-orange/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-art-orange rounded-full flex items-center justify-center">
            <span className="text-xl font-serif font-bold text-white">C</span>
          </div>
          <div>
            <h1 className="font-serif text-2xl tracking-tight leading-none text-white">
              CajuTech
            </h1>
            <span className="text-[10px] tracking-widest uppercase text-art-orange font-bold font-mono">
              Do sertão para o mundo 🌿
            </span>
          </div>
        </div>

        <div className="space-y-6 my-12 max-w-md relative z-10">
          <span className="bg-art-orange/20 border border-art-orange/30 text-art-orange text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Sustentabilidade • Inovação • Tradição
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight">
            Plataforma Inteligente de Ensino e Manejo da <span className="italic underline decoration-2 underline-offset-8">Cajucultura</span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed font-light italic">
            Desenvolvido especialmente para estudantes, agricultores familiares e educadores do Piauí. Conecte-se com técnicas de manejo, aproveitamento integral do pedúnculo para cajuína e diagnóstico de pragas por IA.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-white/90 font-medium">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-art-orange shrink-0" />
              <span>Manejo Agroecológico</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-art-orange shrink-0" />
              <span>Diagnóstico de Pragas IA</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-art-orange shrink-0" />
              <span>Aulas de Cajuína & Doces</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-art-orange shrink-0" />
              <span>Fórum Comunitário Real</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-white/50 font-medium relative z-10 border-t border-white/10 pt-4">
          CajuTech Piauí © 2026. Unindo tecnologia de ponta e sustentabilidade rural.
        </div>
      </div>

      {/* Access/Form section - Right Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-art-bg transition-colors duration-300">
        <div className="w-full max-w-md space-y-6">
          {/* Demo account direct selectors */}
          <div className="bg-white dark:bg-art-gray-bg rounded-3xl shadow-sm border border-art-border p-6 space-y-4 transition-all">
            <div>
              <h3 className="font-serif text-lg text-art-dark flex items-center gap-2">
                🚀 Acesso de Demonstração
              </h3>
              <p className="text-xs text-art-muted">Explore a plataforma imediatamente com perfis pré-configurados:</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleDemoAccess('aluno')}
                disabled={submitting || success}
                className="bg-art-gray-bg hover:bg-art-gray-border/30 border border-art-gray-border text-art-green rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer text-center group disabled:opacity-50 relative min-h-[105px]"
              >
                {demoLoadingRole === 'aluno' ? (
                  <div className="w-6 h-6 border-2 border-art-green border-t-transparent rounded-full animate-spin mb-1"></div>
                ) : (
                  <span className="text-2xl group-hover:scale-110 transition-transform">🎓</span>
                )}
                <strong className="text-xs block font-bold mt-1 text-art-dark">Estudante</strong>
                <span className="text-[9px] text-art-muted mt-0.5">Aulas & Quiz</span>
              </button>

              <button
                onClick={() => handleDemoAccess('agricultor')}
                disabled={submitting || success}
                className="bg-art-cream hover:opacity-90 text-art-cream-text rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer text-center group disabled:opacity-50 relative min-h-[105px]"
              >
                {demoLoadingRole === 'agricultor' ? (
                  <div className="w-6 h-6 border-2 border-art-orange border-t-transparent rounded-full animate-spin mb-1"></div>
                ) : (
                  <span className="text-2xl group-hover:scale-110 transition-transform">🌾</span>
                )}
                <strong className="text-xs block font-bold mt-1 text-art-dark">Produtor</strong>
                <span className="text-[9px] text-art-cream-text/80 mt-0.5">Clima & IA</span>
              </button>

              <button
                onClick={() => handleDemoAccess('professor')}
                disabled={submitting || success}
                className="bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-900/50 text-purple-900 dark:text-purple-300 rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer text-center group disabled:opacity-50 relative min-h-[105px]"
              >
                {demoLoadingRole === 'professor' ? (
                  <div className="w-6 h-6 border-2 border-purple-700 border-t-transparent rounded-full animate-spin mb-1"></div>
                ) : (
                  <span className="text-2xl group-hover:scale-110 transition-transform">👨‍🏫</span>
                )}
                <strong className="text-xs block font-bold mt-1 text-purple-950 dark:text-purple-200">Educador</strong>
                <span className="text-[9px] text-purple-700/80 dark:text-purple-400 mt-0.5">Relatórios</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-art-border"></div>
            </div>
            <span className="relative bg-art-bg px-4 text-xs font-bold text-art-muted uppercase transition-colors duration-300">Ou acesse sua conta</span>
          </div>

          {/* Real Auth form & Success screen */}
          <div className="bg-white dark:bg-art-gray-bg rounded-3xl shadow-sm border border-art-border p-6 space-y-4 transition-all">
            {success ? (
              <div className="text-center py-8 space-y-4 animate-fadeIn" id="login-success-card">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-art-success rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-serif font-bold text-lg text-art-dark">
                    Acesso Autorizado!
                  </h4>
                  <p className="text-xs text-art-muted max-w-xs mx-auto">
                    Estamos preparando seu painel personalizado no CajuTech. Por favor, aguarde...
                  </p>
                </div>
                <div className="flex justify-center pt-2">
                  <div className="w-8 h-8 border-4 border-art-green border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between border-b border-art-border pb-3">
                  <button 
                    onClick={() => { setIsLogin(true); setFormError(null); }}
                    className={`pb-1 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                      isLogin ? 'text-art-green border-art-green' : 'text-art-muted border-transparent'
                    }`}
                  >
                    Entrar
                  </button>
                  <button 
                    onClick={() => { setIsLogin(false); setFormError(null); }}
                    className={`pb-1 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                      !isLogin ? 'text-art-green border-art-green' : 'text-art-muted border-transparent'
                    }`}
                  >
                    Criar Conta
                  </button>
                </div>

                {formError && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-red-800 dark:text-red-300 p-3 rounded-2xl text-xs font-medium">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-art-muted uppercase mb-1 flex items-center gap-1">
                          <User className="w-3 h-3 text-art-green" /> Nome Completo
                        </label>
                        <input 
                          type="text" 
                          placeholder="Ex: Maria das Graças" 
                          value={nome}
                          onChange={e => setNome(e.target.value)}
                          required={!isLogin}
                          className="w-full bg-art-bg dark:bg-stone-900/60 border border-art-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-art-green text-art-dark transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-art-muted uppercase mb-1">Seu Perfil</label>
                          <select
                            value={perfil}
                            onChange={e => setPerfil(e.target.value as PerfilUsuario)}
                            className="w-full bg-art-bg dark:bg-stone-900/60 border border-art-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-art-green text-art-dark font-bold cursor-pointer"
                          >
                            <option value="aluno">🎓 Aluno</option>
                            <option value="agricultor">🌾 Agricultor</option>
                            <option value="professor">👨‍🏫 Professor</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-art-muted uppercase mb-1">Cidade Piauí</label>
                          <select
                            value={regiao}
                            onChange={e => setRegiao(e.target.value)}
                            className="w-full bg-art-bg dark:bg-stone-900/60 border border-art-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-art-green text-art-dark font-bold cursor-pointer"
                          >
                            <option value="Piripiri - PI">Piripiri - PI</option>
                            <option value="Picos - PI">Picos - PI</option>
                            <option value="Pio IX - PI">Pio IX - PI</option>
                            <option value="Teresina - PI">Teresina - PI</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-art-muted uppercase mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-art-green" /> E-mail
                    </label>
                    <input 
                      type="email" 
                      placeholder="Ex: maria@caju.com" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full bg-art-bg dark:bg-stone-900/60 border border-art-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-art-green text-art-dark transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-art-muted uppercase mb-1 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-art-green" /> Senha
                    </label>
                    <input 
                      type="password" 
                      placeholder="Mínimo 6 caracteres" 
                      value={pass}
                      onChange={e => setPass(e.target.value)}
                      required
                      className="w-full bg-art-bg dark:bg-stone-900/60 border border-art-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-art-green text-art-dark transition-all"
                    />
                  </div>

                   <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-art-orange hover:opacity-90 disabled:bg-stone-300 disabled:text-stone-500 text-white font-bold py-3 px-4 rounded-full text-xs tracking-wider uppercase transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Acessando...</span>
                      </>
                    ) : (
                      <>
                        <span>{isLogin ? 'Acessar Plataforma' : 'Criar minha Conta'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
