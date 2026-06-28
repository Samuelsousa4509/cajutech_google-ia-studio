import { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, HelpCircle } from 'lucide-react';

export default function IncomeCalculator() {
  const [pesoTotal, setPesoTotal] = useState<number>(1000);
  const [precoPedunculo, setPrecoPedunculo] = useState<number>(0.80);
  const [precoCastanha, setPrecoCastanha] = useState<number>(4.50);

  // Math formulas:
  // 85% of total harvest is juicy peduncle
  const kgPedunculo = pesoTotal * 0.85;
  // 15% of total harvest is the valuable nut
  const kgCastanha = pesoTotal * 0.15;

  const rendaPedunculo = kgPedunculo * precoPedunculo;
  const rendaCastanha = kgCastanha * precoCastanha;
  const rendaTotal = rendaPedunculo + rendaCastanha;

  return (
    <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl shadow-sm border border-art-border p-6 md:p-8" id="income-calculator">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-art-cream rounded-full text-art-cream-text border border-art-cream-border shrink-0">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-lg text-art-dark">
            Calculadora de Renda e Safra
          </h3>
          <p className="text-xs text-art-muted">Estimativa baseada no aproveitamento integral do caju</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Total Weight Input */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-art-dark mb-1 flex justify-between">
            <span>Peso Total Colhido (Kg)</span>
            <span className="text-art-green font-mono font-bold">{pesoTotal.toLocaleString('pt-BR')} kg</span>
          </label>
          <input 
            type="range" 
            min="100" 
            max="10000" 
            step="100"
            value={pesoTotal}
            onChange={(e) => setPesoTotal(Number(e.target.value))}
            className="w-full accent-art-green h-1.5 bg-art-bg border border-art-border rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-art-muted mt-1 font-mono font-bold">
            <span>100 kg</span>
            <span>5.000 kg</span>
            <span>10.000 kg</span>
          </div>
        </div>

        {/* Price Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-art-dark">
              Preço Pedúnculo (R$/kg)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-art-muted font-bold">R$</span>
              <input 
                type="number" 
                step="0.10"
                min="0.10"
                value={precoPedunculo}
                onChange={(e) => setPrecoPedunculo(Math.max(0.1, Number(e.target.value)))}
                className="w-full bg-art-bg border border-art-border rounded-xl py-2.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-art-green text-art-dark font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-art-dark">
              Preço Castanha (R$/kg)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-art-muted font-bold">R$</span>
              <input 
                type="number" 
                step="0.50"
                min="0.50"
                value={precoCastanha}
                onChange={(e) => setPrecoCastanha(Math.max(0.1, Number(e.target.value)))}
                className="w-full bg-art-bg border border-art-border rounded-xl py-2.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-art-green text-art-dark font-bold"
              />
            </div>
          </div>
        </div>

        {/* Results Presentation */}
        <div className="bg-art-bg rounded-3xl p-5 border border-art-border space-y-4">
          <div className="flex items-center justify-between border-b border-art-border pb-3">
            <span className="text-xs text-art-muted">Estimativa da Divisão Física da Safra:</span>
            <span className="text-[10px] bg-art-cream text-art-cream-text px-2.5 py-1 rounded-full font-bold border border-art-cream-border">Proporção 85% / 15%</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-art-dark flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-art-orange"></span>
                Pedúnculo (Carne)
              </span>
              <p className="text-xs font-mono text-art-muted font-semibold">
                {kgPedunculo.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg gerado
              </p>
              <p className="text-sm font-bold font-serif text-art-dark">
                R$ {rendaPedunculo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="space-y-1.5 border-l border-art-border pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-art-dark flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-art-green"></span>
                Castanha Bruta
              </span>
              <p className="text-xs font-mono text-art-muted font-semibold">
                {kgCastanha.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg gerado
              </p>
              <p className="text-sm font-bold font-serif text-art-dark">
                R$ {rendaCastanha.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="border-t border-art-border pt-3.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-art-dark font-bold">
              <TrendingUp className="w-4 h-4 text-art-green" />
              <span>Renda Bruta Projetada:</span>
            </div>
            <span className="text-2xl font-bold font-serif text-art-green">
              R$ {rendaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Tip banner */}
        <div className="p-4 bg-art-cream dark:bg-art-cream/10 border border-art-cream-border dark:border-art-cream-border/20 rounded-2xl flex gap-2.5 items-start text-xs text-art-cream-text dark:text-art-cream-text/90 font-medium leading-relaxed">
          <HelpCircle className="w-4 h-4 shrink-0 text-art-cream-text mt-0.5" />
          <p>
            <strong>Dica do CajuTech:</strong> Processar o pedúnculo em Cajuína ou Doces em vez de vender in natura aumenta sua renda final em até 4 vezes!
          </p>
        </div>
      </div>
    </div>
  );
}
