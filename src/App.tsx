import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import LandingPage from './views/LandingPage';
import AlunoDashboard from './views/AlunoDashboard';
import AgricultorDashboard from './views/AgricultorDashboard';
import ProfessorDashboard from './views/ProfessorDashboard';
import Forum from './components/Forum';
import Conquistas from './views/Conquistas';
import { AIChatBot } from './components/AIChatBot';
import { RefreshCw } from 'lucide-react';

function DashboardRouter() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('');

  // Automatically sync default tab based on user profile
  useEffect(() => {
    if (user) {
      if (user.perfil === 'aluno') {
        setActiveTab('estudos');
      } else if (user.perfil === 'agricultor') {
        setActiveTab('pomar');
      } else if (user.perfil === 'professor') {
        setActiveTab('professor');
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
        <h2 className="font-sans font-extrabold text-stone-800 text-sm">Carregando o CajuTech...</h2>
        <p className="text-xs text-stone-500">Preparando as informações agrícolas para você.</p>
      </div>
    );
  }

  // Not logged in => render Landing page
  if (!user) {
    return <LandingPage onNavigate={(tab) => setActiveTab(tab)} />;
  }

  // Router based on selected tab
  const renderContent = () => {
    switch (activeTab) {
      case 'estudos':
        return <AlunoDashboard />;
      case 'pomar':
        return <AgricultorDashboard />;
      case 'professor':
        return <ProfessorDashboard />;
      case 'forum':
        return <Forum />;
      case 'conquistas':
        return <Conquistas />;
      default:
        // fallback based on role
        if (user.perfil === 'aluno') return <AlunoDashboard />;
        if (user.perfil === 'agricultor') return <AgricultorDashboard />;
        return <ProfessorDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-art-bg text-art-dark font-sans flex flex-col pb-20 md:pb-6">
      {/* Dynamic Top Nav */}
      <Navbar onTabChange={(tab) => setActiveTab(tab)} activeTab={activeTab} />
      
      {/* Desktop & Mobile Navigation Links */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Main Page Area Container */}
      <main className="flex-1 px-4 py-6 md:px-8 max-w-7xl mx-auto w-full">
        {renderContent()}
      </main>

      {/* Intelligent AI Chatbot */}
      <AIChatBot />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DashboardRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}
