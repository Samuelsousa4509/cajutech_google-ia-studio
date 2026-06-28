import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Usuario, PerfilUsuario } from '../types';
import { BADGES } from '../constants';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, nome: string, perfil: PerfilUsuario, regiao: string) => Promise<void>;
  loginDemo: (perfil: PerfilUsuario) => Promise<void>;
  logoutUser: () => Promise<void>;
  addPoints: (amount: number, reason: string) => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<void>;
  updateUserProgress: (moduloId: 'cultivo' | 'derivados' | 'sustentabilidade', aulaId: string, value: number) => Promise<void>;
  completeQuiz: (quizId: string, scorePercent: number) => Promise<void>;
  changeRegiao: (novaRegiao: string) => Promise<void>;
  toggleNotifications: (enabled: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile from Firestore or local storage for demo users
  const loadUserProfile = async (uid: string, fallbackEmail?: string) => {
    const docRef = doc(db, 'usuarios', uid);
    try {
      // Race getDoc with a 3-second timeout to prevent hanging in sandboxed/preview environments
      let userDoc = await Promise.race([
        getDoc(docRef),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout de conexão com o banco de dados (3s)')), 3000)
        )
      ]);
      
      if (!userDoc.exists()) {
        // Wait briefly (500ms) to see if signup process is setting it in the database
        await new Promise(resolve => setTimeout(resolve, 500));
        userDoc = await Promise.race([
          getDoc(docRef),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout de conexão com o banco de dados (2s)')), 2000)
          )
        ]);
      }

      if (userDoc.exists()) {
        setUser(userDoc.data() as Usuario);
      } else {
        // Create dynamic user profile if it doesn't exist (e.g. first Google Sign-In)
        const newProfile: Usuario = {
          uid,
          nome: fallbackEmail ? fallbackEmail.split('@')[0] : 'Usuário CajuTech',
          email: fallbackEmail || 'usuario@cajutech.com',
          perfil: 'aluno',
          regiao: 'Piripiri - PI',
          criadoEm: new Date().toISOString(),
          pontos: 5,
          badges: ['primeiro_acesso'],
          notificacoesHabilitadas: true,
          progresso: {
            cultivo: 0,
            derivados: 0,
            sustentabilidade: 0,
            quizzesFeitos: [],
            aulasConcluidas: []
          }
        };
        
        await Promise.race([
          setDoc(docRef, newProfile),
          new Promise<void>((resolve) => setTimeout(resolve, 2500))
        ]);
        setUser(newProfile);
      }
    } catch (err: any) {
      console.error("Erro ao carregar perfil do Firestore:", err);
      // Fallback local state if Firestore is inaccessible or hangs
      setUser({
        uid,
        nome: fallbackEmail ? fallbackEmail.split('@')[0] : 'Convidado CajuTech',
        email: fallbackEmail || 'convidado@cajutech.com',
        perfil: 'aluno',
        regiao: 'Piripiri - PI',
        criadoEm: new Date().toISOString(),
        pontos: 5,
        badges: ['primeiro_acesso'],
        progresso: { cultivo: 20, derivados: 10, sustentabilidade: 0, quizzesFeitos: [], aulasConcluidas: [] }
      });
    }
  };

  useEffect(() => {
    // Listen to real Firebase auth changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          await loadUserProfile(firebaseUser.uid, firebaseUser.email || undefined);
        } else {
          // Check if there is a local storage Demo User session
          const storedDemoUser = localStorage.getItem('cajutech_demo_user');
          if (storedDemoUser) {
            setUser(JSON.parse(storedDemoUser));
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Erro no listener de autenticação:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const getFriendlyErrorMessage = (code: string, fallback: string): string => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return "E-mail ou senha incorretos. Por favor, tente novamente ou use o acesso de demonstração.";
      case 'auth/email-already-in-use':
        return "Este e-mail já está cadastrado em nossa base. Tente fazer login ou escolha outro e-mail.";
      case 'auth/weak-password':
        return "A senha escolhida é muito curta. Ela deve conter pelo menos 6 caracteres.";
      case 'auth/invalid-email':
        return "O formato do e-mail inserido é inválido. Por exemplo: seu_nome@caju.com";
      case 'auth/network-request-failed':
        return "Falha de conexão na rede. Verifique sua conexão com a internet e tente novamente.";
      case 'auth/too-many-requests':
        return "Muitas tentativas malsucedidas consecutivas. O acesso a esta conta foi suspenso temporariamente. Tente novamente mais tarde.";
      case 'auth/user-disabled':
        return "Esta conta de usuário foi suspensa ou desativada pelo administrador.";
      case 'auth/operation-not-allowed':
        return "O login por E-mail/Senha não está ativado no seu console do Firebase. Ative 'Email/Password' em: Console do Firebase -> Authentication -> Sign-in method.";
      default:
        return fallback;
    }
  };

  const login = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    const cleanedEmail = email.trim();
    try {
      localStorage.removeItem('cajutech_demo_user');
      await signInWithEmailAndPassword(auth, cleanedEmail, pass);
    } catch (err: any) {
      console.error("Erro original no login do Firebase Auth:", err);
      
      const isAuthDisabledOrError = 
        err?.code === 'auth/operation-not-allowed' || 
        err?.code === 'auth/network-request-failed' ||
        err?.code === 'auth/invalid-credential' ||
        err?.message?.includes("operation-not-allowed") ||
        err?.message?.includes("network-request");

      if (isAuthDisabledOrError) {
        const localUsersStr = localStorage.getItem('cajutech_local_users') || '[]';
        const localUsers = JSON.parse(localUsersStr);
        const matched = localUsers.find(
          (u: any) => u.email.toLowerCase() === cleanedEmail.toLowerCase() && u.password === pass
        );

        if (matched) {
          console.log("[Auth fallback] Login realizado com sucesso via conta local.");
          const { password, ...userSession } = matched;
          localStorage.setItem('cajutech_demo_user', JSON.stringify(userSession));
          setUser(userSession as Usuario);
          setLoading(false);
          return;
        }

        if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes("operation-not-allowed")) {
          const friendlyMsg = "O login por E-mail/Senha está desativado no Firebase. Para testar com sua própria conta, vá na aba 'Criar Conta' para se registrar localmente em segundos!";
          setError(friendlyMsg);
          setLoading(false);
          throw new Error(friendlyMsg);
        }
      }

      const friendlyMsg = getFriendlyErrorMessage(err?.code, err.message || "Erro ao fazer login. Verifique suas credenciais.");
      setError(friendlyMsg);
      setLoading(false);
      throw new Error(friendlyMsg);
    }
  };

  const signup = async (email: string, pass: string, nome: string, perfil: PerfilUsuario, regiao: string) => {
    setError(null);
    setLoading(true);
    const cleanedEmail = email.trim();
    const cleanedNome = nome.trim();
    try {
      localStorage.removeItem('cajutech_demo_user');
      const creds = await createUserWithEmailAndPassword(auth, cleanedEmail, pass);
      
      const newProfile: Usuario = {
        uid: creds.user.uid,
        nome: cleanedNome,
        email: cleanedEmail,
        perfil,
        regiao: regiao || 'Piripiri - PI',
        criadoEm: new Date().toISOString(),
        pontos: 5,
        badges: ['primeiro_acesso'],
        notificacoesHabilitadas: true,
        progresso: {
          cultivo: 0,
          derivados: 0,
          sustentabilidade: 0,
          quizzesFeitos: [],
          aulasConcluidas: []
        }
      };

      await setDoc(doc(db, 'usuarios', creds.user.uid), newProfile);
      setUser(newProfile);
    } catch (err: any) {
      console.error("Erro original no cadastro do Firebase Auth:", err);
      
      const isAuthDisabledOrError = 
        err?.code === 'auth/operation-not-allowed' || 
        err?.code === 'auth/network-request-failed' ||
        err?.message?.includes("operation-not-allowed") ||
        err?.message?.includes("network-request");

      if (isAuthDisabledOrError) {
        console.log("[Auth fallback] Registrando usuário localmente.");
        
        const localUsersStr = localStorage.getItem('cajutech_local_users') || '[]';
        const localUsers = JSON.parse(localUsersStr);
        const existing = localUsers.find((u: any) => u.email.toLowerCase() === cleanedEmail.toLowerCase());
        if (existing) {
          const friendlyMsg = "Este e-mail já está cadastrado localmente. Tente fazer login com ele.";
          setError(friendlyMsg);
          setLoading(false);
          throw new Error(friendlyMsg);
        }

        const localUid = `demo_local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const localUser: Usuario = {
          uid: localUid,
          nome: cleanedNome,
          email: cleanedEmail,
          perfil,
          regiao: regiao || 'Piripiri - PI',
          criadoEm: new Date().toISOString(),
          pontos: 5,
          badges: ['primeiro_acesso'],
          notificacoesHabilitadas: true,
          progresso: {
            cultivo: 0,
            derivados: 0,
            sustentabilidade: 0,
            quizzesFeitos: [],
            aulasConcluidas: []
          }
        };

        localUsers.push({ ...localUser, password: pass });
        localStorage.setItem('cajutech_local_users', JSON.stringify(localUsers));
        localStorage.setItem('cajutech_demo_user', JSON.stringify(localUser));
        
        setUser(localUser);
        setLoading(false);
        return;
      }

      const friendlyMsg = getFriendlyErrorMessage(err?.code, err.message || "Erro ao criar conta. Verifique os dados fornecidos.");
      setError(friendlyMsg);
      setLoading(false);
      throw new Error(friendlyMsg);
    }
  };

  // Login as high-fidelity demo user to explore instantly
  const loginDemo = async (perfil: PerfilUsuario) => {
    setError(null);
    setLoading(true);
    
    // Create pre-made gorgeous profiles representing our 3 target publics
    let demoUser: Usuario;
    if (perfil === 'aluno') {
      demoUser = {
        uid: 'demo_aluno_piauiense',
        nome: 'Francisco Silva',
        email: 'chico.silva@escola.pi.gov.br',
        perfil: 'aluno',
        regiao: 'Piripiri - PI',
        criadoEm: new Date().toISOString(),
        pontos: 65,
        badges: ['primeiro_acesso', 'modulo_cultivo'],
        turmaId: 'turma_3_ano_agro',
        notificacoesHabilitadas: true,
        progresso: {
          cultivo: 100,
          derivados: 40,
          sustentabilidade: 0,
          quizzesFeitos: ['quiz_cultivo'],
          aulasConcluidas: ['cultivo_1', 'cultivo_2', 'cultivo_3', 'derivados_1']
        }
      };
    } else if (perfil === 'agricultor') {
      demoUser = {
        uid: 'demo_agricultor_familiar',
        nome: 'Dona Maria de Fátima',
        email: 'fatima.caju@agricultura.org.br',
        perfil: 'agricultor',
        regiao: 'Picos - PI',
        criadoEm: new Date().toISOString(),
        pontos: 45,
        badges: ['primeiro_acesso', 'agricultor_digital'],
        notificacoesHabilitadas: true,
        progresso: {
          cultivo: 40,
          derivados: 100,
          sustentabilidade: 20,
          quizzesFeitos: ['quiz_derivados'],
          aulasConcluidas: ['cultivo_1', 'derivados_1', 'derivados_2', 'derivados_3', 'sustentabilidade_1']
        }
      };
    } else {
      demoUser = {
        uid: 'demo_professor_mestre',
        nome: 'Prof. Adalberto Rocha',
        email: 'adalberto.rocha@educacao.pi.gov.br',
        perfil: 'professor',
        regiao: 'Pio IX - PI',
        criadoEm: new Date().toISOString(),
        pontos: 120,
        badges: ['primeiro_acesso', 'quiz_mestre', 'comunidade'],
        notificacoesHabilitadas: true,
        progresso: {
          cultivo: 100,
          derivados: 100,
          sustentabilidade: 100,
          quizzesFeitos: ['quiz_cultivo', 'quiz_derivados', 'quiz_sustentabilidade'],
          aulasConcluidas: ['cultivo_1', 'cultivo_2', 'cultivo_3', 'derivados_1', 'derivados_2', 'derivados_3', 'sustentabilidade_1', 'sustentabilidade_2']
        }
      };
    }

    localStorage.setItem('cajutech_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setLoading(false);
  };

  const logoutUser = async () => {
    setLoading(true);
    localStorage.removeItem('cajutech_demo_user');
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Erro ao deslogar:", err);
    }
    setUser(null);
    setLoading(false);
  };

  const addPoints = async (amount: number, reason: string) => {
    if (!user) return;
    const isDemo = user.uid.startsWith('demo_');
    const updatedPoints = user.pontos + amount;
    
    // Check points milestone for custom badge unlocking
    let newBadges = [...user.badges];
    if (updatedPoints >= 50 && !newBadges.includes('quiz_mestre')) {
      newBadges.push('quiz_mestre');
    }
    if (updatedPoints >= 100 && !newBadges.includes('comunidade')) {
      newBadges.push('comunidade');
    }

    const updatedUser = {
      ...user,
      pontos: updatedPoints,
      badges: newBadges
    };

    setUser(updatedUser);

    if (isDemo) {
      localStorage.setItem('cajutech_demo_user', JSON.stringify(updatedUser));
    } else {
      try {
        await updateDoc(doc(db, 'usuarios', user.uid), {
          pontos: increment(amount),
          badges: newBadges
        });
      } catch (err) {
        console.error("Erro ao adicionar pontos no Firestore:", err);
      }
    }
  };

  const unlockBadge = async (badgeId: string) => {
    if (!user || user.badges.includes(badgeId)) return;
    
    const updatedBadges = [...user.badges, badgeId];
    const updatedUser = {
      ...user,
      badges: updatedBadges
    };

    setUser(updatedUser);

    if (user.uid.startsWith('demo_')) {
      localStorage.setItem('cajutech_demo_user', JSON.stringify(updatedUser));
    } else {
      try {
        await updateDoc(doc(db, 'usuarios', user.uid), {
          badges: arrayUnion(badgeId)
        });
      } catch (err) {
        console.error("Erro ao desbloquear conquista:", err);
      }
    }
  };

  const updateUserProgress = async (
    moduloId: 'cultivo' | 'derivados' | 'sustentabilidade', 
    aulaId: string, 
    value: number
  ) => {
    if (!user) return;
    if (user.progresso.aulasConcluidas.includes(aulaId)) return; // already completed

    const updatedAulas = [...user.progresso.aulasConcluidas, aulaId];
    
    // Calculate new module percentage
    // count how many lessons in constants for this module, but let's approximate or make it dynamic
    const totalLessons = moduloId === 'cultivo' ? 3 : moduloId === 'derivados' ? 3 : 2;
    const completedForThisModule = updatedAulas.filter(id => id.startsWith(moduloId)).length;
    const newPercent = Math.min(100, Math.round((completedForThisModule / totalLessons) * 100));

    const newProgresso = {
      ...user.progresso,
      aulasConcluidas: updatedAulas,
      [moduloId]: newPercent
    };

    // Check if module completed to unlock badge
    let newBadges = [...user.badges];
    let pointsBonus = 20; // 20 points for completing a lesson

    if (newPercent === 100) {
      const badgeKey = `modulo_${moduloId}`;
      if (!newBadges.includes(badgeKey)) {
        newBadges.push(badgeKey);
        pointsBonus += 100; // 100 points for completing a module
      }
    }

    const updatedUser = {
      ...user,
      pontos: user.pontos + pointsBonus,
      badges: newBadges,
      progresso: newProgresso
    };

    setUser(updatedUser);

    if (user.uid.startsWith('demo_')) {
      localStorage.setItem('cajutech_demo_user', JSON.stringify(updatedUser));
    } else {
      try {
        await updateDoc(doc(db, 'usuarios', user.uid), {
          pontos: increment(pointsBonus),
          badges: newBadges,
          progresso: newProgresso
        });
      } catch (err) {
        console.error("Erro ao atualizar progresso do usuário no Firestore:", err);
      }
    }
  };

  const completeQuiz = async (quizId: string, scorePercent: number) => {
    if (!user) return;

    const alreadyDone = user.progresso.quizzesFeitos.includes(quizId);
    const updatedQuizzes = alreadyDone 
      ? user.progresso.quizzesFeitos 
      : [...user.progresso.quizzesFeitos, quizId];

    const isPerfectScore = scorePercent === 100;
    const isPassing = scorePercent >= 70;
    
    // Gamification points
    let pointsGained = 0;
    if (!alreadyDone) {
      if (isPerfectScore) pointsGained = 80;
      else if (isPassing) pointsGained = 50;
      else pointsGained = 15;
    }

    let newBadges = [...user.badges];
    if (isPerfectScore && !newBadges.includes('quiz_mestre')) {
      newBadges.push('quiz_mestre');
    }

    // If student did 2 quizzes with good grade, they can unlock community
    if (updatedQuizzes.length >= 2 && !newBadges.includes('comunidade')) {
      newBadges.push('comunidade');
    }

    const newProgresso = {
      ...user.progresso,
      quizzesFeitos: updatedQuizzes
    };

    const updatedUser = {
      ...user,
      pontos: user.pontos + pointsGained,
      badges: newBadges,
      progresso: newProgresso
    };

    setUser(updatedUser);

    if (user.uid.startsWith('demo_')) {
      localStorage.setItem('cajutech_demo_user', JSON.stringify(updatedUser));
    } else {
      try {
        await updateDoc(doc(db, 'usuarios', user.uid), {
          pontos: increment(pointsGained),
          badges: newBadges,
          progresso: newProgresso
        });

        // Save quiz score details in separate collection
        const answerId = `${user.uid}_${quizId}`;
        await setDoc(doc(db, 'respostas_quiz', answerId), {
          usuarioId: user.uid,
          usuarioNome: user.nome,
          quizId,
          percentual: scorePercent,
          concluidoEm: new Date().toISOString()
        });
      } catch (err) {
        console.error("Erro ao salvar resultado de quiz no Firestore:", err);
      }
    }
  };

  const changeRegiao = async (novaRegiao: string) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      regiao: novaRegiao
    };

    setUser(updatedUser);

    if (user.uid.startsWith('demo_')) {
      localStorage.setItem('cajutech_demo_user', JSON.stringify(updatedUser));
    } else {
      try {
        await updateDoc(doc(db, 'usuarios', user.uid), {
          regiao: novaRegiao
        });
      } catch (err) {
        console.error("Erro ao atualizar região:", err);
      }
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      notificacoesHabilitadas: enabled
    };

    setUser(updatedUser);

    if (user.uid.startsWith('demo_')) {
      localStorage.setItem('cajutech_demo_user', JSON.stringify(updatedUser));
    } else {
      try {
        await updateDoc(doc(db, 'usuarios', user.uid), {
          notificacoesHabilitadas: enabled
        });
      } catch (err) {
        console.error("Erro ao atualizar configurações de notificações:", err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      signup,
      loginDemo,
      logoutUser,
      addPoints,
      unlockBadge,
      updateUserProgress,
      completeQuiz,
      changeRegiao,
      toggleNotifications
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
