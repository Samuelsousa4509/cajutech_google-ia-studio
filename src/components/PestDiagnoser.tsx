import { useState, useRef } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle, RefreshCw, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Diagnostico } from '../types';

export default function PestDiagnoser() {
  const { user, unlockBadge, addPoints } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Diagnostico | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDiagnose = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: image })
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor de diagnóstico');
      }

      const data = await response.json();
      
      const diagnosisId = `diag_${Date.now()}`;
      const newDiagnosis: Diagnostico = {
        id: diagnosisId,
        usuarioId: user?.uid || 'anonimo',
        fotoURL: image,
        praga: data.praga,
        saudavel: data.saudavel ?? (!data.praga.toLowerCase().includes('doença') && !data.praga.toLowerCase().includes('antracnose') && !data.praga.toLowerCase().includes('broca')),
        gravidade: data.gravidade || 'leve',
        descricao: data.descricao,
        recomendacoes: data.recomendacoes || [],
        prevencao: data.prevencao || [],
        criadoEm: new Date().toISOString()
      };

      setResult(newDiagnosis);

      // Save to Firestore if real user session
      if (user && !user.uid.startsWith('demo_')) {
        await setDoc(doc(db, 'diagnosticos', diagnosisId), newDiagnosis);
      } else if (user && user.uid.startsWith('demo_')) {
        const stored = localStorage.getItem('cajutech_diagnosticos_demo') || '[]';
        const current = JSON.parse(stored);
        const updated = [newDiagnosis, ...current];
        localStorage.setItem('cajutech_diagnosticos_demo', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('cajutech_new_diagnosis', { detail: newDiagnosis }));
      }

      // Unlock "agricultor_digital" badge & give 20 points
      await unlockBadge('agricultor_digital');
      await addPoints(20, 'Fez diagnóstico de praga por inteligência artificial');

    } catch (err: any) {
      console.error(err);
      setError('Desculpe, ocorreu um erro ao se comunicar com o especialista de IA. Verifique se o GEMINI_API_KEY está configurado ou tente com outra imagem.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getGravityBadgeColor = (gravity: string) => {
    switch (gravity) {
      case 'nenhuma': return 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/20';
      case 'leve': return 'bg-art-cream dark:bg-art-cream/10 text-art-cream-text dark:text-art-cream-text/90 border-art-cream-border dark:border-art-cream-border/20';
      case 'moderada': return 'bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800/20';
      case 'grave': return 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/20';
      default: return 'bg-art-bg dark:bg-art-gray-bg/40 text-art-dark border-art-border';
    }
  };

  const getGravityLabel = (gravity: string) => {
    switch (gravity) {
      case 'nenhuma': return 'Nenhuma - Saudável';
      case 'leve': return 'Leve (Manejo simples)';
      case 'moderada': return 'Moderada (Requer atenção)';
      case 'grave': return 'Grave (Ação imediata!)';
      default: return gravity;
    }
  };

  return (
    <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl shadow-sm border border-art-border p-6 md:p-8" id="pest-diagnoser">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-art-cream rounded-full text-art-cream-text border border-art-cream-border shrink-0">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-lg text-art-dark">
            Diagnóstico por Imagem com IA
          </h3>
          <p className="text-xs text-art-muted">
            Tire foto de uma folha ou galho do cajueiro para descobrir pragas e doenças na hora
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Upload Container */}
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-art-border hover:border-art-orange rounded-3xl p-8 text-center cursor-pointer transition-all bg-art-bg/40 hover:bg-art-cream/20 group"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment" // direct camera access on mobile
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white dark:bg-art-gray-bg rounded-full shadow-sm border border-art-border text-art-muted group-hover:text-art-orange group-hover:scale-110 transition-all mb-3">
                <Camera className="w-8 h-8" />
              </div>
              <span className="text-sm font-bold text-art-dark block mb-1">
                Tirar Foto ou Enviar Imagem
              </span>
              <p className="text-xs text-art-muted max-w-xs mx-auto leading-relaxed">
                No celular, abre a câmera automaticamente. Suporta fotos de folhas, flores, galhos ou frutos.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative rounded-3xl overflow-hidden border border-art-border shadow-sm max-h-72 flex justify-center bg-art-dark">
              <img 
                src={image} 
                alt="Imagem para diagnóstico" 
                className="max-h-72 object-contain"
              />
              
              {!loading && !result && (
                <button 
                  onClick={handleReset}
                  className="absolute top-3 right-3 bg-white/95 text-art-dark hover:bg-white text-xs font-bold px-4 py-2 rounded-full shadow-sm border border-art-border transition-all cursor-pointer"
                >
                  Substituir
                </button>
              )}
            </div>

            {/* Submit Diagnostico */}
            {!result && !loading && (
              <button 
                onClick={handleDiagnose}
                className="w-full bg-art-orange hover:opacity-95 text-white font-bold py-3 px-6 rounded-full shadow-sm text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Analisar com IA CajuTech 🔍
              </button>
            )}

            {/* Loading state */}
            {loading && (
              <div className="bg-art-cream/40 border border-art-cream-border rounded-3xl p-6 text-center animate-pulse flex flex-col items-center justify-center">
                <RefreshCw className="w-8 h-8 text-art-green animate-spin mb-3" />
                <h4 className="font-serif font-bold text-art-dark text-sm mb-1.5">
                  A Inteligência Artificial está analisando seu cajueiro...
                </h4>
                <p className="text-xs text-art-muted max-w-xs leading-relaxed">
                  Buscando correspondências fitossanitárias com a base de pragas e doenças da Embrapa Meio-Norte.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 items-start text-xs text-red-800 shadow-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                <div className="space-y-1.5">
                  <p className="font-bold">Falha na análise</p>
                  <p className="leading-relaxed">{error}</p>
                  <button 
                    onClick={handleDiagnose}
                    className="text-xs text-red-900 font-bold hover:underline cursor-pointer"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            )}

            {/* Diagnosis Result */}
            {result && (
              <div className="bg-art-bg border border-art-border rounded-3xl p-6 space-y-4 animate-fade-in">
                {/* Result Header */}
                <div className="flex items-start justify-between border-b border-art-border pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Praga / Doença Identificada</span>
                    <h4 className="font-serif font-bold text-lg text-art-dark flex items-center gap-2 mt-1">
                      {result.saudavel ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-emerald-600 inline shrink-0" />
                          Planta Saudável! 🌱
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-art-orange inline shrink-0" />
                          {result.praga}
                        </>
                      )}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold uppercase border px-3 py-1 rounded-full ${getGravityBadgeColor(result.gravidade)}`}>
                    {getGravityLabel(result.gravidade)}
                  </span>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-art-dark">Sobre esta identificação</h5>
                  <p className="text-xs text-art-muted leading-relaxed bg-white dark:bg-art-gray-bg/60 border border-art-border p-3.5 rounded-xl shadow-sm">
                    {result.descricao}
                  </p>
                </div>

                {/* Recommendations */}
                {result.recomendacoes.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-art-dark flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-art-orange" />
                      Manejos e Tratamentos Ecológicos sugeridos:
                    </h5>
                    <ul className="space-y-1.5 text-xs text-art-muted">
                      {result.recomendacoes.map((rec, idx) => (
                        <li key={idx} className="flex gap-2 items-start bg-emerald-50/40 dark:bg-emerald-950/10 p-2.5 rounded-xl border border-emerald-100/50 dark:border-emerald-800/20">
                          <span className="text-emerald-700 font-bold">✓</span>
                          <span className="leading-relaxed font-medium">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prevention */}
                {result.prevencao.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-art-dark flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-art-green" />
                      Dicas para prevenir no pomar:
                    </h5>
                    <ul className="space-y-1.5 text-xs text-art-muted">
                      {result.prevencao.map((prev, idx) => (
                        <li key={idx} className="flex gap-2 items-start bg-art-cream/40 dark:bg-art-cream/10 p-2.5 rounded-xl border border-art-cream-border dark:border-art-cream-border/20">
                          <span className="text-art-cream-text font-bold">•</span>
                          <span className="leading-relaxed font-medium">{prev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Reset button */}
                <button 
                  onClick={handleReset}
                  className="w-full bg-white dark:bg-art-gray-bg/80 hover:bg-art-bg text-art-dark border border-art-border font-bold py-2.5 px-4 rounded-full text-xs transition-all cursor-pointer"
                >
                  Fazer outro diagnóstico 📸
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
