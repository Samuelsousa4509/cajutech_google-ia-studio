import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { 
  Sprout, 
  MapPin, 
  Droplets, 
  Thermometer, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Award, 
  Sliders, 
  ShieldAlert, 
  Sparkles,
  Info
} from 'lucide-react';

// regional data representing actual conditions in Piauí
const REGIOES_CLIMA = {
  'Piripiri - PI': {
    nome: 'Piripiri',
    precipitacao: '1.100 mm/ano',
    solo: 'Luvissolo arenoso-argiloso',
    umidade: '65%',
    periodoSeco: 'Junho a Novembro',
    conselho: 'Possui as maiores taxas de chuva dentre as regiões produtoras. O plantio em sequeiro (sem irrigação) é altamente viável se feito rigidamente em Janeiro ou Fevereiro. Recomenda-se quebra-ventos devido a ventanias de Setembro.',
    compatibilidadeClone: {
      'CCP 76': 95,
      'CCP 06': 90,
      'BRS 189': 92
    }
  },
  'Picos - PI': {
    nome: 'Picos',
    precipitacao: '680 mm/ano',
    solo: 'Latossolo arenoso profundo',
    umidade: '45%',
    periodoSeco: 'Maio a Dezembro',
    conselho: 'Clima semiárido clássico, com altas temperaturas o ano todo. Irrigação por gotejamento localizada é indispensável nos primeiros 18 meses para garantir a sobrevivência das mudas. O clone CCP 76 é o campeão de sobrevivência aqui.',
    compatibilidadeClone: {
      'CCP 76': 98,
      'CCP 06': 85,
      'BRS 189': 75
    }
  },
  'Pio IX - PI': {
    nome: 'Pio IX',
    precipitacao: '580 mm/ano',
    solo: 'Regossolo arenoso e raso',
    umidade: '40%',
    periodoSeco: 'Maio a Janeiro',
    conselho: 'Região de seca severa e ventos constantes. O coroamento com espessa cobertura morta (palhada de milho ou folhas secas) é vital para evitar a evaporação rápida da água. Use gel hidrorretentor nas covas para poupar água de irrigação.',
    compatibilidadeClone: {
      'CCP 76': 99,
      'CCP 06': 80,
      'BRS 189': 68
    }
  },
  'Teresina - PI': {
    nome: 'Teresina',
    precipitacao: '1.300 mm/ano',
    solo: 'Argissolo vermelho-amarelo',
    umidade: '70%',
    periodoSeco: 'Julho a Novembro',
    conselho: 'Excelente volume de chuvas, mas temperaturas extremamente elevadas. Risco aumentado de doenças fúngicas (Antracnose) nas brotações jovens se a drenagem do solo for deficiente. Use espaçamento amplo de 8x8 metros.',
    compatibilidadeClone: {
      'CCP 76': 90,
      'CCP 06': 92,
      'BRS 189': 94
    }
  }
};

const CLONES = [
  {
    id: 'CCP 76',
    nome: 'CCP 76 (Anão Precoce)',
    desc: 'O clone mais famoso do Nordeste. Altíssima tolerância à seca, copa compacta e excelente rendimento de cajuína com pedúnculos muito doces.',
    porte: 'Anão Precoce',
    sabor: 'Super Doce (12-14° Brix)',
    pesoCastanha: '7g',
    vantagem: 'Excelente para produção de suco, cajuína e resistente ao estresse hídrico severo.',
  },
  {
    id: 'CCP 06',
    nome: 'CCP 06 (Anão Precoce)',
    desc: 'Altamente recomendado para a comercialização de castanhas de mesa. Produz amêndoas grandes e possui forte resistência à doença de Resinose.',
    porte: 'Anão Precoce',
    sabor: 'Suave / Equilibrado',
    pesoCastanha: '9g',
    vantagem: 'Castanhas maiores de alto valor de exportação e excelente rusticidade.',
  },
  {
    id: 'BRS 189',
    nome: 'BRS 189 (Anão Precoce)',
    desc: 'Especialmente desenvolvido pela Embrapa para polpas e consumo in natura. Produz um pedúnculo gigante, carnoso e extremamente suculento.',
    porte: 'Anão Precoce',
    sabor: 'Extremamente Suculento',
    pesoCastanha: '8g',
    vantagem: 'Caju muito grande e vistoso, de rápida aceitação nas feiras livres e mercados do Piauí.',
  }
];

const MESES = [
  { nome: 'Jan', status: 'excelente', desc: 'Estação chuvosa ativa. Solo úmido e quente.' },
  { nome: 'Fev', status: 'excelente', desc: 'Perfeito! Chuvas consolidadas ajudam no enraizamento.' },
  { nome: 'Mar', status: 'bom', desc: 'Bom período, mas o agricultor deve vigiar o fim das chuvas.' },
  { nome: 'Abr', status: 'regular', desc: 'Transição. Requer rega nos dias de veranico.' },
  { nome: 'Mai', status: 'critico', desc: 'Início da seca. Risco de desidratação da muda jovem.' },
  { nome: 'Jun', status: 'critico', desc: 'Perigo! Solo secando rapidamente, calor em alta.' },
  { nome: 'Jul', status: 'critico', desc: 'Seca extrema. Exige gotejamento diário rigoroso.' },
  { nome: 'Ago', status: 'critico', desc: 'B-O-B-A! Seca severa com vento forte desidratante.' },
  { nome: 'Set', status: 'critico', desc: 'Pico do calor ("B-O-B-A"). Risco imenso de morte sem água.' },
  { nome: 'Out', status: 'critico', desc: 'Meses mais quentes do ano. Solo fervendo.' },
  { nome: 'Nov', status: 'regular', desc: 'Primeiras chuvas de caju, mas instáveis.' },
  { nome: 'Dez', status: 'bom', desc: 'Preparação excelente. Mudas plantadas agora crescem rápido.' },
];

export default function CursoCultivo() {
  const { user, addPoints, unlockBadge } = useAuth();
  
  // States for interactive course
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState<keyof typeof REGIOES_CLIMA>(
    (user?.regiao as keyof typeof REGIOES_CLIMA) || 'Piripiri - PI'
  );
  
  // Step selections
  const [selectedClone, setSelectedClone] = useState<string>('');
  
  // Excavation simulator states
  const [covaLargura, setCovaLargura] = useState(30);
  const [covaProfundidade, setCovaProfundidade] = useState(30);
  const [covaAdubo, setCovaAdubo] = useState(4);
  const [covaStatus, setCovaStatus] = useState<'ajustando' | 'sucesso' | 'erro'>('ajustando');
  const [covaFeedback, setCovaFeedback] = useState('Ajuste as dimensões e o adubo orgânico nos botões deslizantes abaixo.');

  // Timing states
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [monthFeedback, setMonthFeedback] = useState('');

  // Ant protection game state
  const [protectionChoice, setProtectionChoice] = useState<string>('');
  const [protectionFeedback, setProtectionFeedback] = useState('');

  // Course Completion State
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasClaimedPoints, setHasClaimedPoints] = useState(false);

  const regionInfo = REGIOES_CLIMA[selectedRegion] || REGIOES_CLIMA['Piripiri - PI'];

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value as keyof typeof REGIOES_CLIMA);
    setSelectedClone(''); // Reset clone choice as compatibility changes
  };

  // Evaluate the Pit (Cova) Simulation
  const handleTestCova = () => {
    if (covaLargura < 40 || covaProfundidade < 40) {
      setCovaStatus('erro');
      setCovaFeedback('❌ Dimensões insuficientes! Uma cova menor que 40x40 cm impede o livre crescimento das raízes pivotantes e laterais do cajueiro no solo compacto.');
    } else if (covaAdubo < 8) {
      setCovaStatus('erro');
      setCovaFeedback('⚠️ Nutrição fraca! Menos de 8 kg de adubo orgânico não fornecerão nutrientes suficientes para alimentar o cajueiro anão no seu primeiro ano crucial.');
    } else if (covaAdubo > 20) {
      setCovaStatus('erro');
      setCovaFeedback('⚠️ Excesso de adubo! Colocar muito adubo orgânico (acima de 20 kg) pode fermentar em contato com as raízes da muda jovem, queimando-as e matando a planta.');
    } else {
      setCovaStatus('sucesso');
      setCovaFeedback('✅ Cova Perfeita! Dimensões ideais (' + covaLargura + 'x' + covaProfundidade + ' cm) e adubação orgânica equilibrada (' + covaAdubo + ' kg). As raízes terão espaço aerado e nutrição gradual!');
    }
  };

  // Evaluate Month Choice
  const handleSelectMonth = (month: typeof MESES[0]) => {
    setSelectedMonth(month.nome);
    if (month.status === 'excelente') {
      setMonthFeedback(`🌟 Excelente! Plantar em ${month.nome} é perfeito no Piauí. Coincide com o início do período chuvoso, garantindo solo úmido contínuo para que as raízes enraízem profundamente antes que a seca chegue.`);
    } else if (month.status === 'bom' || month.nome === 'Nov') {
      setMonthFeedback(`👍 Bom! Plantar em ${month.nome} é viável, mas requer atenção. Há umidade residual, mas o período de estiagem severa está se aproximando rápido. Monitore o solo!`);
    } else if (month.status === 'regular') {
      setMonthFeedback(`⚠️ Regular. Plantar em ${month.nome} requer irrigação manual obrigatória. O solo está em transição de secagem rápida e as chuvas são raras.`);
    } else {
      setMonthFeedback(`🚨 Perigo! Plantar em ${month.nome} no Piauí coincide com o pico do calor ("B-O-B-A"). Sem irrigação localizada por gotejamento diária, a muda secará e morrerá em menos de uma semana devido à evapotranspiração extrema.`);
    }
  };

  // Evaluate Ant Choice
  const handleSelectProtection = (choice: string) => {
    setProtectionChoice(choice);
    if (choice === 'quimico') {
      setProtectionFeedback('⚠️ Ineficiente e poluente! O uso massivo de agrotóxicos químicos elimina polinizadores vitais (como as abelhas nativas) que o cajueiro precisa para fecundar suas flores e produzir frutos. Além disso, as formigas criam resistência rápida.');
    } else if (choice === 'barreira') {
      setProtectionFeedback('🌟 Sensacional! Usar um cone plástico no caule impede que as formigas subam. Adicionar folhas secas de gergelim preto nas trilhas funciona como um veneno biológico natural: as formigas levam para o ninho, e o gergelim combate o fungo que as alimenta, eliminando o formigueiro de forma ecológica e segura!');
    } else {
      setProtectionFeedback('❌ Prejuízo garantido! As formigas cortadeiras (Saúvas) conseguem desfolhar completamente um cajueiro jovem em menos de 24 horas. Sem folhas para fazer fotossíntese, a muda morre de imediato.');
    }
  };

  // Advance / Retreat steps
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Trigger Completion
      setIsCompleted(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClaimReward = () => {
    if (!hasClaimedPoints) {
      addPoints(25, 'Conclusão do Curso Interativo de Cultivo');
      unlockBadge('mestre_do_cultivo');
      setHasClaimedPoints(true);
    }
  };

  // Progress Bar percentage
  const progressPercent = (currentStep / 5) * 100;

  return (
    <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl shadow-sm border border-art-border p-6 md:p-8 space-y-6" id="curso-cultivo-container">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-art-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-art-cream dark:bg-art-cream/20 text-art-cream-text border border-art-cream-border text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
              Curso Interativo 🌳
            </span>
            <span className="flex items-center gap-1 text-[10px] text-art-orange font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" /> +25 XP
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-art-dark flex items-center gap-2">
            Curso de Cultivo do Caju Anão
          </h2>
          <p className="text-xs text-art-muted max-w-2xl leading-relaxed">
            Aprenda a planejar, adubar, plantar e proteger seu cajueiro utilizando dados climáticos reais do estado do Piauí.
          </p>
        </div>
        
        {/* Step Counter */}
        <div className="bg-art-bg dark:bg-art-gray-bg border border-art-border px-4 py-2 rounded-2xl text-right shrink-0">
          <span className="text-[10px] text-art-muted block font-bold font-mono uppercase">Progresso</span>
          <strong className="text-sm text-art-green font-mono">{currentStep} de 5 Etapas</strong>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-art-bg dark:bg-art-gray-bg h-2.5 rounded-full overflow-hidden border border-art-border/60">
        <div 
          className="bg-art-green h-full rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* STEP 1: CONFIGURAÇÃO DE CLIMA REGIONAL */}
            {currentStep === 1 && (
              <div className="space-y-5" id="step-climate">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex gap-3 items-start text-xs text-emerald-950 dark:text-emerald-300">
                  <Info className="w-4 h-4 text-art-green shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Por que o clima importa?</strong> O caju cresce bem em climas quentes, mas o estabelecimento da muda jovem depende criticamente da umidade do solo. No Piauí, as taxas de chuva mudam drasticamente de Piripiri a Pio IX! Selecione sua região para recalibrar o curso.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Select Region Panel */}
                  <div className="bg-art-bg dark:bg-art-gray-bg/40 border border-art-border rounded-2xl p-5 space-y-4 md:col-span-1">
                    <label className="block text-[10px] font-extrabold text-art-muted uppercase tracking-wider">
                      Selecione a Região do Piauí
                    </label>
                    <div className="relative">
                      <select 
                        value={selectedRegion}
                        onChange={handleRegionChange}
                        className="w-full bg-white dark:bg-art-gray-bg border border-art-border rounded-xl px-3 py-2.5 text-xs font-bold text-art-dark focus:outline-none focus:ring-2 focus:ring-emerald-600 appearance-none cursor-pointer"
                      >
                        <option value="Piripiri - PI">Piripiri (Região Norte/Cocais)</option>
                        <option value="Picos - PI">Picos (Região Centro-Sul)</option>
                        <option value="Pio IX - PI">Pio IX (Extremo Sudeste)</option>
                        <option value="Teresina - PI">Teresina (Região Metropolitana)</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-art-muted font-bold">▼</span>
                    </div>

                    {/* Regional stats card */}
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-art-border/60">
                        <span className="text-art-muted flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-art-green" /> Chuva Anual</span>
                        <strong className="text-art-dark font-mono">{regionInfo.precipitacao}</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs pb-2 border-b border-art-border/60">
                        <span className="text-art-muted flex items-center gap-1"><Sliders className="w-3.5 h-3.5 text-art-orange" /> Solo Típico</span>
                        <strong className="text-art-dark text-[10px] text-right max-w-[130px] leading-tight">{regionInfo.solo}</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-art-muted flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-red-500" /> Umidade Média</span>
                        <strong className="text-art-dark font-mono">{regionInfo.umidade}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Regionalized Recommendation Display */}
                  <div className="bg-white dark:bg-art-gray-bg/60 border border-art-border rounded-2xl p-5 space-y-4 md:col-span-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[9px] bg-art-cream dark:bg-art-cream/20 text-art-cream-text font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-art-cream-border">
                        Diagnóstico do Clima 🌦️
                      </span>
                      <h4 className="font-serif font-bold text-base text-art-dark flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-art-green" /> Recomendações para {regionInfo.nome}
                      </h4>
                      <p className="text-xs text-art-muted leading-relaxed font-medium bg-art-bg/40 dark:bg-art-bg/10 p-4 rounded-xl">
                        {regionInfo.conselho}
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-art-border/60">
                      <p className="text-[10px] text-art-muted italic">
                        Os dados climáticos influenciam diretamente as próximas etapas de escolha do clone e época do plantio!
                      </p>
                      <button
                        onClick={nextStep}
                        className="bg-art-green hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-full text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                      >
                        Avançar para Clone <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ESCOLHA DO CLONE */}
            {currentStep === 2 && (
              <div className="space-y-5" id="step-clone">
                <div className="flex justify-between items-center border-b border-art-border/60 pb-2">
                  <h3 className="font-serif font-bold text-base text-art-dark">
                    Selecione o Clone de Cajueiro ideal
                  </h3>
                  <span className="text-xs text-art-muted">
                    Região Ativa: <strong className="text-art-dark">{regionInfo.nome}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {CLONES.map(clone => {
                    const compatibility = regionInfo.compatibilidadeClone[clone.id as keyof typeof regionInfo.compatibilidadeClone] || 80;
                    const isSelected = selectedClone === clone.id;
                    
                    let compColor = 'text-green-600 border-green-200 bg-green-50/50';
                    if (compatibility < 85) compColor = 'text-art-cream-text border-art-cream-border bg-art-cream/30';
                    if (compatibility < 75) compColor = 'text-red-600 border-red-200 bg-red-50/50';

                    return (
                      <div 
                        key={clone.id}
                        onClick={() => setSelectedClone(clone.id)}
                        className={`border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-art-green shadow-md ring-2 ring-emerald-600/20' 
                            : 'bg-white dark:bg-art-gray-bg/30 border-art-border hover:border-art-orange/40 hover:shadow-sm'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-sans font-extrabold text-sm text-art-dark">{clone.nome}</h4>
                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${compColor}`}>
                              {compatibility}% Comp.
                            </div>
                          </div>
                          
                          <p className="text-[11px] text-art-muted leading-relaxed">
                            {clone.desc}
                          </p>

                          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-art-border/60 text-[10px] text-art-muted">
                            <div>Porte: <strong className="text-art-dark block">{clone.porte}</strong></div>
                            <div>Peso: <strong className="text-art-dark block">{clone.pesoCastanha} (castanha)</strong></div>
                            <div className="col-span-2 mt-1">Sabor caju: <strong className="text-art-dark block">{clone.sabor}</strong></div>
                          </div>
                        </div>

                        <button 
                          className={`w-full mt-4 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all ${
                            isSelected 
                              ? 'bg-art-green text-white shadow-inner' 
                              : 'bg-art-bg dark:bg-art-gray-bg/50 text-art-muted border border-art-border hover:bg-art-bg hover:text-art-dark'
                          }`}
                        >
                          {isSelected ? '✓ Selecionado' : 'Selecionar'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-art-border/60">
                  <button
                    onClick={prevStep}
                    className="bg-white hover:bg-art-bg text-art-dark border border-art-border font-bold py-2 px-4 rounded-full text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Região
                  </button>

                  <div className="flex items-center gap-3">
                    {!selectedClone && (
                      <span className="text-[10px] text-art-orange font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Escolha um clone para continuar
                      </span>
                    )}
                    <button
                      onClick={nextStep}
                      disabled={!selectedClone}
                      className={`font-bold py-2 px-4 rounded-full text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                        selectedClone 
                          ? 'bg-art-green hover:bg-emerald-700 text-white' 
                          : 'bg-stone-200 text-stone-400 border border-stone-200 cursor-not-allowed'
                      }`}
                    >
                      Avançar para Cova <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PREPARO DE COVAS (SIMULADOR) */}
            {currentStep === 3 && (
              <div className="space-y-5" id="step-excavation">
                <div className="flex justify-between items-center border-b border-art-border/60 pb-2">
                  <h3 className="font-serif font-bold text-base text-art-dark flex items-center gap-2">
                    🛠️ Simulador de Preparo de Cova
                  </h3>
                  <span className="text-xs text-art-muted">
                    Muda Selecionada: <strong className="text-art-green">{selectedClone}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Visual Excavation representation */}
                  <div className="bg-art-bg dark:bg-art-gray-bg/40 border border-art-border rounded-2xl p-5 flex flex-col items-center justify-center relative min-h-[220px]">
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-700 animate-pulse" />
                      <span className="text-[9px] font-mono font-bold text-amber-950 uppercase">Camada de Solo</span>
                    </div>

                    {/* Simple geometric representation of the pit */}
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-xs font-mono text-art-muted">Largura: {covaLargura} cm</span>
                      
                      {/* Pit box dynamically styled */}
                      <div 
                        className="bg-amber-900/10 border-2 border-dashed border-amber-800 rounded-b-xl flex flex-col items-center justify-center transition-all duration-300 relative"
                        style={{
                          width: `${Math.max(60, Math.min(220, covaLargura * 2.5))}px`,
                          height: `${Math.max(40, Math.min(180, covaProfundidade * 2.2))}px`,
                        }}
                      >
                        {/* Organic manure layer indicator inside the pit */}
                        <div 
                          className="absolute bottom-0 w-full bg-amber-950 rounded-b-lg border-t border-amber-700/50 transition-all duration-300"
                          style={{
                            height: `${Math.min(100, (covaAdubo / 25) * 100)}%`,
                            opacity: 0.8
                          }}
                        />

                        <span className="relative z-10 text-[10px] font-bold text-amber-950 bg-white/90 border border-amber-800 px-2 py-0.5 rounded-md shadow-sm font-mono text-center">
                          Cova: {covaLargura}x{covaProfundidade} cm <br />
                          {covaAdubo} kg Esterco
                        </span>
                      </div>

                      <span className="text-xs font-mono text-art-muted">Profundidade: {covaProfundidade} cm</span>
                    </div>
                  </div>

                  {/* Simulator Sliders */}
                  <div className="space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Slider 1: Largura */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-art-muted font-bold">Largura da Cova:</span>
                          <strong className="text-art-dark font-mono text-xs">{covaLargura} cm</strong>
                        </div>
                        <input 
                          type="range" 
                          min="20" 
                          max="80" 
                          step="5"
                          value={covaLargura}
                          onChange={e => {
                            setCovaLargura(Number(e.target.value));
                            setCovaStatus('ajustando');
                          }}
                          className="w-full h-1.5 bg-art-border rounded-lg appearance-none cursor-pointer accent-art-green"
                        />
                      </div>

                      {/* Slider 2: Profundidade */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-art-muted font-bold">Profundidade da Cova:</span>
                          <strong className="text-art-dark font-mono text-xs">{covaProfundidade} cm</strong>
                        </div>
                        <input 
                          type="range" 
                          min="20" 
                          max="80" 
                          step="5"
                          value={covaProfundidade}
                          onChange={e => {
                            setCovaProfundidade(Number(e.target.value));
                            setCovaStatus('ajustando');
                          }}
                          className="w-full h-1.5 bg-art-border rounded-lg appearance-none cursor-pointer accent-art-green"
                        />
                      </div>

                      {/* Slider 3: Adubo Orgânico */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-art-muted font-bold">Adubo Orgânico (Esterco Curtido):</span>
                          <strong className="text-art-dark font-mono text-xs">{covaAdubo} kg</strong>
                        </div>
                        <input 
                          type="range" 
                          min="2" 
                          max="30" 
                          step="1"
                          value={covaAdubo}
                          onChange={e => {
                            setCovaAdubo(Number(e.target.value));
                            setCovaStatus('ajustando');
                          }}
                          className="w-full h-1.5 bg-art-border rounded-lg appearance-none cursor-pointer accent-art-green"
                        />
                      </div>
                    </div>

                    {/* Result and validation panel */}
                    <div className="space-y-3">
                      <div className={`p-3 rounded-xl border text-xs leading-relaxed font-medium transition-all ${
                        covaStatus === 'sucesso' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-950 dark:text-emerald-300' 
                          : covaStatus === 'erro'
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-200 text-red-950 dark:text-red-300'
                          : 'bg-art-bg dark:bg-art-gray-bg/60 border-art-border text-art-muted'
                      }`}>
                        {covaFeedback}
                      </div>

                      {covaStatus !== 'sucesso' ? (
                        <button
                          onClick={handleTestCova}
                          className="w-full bg-art-orange hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          Validar Cova 📐
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCovaStatus('ajustando')}
                            className="flex-1 bg-white hover:bg-art-bg text-art-dark border border-art-border font-bold py-2 rounded-xl text-xs transition-all cursor-pointer"
                          >
                            Ajustar novamente
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-art-border/60">
                  <button
                    onClick={prevStep}
                    className="bg-white hover:bg-art-bg text-art-dark border border-art-border font-bold py-2 px-4 rounded-full text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Variedade
                  </button>

                  <div className="flex items-center gap-3">
                    {covaStatus !== 'sucesso' && (
                      <span className="text-[10px] text-art-orange font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Ajuste e valide a cova para prosseguir
                      </span>
                    )}
                    <button
                      onClick={nextStep}
                      disabled={covaStatus !== 'sucesso'}
                      className={`font-bold py-2 px-4 rounded-full text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                        covaStatus === 'sucesso' 
                          ? 'bg-art-green hover:bg-emerald-700 text-white' 
                          : 'bg-stone-200 text-stone-400 border border-stone-200 cursor-not-allowed'
                      }`}
                    >
                      Avançar para Época <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: ÉPOCA DE PLANTIO */}
            {currentStep === 4 && (
              <div className="space-y-5" id="step-timing">
                <div className="flex justify-between items-center border-b border-art-border/60 pb-2">
                  <h3 className="font-serif font-bold text-base text-art-dark flex items-center gap-2">
                    📅 Época de Plantio Ideal no Piauí
                  </h3>
                  <span className="text-xs text-art-muted">
                    Região Selecionada: <strong className="text-art-dark">{regionInfo.nome}</strong>
                  </span>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex gap-3 items-start text-xs text-amber-950 dark:text-amber-300">
                  <HelpCircle className="w-4.5 h-4.5 text-art-orange shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Desafio de Sobrevivência:</strong> Selecione o mês em que você executará o transplante da muda do saco plástico para o campo em <strong>{regionInfo.nome}</strong>. Lembre-se do período seco do local e da disponibilidade de água natural!
                  </p>
                </div>

                {/* Grid of Months */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {MESES.map(m => {
                    const isSelected = selectedMonth === m.nome;
                    
                    let bgBorderClass = 'bg-white border-art-border dark:bg-art-gray-bg/30';
                    if (isSelected) {
                      bgBorderClass = m.status === 'excelente' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/15 border-art-green ring-2 ring-emerald-500/20'
                        : m.status === 'bom'
                        ? 'bg-art-cream dark:bg-art-cream/15 border-art-cream-border ring-2 ring-amber-500/10'
                        : 'bg-red-50 dark:bg-red-950/15 border-red-400 ring-2 ring-red-500/10';
                    }

                    return (
                      <div
                        key={m.nome}
                        onClick={() => handleSelectMonth(m)}
                        className={`border rounded-xl p-3 text-center cursor-pointer transition-all hover:scale-102 ${bgBorderClass}`}
                      >
                        <span className="text-xs font-bold text-art-dark block mb-1">{m.nome}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                          m.status === 'excelente'
                            ? 'bg-green-100 text-green-800'
                            : m.status === 'bom'
                            ? 'bg-amber-100 text-amber-800'
                            : m.status === 'regular'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Pedagogical Feedback */}
                {selectedMonth && (
                  <div className="bg-art-bg dark:bg-art-gray-bg/60 border border-art-border p-4 rounded-xl text-xs leading-relaxed font-medium animate-fade-in text-art-dark">
                    {monthFeedback}
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between border-t border-art-border/60">
                  <button
                    onClick={prevStep}
                    className="bg-white hover:bg-art-bg text-art-dark border border-art-border font-bold py-2 px-4 rounded-full text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Cova
                  </button>

                  <div className="flex items-center gap-3">
                    {!selectedMonth && (
                      <span className="text-[10px] text-art-orange font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Escolha um mês para prosseguir
                      </span>
                    )}
                    <button
                      onClick={nextStep}
                      disabled={!selectedMonth}
                      className={`font-bold py-2 px-4 rounded-full text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                        selectedMonth 
                          ? 'bg-art-green hover:bg-emerald-700 text-white' 
                          : 'bg-stone-200 text-stone-400 border border-stone-200 cursor-not-allowed'
                      }`}
                    >
                      Avançar para Proteção <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: COMBATE ORGÂNICO A SAÚVAS */}
            {currentStep === 5 && (
              <div className="space-y-5" id="step-protection">
                <div className="flex justify-between items-center border-b border-art-border/60 pb-2">
                  <h3 className="font-serif font-bold text-base text-art-dark flex items-center gap-2">
                    🛡️ Desafio Final: Proteção de Mudas contra Saúvas
                  </h3>
                  <span className="text-xs text-art-muted">
                    Vigília pós-plantio
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Scenario Description */}
                  <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-200/60 rounded-2xl p-5 md:col-span-1 space-y-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0 mx-auto">
                      <ShieldAlert className="w-6 h-6 animate-bounce" />
                    </div>
                    <div className="text-center space-y-1.5">
                      <h4 className="font-sans font-extrabold text-sm text-red-950 dark:text-red-300">Formigas Cortadeiras!</h4>
                      <p className="text-[11px] text-red-900/80 dark:text-red-300/80 leading-relaxed">
                        Após 15 dias do plantio, você percebe rastros de <strong>saúva</strong> ao pé do seu precioso cajueiro jovem. Algumas folhas da base já foram cortadas. O que você faz?
                      </p>
                    </div>
                  </div>

                  {/* Options Selector */}
                  <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      {/* Option 1: Chemical */}
                      <div
                        onClick={() => handleSelectProtection('quimico')}
                        className={`p-3 border rounded-xl cursor-pointer transition-all flex gap-3 items-center ${
                          protectionChoice === 'quimico' 
                            ? 'border-art-orange bg-orange-50/20' 
                            : 'border-art-border bg-white hover:bg-stone-50'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full border border-art-border flex items-center justify-center shrink-0">
                          {protectionChoice === 'quimico' && <span className="w-2.5 h-2.5 rounded-full bg-art-orange" />}
                        </div>
                        <div className="text-left">
                          <strong className="text-xs text-art-dark block">Pulverizar Inseticida Químico Forte</strong>
                          <span className="text-[10px] text-art-muted">Aplicar inseticidas organofosforados para eliminar as formigas imediatamente.</span>
                        </div>
                      </div>

                      {/* Option 2: Agroecological */}
                      <div
                        onClick={() => handleSelectProtection('barreira')}
                        className={`p-3 border rounded-xl cursor-pointer transition-all flex gap-3 items-center ${
                          protectionChoice === 'barreira' 
                            ? 'border-art-green bg-emerald-50/20' 
                            : 'border-art-border bg-white hover:bg-stone-50'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full border border-art-border flex items-center justify-center shrink-0">
                          {protectionChoice === 'barreira' && <span className="w-2.5 h-2.5 rounded-full bg-art-green" />}
                        </div>
                        <div className="text-left">
                          <strong className="text-xs text-art-dark block">Cone Físico + Folhas de Gergelim Preto 🌱</strong>
                          <span className="text-[10px] text-art-muted">Instalar colar protetor no caule e espalhar gergelim na trilha para intoxicar o ninho naturalmente.</span>
                        </div>
                      </div>

                      {/* Option 3: Passive */}
                      <div
                        onClick={() => handleSelectProtection('passivo')}
                        className={`p-3 border rounded-xl cursor-pointer transition-all flex gap-3 items-center ${
                          protectionChoice === 'passivo' 
                            ? 'border-red-400 bg-red-50/20' 
                            : 'border-art-border bg-white hover:bg-stone-50'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full border border-art-border flex items-center justify-center shrink-0">
                          {protectionChoice === 'passivo' && <span className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                        </div>
                        <div className="text-left">
                          <strong className="text-xs text-art-dark block">Apenas Monitorar (Não intervir)</strong>
                          <span className="text-[10px] text-art-muted">Deixar a natureza agir, esperando que o ecossistema controle as saúvas por si só.</span>
                        </div>
                      </div>
                    </div>

                    {/* Feedback box */}
                    {protectionChoice && (
                      <div className="bg-art-bg dark:bg-art-gray-bg/60 border border-art-border p-3 rounded-xl text-xs leading-relaxed font-medium">
                        {protectionFeedback}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-art-border/60">
                  <button
                    onClick={prevStep}
                    className="bg-white hover:bg-art-bg text-art-dark border border-art-border font-bold py-2 px-4 rounded-full text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Época
                  </button>

                  <div className="flex items-center gap-3">
                    {protectionChoice !== 'barreira' && (
                      <span className="text-[10px] text-art-orange font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Encontre a solução ecológica para concluir
                      </span>
                    )}
                    <button
                      onClick={nextStep}
                      disabled={protectionChoice !== 'barreira'}
                      className={`font-bold py-2 px-4 rounded-full text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                        protectionChoice === 'barreira' 
                          ? 'bg-art-green hover:bg-emerald-700 text-white' 
                          : 'bg-stone-200 text-stone-400 border border-stone-200 cursor-not-allowed'
                      }`}
                    >
                      Concluir Curso 🏁
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* COURSE COMPLETED VIEW */
          <motion.div
            key="completion"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-art-green mx-auto border-4 border-white shadow-md">
              <Award className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-[10px] bg-art-cream dark:bg-art-cream/20 text-art-cream-text border border-art-cream-border font-bold px-3 py-1 rounded-full uppercase font-mono tracking-widest inline-block">
                Parabéns, Produtor do Futuro! 🎉
              </span>
              <h3 className="font-serif font-extrabold text-3xl text-art-dark">
                Você concluiu o Curso de Cultivo!
              </h3>
              <p className="text-xs text-art-muted leading-relaxed font-medium">
                Agora você domina o planejamento e as melhores práticas agroecológicas para o plantio e proteção de cajueiros anões precoces no estado do Piauí.
              </p>
            </div>

            {/* Simulated interactive digital medal badge */}
            <div className="bg-art-bg dark:bg-art-gray-bg border border-art-border p-6 rounded-2xl max-w-sm mx-auto flex items-center gap-4 text-left shadow-inner">
              <div className="w-14 h-14 bg-art-orange rounded-full flex items-center justify-center text-white shrink-0 shadow text-2xl">
                🌳
              </div>
              <div className="space-y-1">
                <strong className="text-xs font-bold text-art-dark block">Insígnia: Mestre do Plantio</strong>
                <p className="text-[10px] text-art-muted leading-tight">Desbloqueada ao demonstrar conhecimento sobre covas, variedades e manejo ecológico de pragas no semiárido.</p>
                <span className="inline-block text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase font-mono mt-1">
                  Ativa no Perfil
                </span>
              </div>
            </div>

            {/* Claim Reward Button */}
            <div className="pt-4 space-y-3">
              {!hasClaimedPoints ? (
                <button
                  onClick={handleClaimReward}
                  className="bg-art-orange hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="w-4 h-4" /> Resgatar 25 XP & Medalha
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-art-green font-bold flex items-center justify-center gap-1.5 animate-pulse">
                    <CheckCircle className="w-4.5 h-4.5" /> Recompensa de 25 XP resgatada e medalha adicionada à sua coleção!
                  </p>
                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      setSelectedClone('');
                      setCovaStatus('ajustando');
                      setSelectedMonth('');
                      setProtectionChoice('');
                      setIsCompleted(false);
                      setHasClaimedPoints(false);
                    }}
                    className="bg-white hover:bg-art-bg text-art-dark border border-art-border font-bold py-2 px-6 rounded-full text-xs transition-all cursor-pointer mx-auto block"
                  >
                    Estudar novamente 🔄
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
