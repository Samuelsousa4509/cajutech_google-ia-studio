import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CALENDARIO_AGRICOLA } from '../constants';
import WeatherWidget from '../components/WeatherWidget';
import IncomeCalculator from '../components/IncomeCalculator';
import PestDiagnoser from '../components/PestDiagnoser';
import CursoCultivo from '../components/CursoCultivo';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc, 
  setDoc, 
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Diagnostico, AlertaNotificacao } from '../types';
import { 
  Calendar, 
  AlertCircle, 
  Sparkles, 
  Sprout, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle,
  Bell,
  BellOff,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Check,
  Activity,
  Clock,
  Shield,
  CloudLightning,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

// Firestore operation types as per the Firebase skill guidelines
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export default function AgricultorDashboard() {
  const { user, changeRegiao, toggleNotifications } = useAuth();
  
  // State for interactive course
  const [viewingCursoCultivo, setViewingCursoCultivo] = useState(false);
  
  // Agricultural calendar state
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(5); // June (0-indexed 5)

  // Diagnostics History state
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [loadingDiagnosticos, setLoadingDiagnosticos] = useState(true);
  const [expandedDiagId, setExpandedDiagId] = useState<string | null>(null);

  // Push Notifications state
  const [notificacoes, setNotificacoes] = useState<AlertaNotificacao[]>([]);
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(true);
  const [activePushAlert, setActivePushAlert] = useState<AlertaNotificacao | null>(null);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);

  // Error handler matching Firestore security instructions
  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: user?.uid,
        email: user?.email,
      },
      operationType,
      path
    };
    console.error('Firestore Error details: ', JSON.stringify(errInfo));
  };

  // Synthesize a beautiful double-note chime using Web Audio API (no assets needed)
  const playNotificationChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      // Pleasant high-end notification notes (D5 -> A5)
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Web Audio Context blocked or not supported by browser security constraints.", e);
    }
  };

  // Set default current month index
  useEffect(() => {
    const curMonthIndex = new Date().getMonth(); // 0-11
    setSelectedMonthIndex(curMonthIndex);
  }, []);

  // Listen for newly created diagnostics (both real-time and custom events for demo mode)
  useEffect(() => {
    const handleNewDiagnosisEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Diagnostico>;
      if (customEvent.detail) {
        setDiagnosticos(prev => {
          const exists = prev.some(d => d.id === customEvent.detail.id);
          if (exists) return prev;
          return [customEvent.detail, ...prev];
        });
      }
    };

    window.addEventListener('cajutech_new_diagnosis', handleNewDiagnosisEvent);
    return () => {
      window.removeEventListener('cajutech_new_diagnosis', handleNewDiagnosisEvent);
    };
  }, []);

  // 1. Fetch Diagnostics History
  useEffect(() => {
    if (!user) return;
    
    setLoadingDiagnosticos(true);
    
    // For high-fidelity demo users
    if (user.uid.startsWith('demo_')) {
      const stored = localStorage.getItem('cajutech_diagnosticos_demo');
      if (stored) {
        setDiagnosticos(JSON.parse(stored));
      } else {
        // Pre-seed mock diagnostics so the portfolio looks professional instantly
        const mockDiag1: Diagnostico = {
          id: 'diag_mock_1',
          usuarioId: user.uid,
          fotoURL: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=600',
          praga: 'Antracnose em Estágio Inicial 🍂',
          saudavel: false,
          gravidade: 'moderada',
          descricao: 'Pequenas manchas necróticas de cor parda identificadas nas folhas novas do cajueiro anão precoce. Esse sintoma indica atividade do fungo Colletotrichum gloeosporioides, impulsionado pela alta umidade matinal recente.',
          recomendacoes: [
            'Realizar a poda higiênica imediata de todos os ramos florais murchos ou necróticos.',
            'Pulverizar calda bordalesa agroecológica a 1% preventivamente logo no início da manhã.',
            'Recolher e enterrar ou queimar os restos de poda fora do limite do pomar.'
          ],
          prevencao: [
            'Evitar o adensamento excessivo das copas, garantindo ventilação solar ideal.',
            'Manter adubação equilibrada com foco em potássio para enrijecer as folhas.'
          ],
          criadoEm: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        const mockDiag2: Diagnostico = {
          id: 'diag_mock_2',
          usuarioId: user.uid,
          fotoURL: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=600',
          praga: 'Folha Saudável - Desenvolvimento Ideal 🌱',
          saudavel: true,
          gravidade: 'nenhuma',
          descricao: 'Análise morfológica indica folhas firmes, excelente coloração clorofiliana (verde vivo) e ausência completa de insetos mastigadores, pulgões ou sintomas fúngicos.',
          recomendacoes: [
            'Fazer roçagem baixa nas entrelinhas mantendo a matéria orgânica na projeção da copa.',
            'Manter o calendário de vistorias visuais semanais nas panículas em floração.'
          ],
          prevencao: [
            'Utilizar cobertura morta na raiz para preservar a umidade no solo semiárido.'
          ],
          criadoEm: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        const seed = [mockDiag1, mockDiag2];
        localStorage.setItem('cajutech_diagnosticos_demo', JSON.stringify(seed));
        setDiagnosticos(seed);
      }
      setLoadingDiagnosticos(false);
      return;
    }

    // For real registered users, fetch directly from Firestore
    const path = 'diagnosticos';
    const q = query(
      collection(db, path),
      where('usuarioId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Diagnostico[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Diagnostico);
      });
      // Sort manually in memory by criadoEm desc to avoid composite index requirements
      list.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
      setDiagnosticos(list);
      setLoadingDiagnosticos(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      setLoadingDiagnosticos(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Fetch Notifications History
  useEffect(() => {
    if (!user) return;

    setLoadingNotificacoes(true);

    // For high-fidelity demo users
    if (user.uid.startsWith('demo_')) {
      const stored = localStorage.getItem('cajutech_notificacoes_demo');
      if (stored) {
        setNotificacoes(JSON.parse(stored));
      } else {
        const mockNotif1: AlertaNotificacao = {
          id: 'notif_mock_1',
          usuarioId: user.uid,
          titulo: '🚨 Alerta de Seca Severa Elevado',
          mensagem: 'Umidade relativa do ar projetada para cair abaixo de 20% nos próximos 5 dias em sua região. Intensifique a irrigação localizada nos cajueiros jovens.',
          tipo: 'clima',
          lida: false,
          criadoEm: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        };

        const mockNotif2: AlertaNotificacao = {
          id: 'notif_mock_2',
          usuarioId: user.uid,
          titulo: '⚠️ Alerta de Praga Sazonal: Tripes',
          mensagem: 'Aviso fitossanitário: Registro de infestação de tripes nos pomares vizinhos. Inspecione suas flores imediatamente.',
          tipo: 'praga',
          lida: true,
          criadoEm: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        };

        const seed = [mockNotif1, mockNotif2];
        localStorage.setItem('cajutech_notificacoes_demo', JSON.stringify(seed));
        setNotificacoes(seed);
      }
      setLoadingNotificacoes(false);
      return;
    }

    // For real registered users, fetch directly from Firestore
    const path = 'notificacoes';
    const q = query(
      collection(db, path),
      where('usuarioId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: AlertaNotificacao[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as AlertaNotificacao);
      });
      // Sort manually by date descending
      list.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
      setNotificacoes(list);
      setLoadingNotificacoes(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      setLoadingNotificacoes(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  const currentCalendar = CALENDARIO_AGRICOLA[selectedMonthIndex];

  const handlePrevMonth = () => {
    setSelectedMonthIndex(prev => (prev === 0 ? 11 : prev - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthIndex(prev => (prev === 11 ? 0 : prev + 1));
  };

  // Helper formatting dates beautifully
  const formatFriendlyDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Toggle custom push preference
  const handleToggleNotifications = async () => {
    const nextVal = !(user.notificacoesHabilitadas ?? true);
    await toggleNotifications(nextVal);
  };

  // Trigger simulated push notification (FCM Integration Simulation)
  const triggerSimulatedAlert = async (type: 'clima' | 'praga') => {
    const isEnabled = user.notificacoesHabilitadas ?? true;
    
    if (!isEnabled) {
      // Prompt user that they turned off notifications
      const warningAlert: AlertaNotificacao = {
        id: `warn_${Date.now()}`,
        usuarioId: user.uid,
        titulo: 'Notificações Desabilitadas 🔕',
        mensagem: 'Você desativou os alertas push em suas configurações de perfil. Habilite-os acima para receber este aviso!',
        tipo: 'clima',
        lida: false,
        criadoEm: new Date().toISOString()
      };
      setActivePushAlert(warningAlert);
      setShowNotificationBanner(true);
      playNotificationChime();
      return;
    }

    let titulo = '';
    let mensagem = '';
    if (type === 'clima') {
      titulo = '🚨 Alerta Crítico: Seca Severa Extrema';
      mensagem = `Inmet indica onda de calor extrema com seca persistente na região de ${user.regiao}. Risco severo de queda de flores. Regue diariamente!`;
    } else {
      titulo = '⚠️ Nova Praga Sazonal Identificada';
      mensagem = `Alerta da Embrapa: Inseto Tripes-do-Cajueiro identificado se espalhando rapidamente em ${user.regiao}. Aplique o controle biológico natural.`;
    }

    const alertId = `alerta_${Date.now()}`;
    const newAlert: AlertaNotificacao = {
      id: alertId,
      usuarioId: user.uid,
      titulo,
      mensagem,
      tipo: type,
      lida: false,
      criadoEm: new Date().toISOString()
    };

    // Save to localStorage or Firestore depending on user type
    if (user.uid.startsWith('demo_')) {
      const stored = localStorage.getItem('cajutech_notificacoes_demo') || '[]';
      const current = JSON.parse(stored);
      const updated = [newAlert, ...current];
      localStorage.setItem('cajutech_notificacoes_demo', JSON.stringify(updated));
      setNotificacoes(updated);
    } else {
      try {
        await setDoc(doc(db, 'notificacoes', alertId), newAlert);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `notificacoes/${alertId}`);
      }
    }

    // Trigger visual sliding notification banner with audio sound
    setActivePushAlert(newAlert);
    setShowNotificationBanner(true);
    playNotificationChime();

    // Trigger standard browser native push alert if permitted
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(titulo, { body: mensagem });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(titulo, { body: mensagem });
          }
        });
      }
    }
  };

  // Mark specific notification as read
  const handleMarkNotificationRead = async (id: string) => {
    if (user.uid.startsWith('demo_')) {
      const stored = localStorage.getItem('cajutech_notificacoes_demo') || '[]';
      const current = JSON.parse(stored);
      const updated = current.map((n: AlertaNotificacao) => n.id === id ? { ...n, lida: true } : n);
      localStorage.setItem('cajutech_notificacoes_demo', JSON.stringify(updated));
      setNotificacoes(updated);
    } else {
      try {
        await setDoc(doc(db, 'notificacoes', id), { lida: true }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `notificacoes/${id}`);
      }
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id: string) => {
    if (user.uid.startsWith('demo_')) {
      const stored = localStorage.getItem('cajutech_notificacoes_demo') || '[]';
      const current = JSON.parse(stored);
      const updated = current.filter((n: AlertaNotificacao) => n.id !== id);
      localStorage.setItem('cajutech_notificacoes_demo', JSON.stringify(updated));
      setNotificacoes(updated);
    } else {
      try {
        await deleteDoc(doc(db, 'notificacoes', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `notificacoes/${id}`);
      }
    }
  };

  const gravityColors = (g: string) => {
    switch (g) {
      case 'nenhuma': return 'bg-green-50 text-green-800 border-green-200';
      case 'leve': return 'bg-art-cream text-art-cream-text border-art-cream-border';
      case 'moderada': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'grave': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  const gravityLabel = (g: string) => {
    switch (g) {
      case 'nenhuma': return 'Saudável';
      case 'leve': return 'Leve (Manejo simples)';
      case 'moderada': return 'Moderada (Requer atenção)';
      case 'grave': return 'Grave (Ação imediata!)';
      default: return g;
    }
  };

  if (viewingCursoCultivo) {
    return (
      <div className="space-y-4" id="viewing-curso-cultivo-wrapper">
        <button
          onClick={() => setViewingCursoCultivo(false)}
          className="flex items-center gap-1.5 text-xs text-art-muted hover:text-art-green font-bold transition-all cursor-pointer bg-white dark:bg-art-gray-bg/60 border border-art-border px-4 py-2 rounded-full shadow-xs w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar para o Painel do Produtor</span>
        </button>
        <CursoCultivo />
      </div>
    );
  }

  return (
    <div className="space-y-6" id="farmer-dashboard">
      
      {/* Sliding-down Active Push Notification Banner */}
      {showNotificationBanner && activePushAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-11/12 max-w-lg z-50 animate-fade-in bg-white/95 backdrop-blur-md rounded-3xl border border-art-orange shadow-lg p-5 flex items-start gap-4 transition-all transform scale-100 duration-300">
          <div className="p-3 bg-art-cream border border-art-cream-border text-art-orange rounded-full shrink-0">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-art-orange tracking-widest font-mono">Notificação Push FCM</span>
              <button 
                onClick={() => setShowNotificationBanner(false)}
                className="text-art-muted hover:text-art-dark text-xs font-bold font-sans cursor-pointer hover:underline"
              >
                Fechar ×
              </button>
            </div>
            <h4 className="font-serif font-bold text-base text-art-dark leading-tight">{activePushAlert.titulo}</h4>
            <p className="text-xs text-art-muted leading-relaxed">{activePushAlert.mensagem}</p>
            <div className="flex gap-2.5 pt-1.5">
              <button 
                onClick={() => {
                  setShowNotificationBanner(false);
                  // Scroll to the notifications list
                  const element = document.getElementById('notifications-manager');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-art-orange hover:opacity-95 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-full shadow-sm transition-all cursor-pointer"
              >
                Ver no Painel
              </button>
              <button 
                onClick={() => setShowNotificationBanner(false)}
                className="bg-art-bg hover:bg-art-gray-bg border border-art-border text-art-dark text-[10px] font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer"
              >
                Dispensar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome header banner */}
      <div className="bg-art-orange rounded-3xl p-8 text-white relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Subtle background decoration */}
        <div className="absolute -right-10 -bottom-10 opacity-10 text-white">
          <svg width="250" height="250" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="currentColor" />
          </svg>
        </div>
        
        <div className="relative z-10 space-y-3">
          <span className="inline-block text-[10px] bg-white/20 border border-white/20 font-bold px-3 py-1 rounded-full uppercase tracking-wider text-white">
            Painel do Produtor Rural 🌾
          </span>
          <h1 className="font-serif font-medium text-3xl md:text-5xl leading-tight tracking-tighter">
            Hora de cuidar da <br className="hidden md:inline"/><span className="italic underline decoration-2 underline-offset-8">floração</span>, {user.nome}!
          </h1>
          <p className="text-sm opacity-90 max-w-md font-light italic">
            Gerencie seu pomar de cajueiro, consulte a previsão do tempo regional e faça análise instantânea de pragas por foto com inteligência artificial.
          </p>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-xs shrink-0 self-stretch md:self-auto flex flex-col justify-center">
          <span className="opacity-70">Localização cadastrada:</span>
          <strong className="block text-white text-sm font-serif mt-1">{user.regiao}</strong>
        </div>
      </div>

      {/* Promo banner for interactive tutorial */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-3xl p-6 text-white relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-art-border/40" id="interactive-promo-banner">
        <div className="space-y-1 z-10">
          <span className="bg-white/20 border border-white/10 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase text-white tracking-wider">
            Capacitação Prática Interativa 🌳
          </span>
          <h3 className="font-serif font-extrabold text-lg leading-tight mt-1">
            Curso de Cultivo & Simulador de Cova
          </h3>
          <p className="text-xs text-white/90 max-w-xl leading-relaxed">
            Seja você um estudante ou produtor de longa data: domine a escolha de clones, dimensões de cova e controle biológico de saúva! Conclua o curso e ganhe a insígnia <strong className="text-art-orange">Mestre do Plantio</strong>.
          </p>
        </div>
        <button
          onClick={() => setViewingCursoCultivo(true)}
          className="bg-white hover:bg-stone-50 text-emerald-800 font-extrabold px-5 py-2.5 rounded-full text-xs shadow-sm transition-all cursor-pointer shrink-0 z-10 hover:scale-103"
        >
          Iniciar Curso de Cultivo →
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Climate, Push Config, and Agricultural Calendar (Lg span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Weather Widget */}
          <WeatherWidget 
            regiaoAtual={user.regiao} 
            onRegiaoChange={(novaRegiao) => changeRegiao(novaRegiao)}
          />

          {/* Configurações de Notificações de Perfil & Alertas */}
          <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl shadow-sm border border-art-border p-6 space-y-5" id="notifications-manager">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-art-cream rounded-full text-art-cream-text border border-art-cream-border shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-art-dark">
                  Configurações de Alertas Push
                </h3>
                <p className="text-xs text-art-muted">
                  Defina suas preferências de perfil e receba alertas da Embrapa & Clima
                </p>
              </div>
            </div>

            {/* Notification Toggle Switch */}
            <div className="flex items-center justify-between p-4 bg-art-bg rounded-2xl border border-art-border/60">
              <div className="space-y-1">
                <span className="text-xs font-bold text-art-dark block">
                  Alertas Críticos de Pragas & Clima
                </span>
                <span className="text-[10px] text-art-muted block leading-snug">
                  Habilitar ou desabilitar o recebimento de avisos push
                </span>
              </div>
              <button 
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (user.notificacoesHabilitadas ?? true) ? 'bg-art-green' : 'bg-stone-300'
                }`}
              >
                <span className="sr-only">Toggle notifications</span>
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    (user.notificacoesHabilitadas ?? true) ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Simulated Alerts Area (FCM Simulator) */}
            <div className="space-y-3 pt-2 border-t border-art-border">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-art-muted flex items-center gap-1">
                <Activity className="w-3 h-3 text-art-orange" />
                Simulador de Disparo de Alertas (FCM)
              </h4>
              <p className="text-[10px] text-art-muted leading-relaxed">
                Clique nos botões abaixo para forçar o sistema a enviar notificações de teste aos agricultores cadastrados:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button 
                  onClick={() => triggerSimulatedAlert('clima')}
                  className="bg-white dark:bg-art-gray-bg hover:bg-art-bg text-art-dark border border-art-border rounded-xl py-2 px-3 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-102"
                >
                  <CloudLightning className="w-3.5 h-3.5 text-art-orange" />
                  Alerta Clima 🚨
                </button>
                <button 
                  onClick={() => triggerSimulatedAlert('praga')}
                  className="bg-white dark:bg-art-gray-bg hover:bg-art-bg text-art-dark border border-art-border rounded-xl py-2 px-3 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-102"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-art-green" />
                  Alerta Praga ⚠️
                </button>
              </div>
            </div>

            {/* Historical Received Alerts List */}
            <div className="space-y-3 pt-3 border-t border-art-border">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-art-dark flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-art-muted" />
                  Mensagens Recebidas ({notificacoes.length})
                </h4>
                {notificacoes.some(n => !n.lida) && (
                  <span className="text-[9px] bg-art-orange text-white px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                    Novas!
                  </span>
                )}
              </div>

              {loadingNotificacoes ? (
                <div className="flex justify-center py-4">
                  <RefreshCw className="w-5 h-5 text-art-orange animate-spin" />
                </div>
              ) : notificacoes.length === 0 ? (
                <p className="text-[11px] text-art-muted italic bg-art-bg/40 p-3 rounded-xl border border-dashed border-art-border text-center">
                  Nenhum aviso ou alerta recebido recentemente.
                </p>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {notificacoes.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-3 rounded-2xl border text-[11px] space-y-1.5 transition-all flex flex-col justify-between ${
                        item.lida 
                          ? 'bg-white dark:bg-art-gray-bg/40 border-art-border text-art-muted' 
                          : 'bg-art-cream/40 dark:bg-art-cream/20 border-art-cream-border text-art-dark shadow-xs'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[9px] font-bold block text-art-muted font-mono">
                            {formatFriendlyDate(item.criadoEm)}
                          </span>
                          <h5 className="font-bold text-xs truncate leading-tight">{item.titulo}</h5>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!item.lida && (
                            <button 
                              onClick={() => handleMarkNotificationRead(item.id)}
                              className="p-1 hover:bg-white dark:hover:bg-art-gray-bg rounded-md text-art-green cursor-pointer"
                              title="Marcar como lido"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteNotification(item.id)}
                            className="p-1 hover:bg-red-50 rounded-md text-red-500 cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="leading-relaxed font-medium">{item.mensagem}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Agricultural Calendar */}
          <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl shadow-sm border border-art-border p-6 space-y-4" id="agricultural-calendar">
            <div className="flex justify-between items-center border-b border-art-border pb-3">
              <h3 className="font-serif font-bold text-lg text-art-dark flex items-center gap-2">
                <Calendar className="w-5 h-5 text-art-green" />
                <span>Calendário Agrícola</span>
              </h3>

              <div className="flex items-center gap-1.5 bg-art-bg rounded-xl p-1 border border-art-border">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-white dark:hover:bg-art-gray-bg rounded-md text-art-muted transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-art-dark min-w-20 text-center uppercase tracking-wider font-serif">
                  {currentCalendar.mes}
                </span>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-white dark:hover:bg-art-gray-bg rounded-md text-art-muted transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Active stage banner */}
              <div className="p-4 bg-art-cream border border-art-cream-border rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-art-cream-text tracking-wider">Etapa do Cultivo do Caju</span>
                <h4 className="font-serif font-extrabold text-base text-art-dark mt-0.5">{currentCalendar.etapaCultivo}</h4>
              </div>

              {/* Month activities list */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-art-muted uppercase tracking-wider">Trabalhos Recomendados:</h5>
                <ul className="space-y-2 text-xs text-art-dark">
                  {currentCalendar.atividades.map((act, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start font-medium">
                      <span className="text-art-green font-bold shrink-0">🌱</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Month alerts list */}
              {currentCalendar.alertas.length > 0 && (
                <div className="p-3 bg-red-50/70 border border-red-100 text-red-950 text-xs rounded-xl flex gap-2 items-start font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold mb-0.5">Aviso Fitossanitário do Mês:</strong>
                    {currentCalendar.alertas.map((al, idx) => <span key={idx}>{al}</span>)}
                  </div>
                </div>
              )}

              {/* Month tips list */}
              {currentCalendar.dicas.length > 0 && (
                <div className="p-3 bg-art-gray-bg border border-art-gray-border text-art-green text-xs rounded-xl flex gap-2 items-start font-medium">
                  <HelpCircle className="w-4 h-4 text-art-green shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-art-dark mb-0.5">Dica CajuTech:</strong>
                    {currentCalendar.dicas.map((dic, idx) => <span key={idx}>{dic}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Pest Diagnoser, Diagnostics History and Income Calculator (Lg span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* AI Pest Diagnoser */}
          <PestDiagnoser />

          {/* Histórico de Diagnósticos Section */}
          <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl shadow-sm border border-art-border p-6 md:p-8 space-y-6" id="diagnostics-history">
            <div className="flex justify-between items-center border-b border-art-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-full text-emerald-700 border border-emerald-100 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-art-dark">
                    Histórico de Diagnósticos
                  </h3>
                  <p className="text-xs text-art-muted">
                    Consulte os relatórios fitossanitários e tratamentos recomendados
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-art-bg border border-art-border px-3 py-1.5 rounded-xl text-art-dark">
                Salvos: {diagnosticos.length}
              </span>
            </div>

            {loadingDiagnosticos ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <RefreshCw className="w-8 h-8 text-art-green animate-spin" />
                <p className="text-xs text-art-muted font-medium">Lendo histórico de diagnósticos...</p>
              </div>
            ) : diagnosticos.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-art-border rounded-2xl bg-art-bg/20 space-y-2">
                <p className="text-sm font-bold text-art-dark">Nenhum diagnóstico salvo</p>
                <p className="text-xs text-art-muted max-w-xs mx-auto">
                  Tire uma foto do seu cajueiro no módulo acima para receber seu primeiro diagnóstico inteligente.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {diagnosticos.map((item) => {
                  const isExpanded = expandedDiagId === item.id;
                  // summary is first recommendation
                  const recommendationsSummary = item.recomendacoes.length > 0 
                    ? item.recomendacoes[0] 
                    : "Acompanhar desenvolvimento regular do pomar.";

                  return (
                    <div 
                      key={item.id} 
                      className="border border-art-border rounded-2xl overflow-hidden shadow-xs hover:border-art-border/95 transition-all bg-white dark:bg-art-gray-bg/40"
                    >
                      {/* Collapsed view header */}
                      <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-art-bg/20 border-b border-art-border/40">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-art-muted flex items-center gap-1">
                            <Clock className="w-3 h-3 text-art-muted" />
                            {formatFriendlyDate(item.criadoEm)}
                          </span>
                          <h4 className="font-serif font-extrabold text-sm text-art-dark flex items-center gap-1.5">
                            {item.saudavel ? '🌱' : '🐛'} {item.praga}
                          </h4>
                          <p className="text-xs text-art-muted font-medium leading-relaxed max-w-lg truncate">
                            <strong className="text-art-dark">Dica:</strong> {recommendationsSummary}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <span className={`text-[9px] font-extrabold uppercase border px-2.5 py-1 rounded-full ${gravityColors(item.gravidade)}`}>
                            {gravityLabel(item.gravidade)}
                          </span>
                          <button 
                            onClick={() => setExpandedDiagId(isExpanded ? null : item.id)}
                            className="bg-white dark:bg-art-gray-bg hover:bg-art-bg text-art-dark border border-art-border hover:border-art-muted font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          >
                            <span>{isExpanded ? 'Ocultar' : 'Ver Detalhes'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="p-6 space-y-5 border-t border-art-border animate-fade-in bg-white dark:bg-art-gray-bg/40">
                          
                          {/* Image preview with referrer check */}
                          <div className="flex flex-col md:flex-row gap-5">
                            {item.fotoURL ? (
                              <div className="md:w-1/3 shrink-0 relative rounded-2xl overflow-hidden border border-art-border shadow-xs max-h-56 bg-art-dark flex items-center justify-center">
                                <img 
                                  src={item.fotoURL} 
                                  alt="Original do Diagnóstico" 
                                  referrerPolicy="no-referrer"
                                  className="max-h-56 object-contain rounded-xl"
                                />
                                <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-art-gray-bg/90 backdrop-blur-xs border border-art-border px-2.5 py-1 rounded-md text-[9px] font-bold text-art-dark flex items-center gap-1">
                                  <Shield className="w-3 h-3 text-art-green" />
                                  <span>Foto Salva</span>
                                </div>
                              </div>
                            ) : (
                              <div className="md:w-1/3 shrink-0 bg-art-bg border border-art-border rounded-2xl flex items-center justify-center h-40 text-art-muted text-xs">
                                Nenhuma foto registrada
                              </div>
                            )}

                            <div className="flex-1 space-y-4">
                              <div className="space-y-1.5">
                                <h5 className="text-xs font-bold text-art-dark uppercase tracking-wider">Identificação do Especialista IA</h5>
                                <p className="text-xs text-art-muted leading-relaxed bg-art-bg/40 border border-art-border p-3.5 rounded-xl">
                                  {item.descricao}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Recommendations */}
                          {item.recomendacoes.length > 0 && (
                            <div className="space-y-2.5">
                              <h5 className="text-xs font-extrabold text-art-dark flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-art-orange" />
                                Recomendações e Tratamentos sugeridos pelo sistema:
                              </h5>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-art-muted">
                                {item.recomendacoes.map((rec, idx) => (
                                  <li key={idx} className="flex gap-2 items-start bg-emerald-50/30 p-3 rounded-xl border border-emerald-100/50">
                                    <span className="text-emerald-700 font-extrabold">✓</span>
                                    <span className="leading-relaxed font-semibold">{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Prevention measures */}
                          {item.prevencao && item.prevencao.length > 0 && (
                            <div className="space-y-2.5">
                              <h5 className="text-xs font-extrabold text-art-dark flex items-center gap-1.5">
                                <Shield className="w-4 h-4 text-art-green" />
                                Ações recomendadas de Prevenção:
                              </h5>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-art-muted">
                                {item.prevencao.map((prev, idx) => (
                                  <li key={idx} className="flex gap-2 items-start bg-art-cream/20 p-3 rounded-xl border border-art-cream-border">
                                    <span className="text-art-cream-text font-bold">•</span>
                                    <span className="leading-relaxed font-semibold">{prev}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Footer details */}
                          <div className="flex items-center justify-between text-[10px] text-art-muted border-t border-art-border/40 pt-4">
                            <span>ID Diagnóstico: <strong className="font-mono">{item.id}</strong></span>
                            <span>Autor: <strong className="font-sans">CajuTech Inteligência Artificial</strong></span>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Income Calculator */}
          <IncomeCalculator />
        </div>
      </div>
    </div>
  );
}
