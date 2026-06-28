import { useState, useEffect } from 'react';
import { CloudRain, Sun, Cloud, Thermometer, Droplets, AlertTriangle, RefreshCw } from 'lucide-react';

interface WeatherData {
  temp: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
}

const CIDADES = [
  { nome: 'Piripiri - PI', lat: -4.2703, lon: -41.7781 },
  { nome: 'Picos - PI', lat: -7.0783, lon: -41.4678 },
  { nome: 'Pio IX - PI', lat: -6.8392, lon: -40.5786 },
  { nome: 'Teresina - PI', lat: -5.0919, lon: -42.8034 }
];

export default function WeatherWidget({ regiaoAtual, onRegiaoChange }: { regiaoAtual: string, onRegiaoChange?: (r: string) => void }) {
  const [cidade, setCidade] = useState(CIDADES[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Sync state if parent region changes
  useEffect(() => {
    const matched = CIDADES.find(c => c.nome.toLowerCase().includes(regiaoAtual.split(' -')[0].toLowerCase()));
    if (matched) {
      setCidade(matched);
    }
  }, [regiaoAtual]);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    setError(false);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=America%2FFortaleza&forecast_days=1`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data.current) {
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          humidity: Math.round(data.current.relative_humidity_2m),
          precipitation: data.current.precipitation,
          weatherCode: data.current.weather_code,
          maxTemp: Math.round(data.daily.temperature_2m_max[0]),
          minTemp: Math.round(data.daily.temperature_2m_min[0])
        });
      } else {
        throw new Error("Dados inválidos");
      }
    } catch (err) {
      console.error("Erro ao carregar clima:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(cidade.lat, cidade.lon);
  }, [cidade]);

  const handleCidadeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = CIDADES.find(c => c.nome === e.target.value);
    if (selected) {
      setCidade(selected);
      if (onRegiaoChange) {
        onRegiaoChange(selected.nome);
      }
    }
  };

  // Weather description based on WMO code
  const getWeatherDesc = (code: number) => {
    if (code === 0) return { desc: 'Céu limpo', icon: <Sun className="w-10 h-10 text-amber-500 animate-pulse" /> };
    if (code <= 3) return { desc: 'Parcialmente nublado', icon: <Cloud className="w-10 h-10 text-gray-400" /> };
    if (code >= 51 && code <= 67) return { desc: 'Chuva leve', icon: <CloudRain className="w-10 h-10 text-blue-400 animate-bounce" /> };
    if (code >= 71 && code <= 86) return { desc: 'Chuva/Trovoada', icon: <CloudRain className="w-10 h-10 text-blue-600 animate-bounce" /> };
    return { desc: 'Nublado', icon: <Cloud className="w-10 h-10 text-gray-500" /> };
  };

  const advice = () => {
    if (!weather) return null;
    
    // Low humidity & no rain warning
    if (weather.humidity < 40) {
      return {
        type: 'warning',
        text: '⚠️ Tempo muito seco e quente! Garanta a irrigação diária dos seus cajueiros enxertados.',
        bg: 'bg-art-cream dark:bg-art-cream/10 border-art-cream-border dark:border-art-cream-border/20 text-art-cream-text dark:text-art-cream-text/90'
      };
    }
    // High humidity warning
    if (weather.humidity > 80) {
      return {
        type: 'danger',
        text: '⚠️ Risco elevado de Antracnose ou Oídio devido à alta umidade (>80%). Verifique suas flores e frutos jovens.',
        bg: 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-800/20 text-red-950 dark:text-red-300'
      };
    }
    
    return {
      type: 'info',
      text: '🌱 Clima ideal para o manejo geral do pomar e aplicação de caldas protetoras agroecológicas.',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-800/20 text-emerald-950 dark:text-emerald-300'
    };
  };

  const weatherInfo = weather ? getWeatherDesc(weather.weatherCode) : null;
  const advisory = advice();

  return (
    <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl shadow-sm border border-art-border p-6" id="weather-widget">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-serif font-bold text-lg text-art-dark flex items-center gap-2">
          🌦️ Previsão Agrícola
        </h3>
        <select 
          value={cidade.nome} 
          onChange={handleCidadeSelect}
          className="text-xs bg-art-bg border border-art-border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-art-green text-art-dark font-semibold cursor-pointer"
        >
          {CIDADES.map(c => (
            <option key={c.nome} value={c.nome}>{c.nome}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 text-art-green animate-spin mb-3" />
          <p className="text-xs text-art-muted font-medium">Consultando satélites Open-Meteo...</p>
        </div>
      ) : error || !weather ? (
        <div className="text-center py-6 text-art-muted space-y-2">
          <p className="text-sm font-medium">Erro ao conectar com a previsão do tempo.</p>
          <button 
            onClick={() => fetchWeather(cidade.lat, cidade.lon)}
            className="text-xs text-art-green hover:underline font-bold cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {weatherInfo?.icon}
              <div>
                <span className="text-3xl font-bold font-serif text-art-dark">{weather.temp}°C</span>
                <p className="text-xs text-art-muted font-bold mt-0.5">{weatherInfo?.desc}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-art-muted font-medium">
              <div className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-art-muted" />
                <span>Mín: <strong className="text-art-dark font-bold">{weather.minTemp}°C</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-art-orange animate-pulse" />
                <span>Máx: <strong className="text-art-dark font-bold">{weather.maxTemp}°C</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>Umidade: <strong className="text-art-dark font-bold">{weather.humidity}%</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
                <span>Chuva: <strong className="text-art-dark font-bold">{weather.precipitation} mm</strong></span>
              </div>
            </div>
          </div>

          {advisory && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-medium ${advisory.bg}`}>
              {advisory.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
