import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

/**
 * Helper function to call the Gemini API with retry logic and fallback models
 * in case of high demand (503) or rate limits (429).
 */
async function generateWithRetryAndFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  },
  preferredModels: string[] = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"]
) {
  let lastError: any = null;

  for (const modelName of preferredModels) {
    // Try up to 2 times for each model (immediate + 1 retry with backoff)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini] Tentando modelo "${modelName}" (Tentativa ${attempt}/2)...`);
        const response = await ai.models.generateContent({
          ...params,
          model: modelName,
        });
        console.log(`[Gemini] Sucesso com o modelo "${modelName}" na tentativa ${attempt}.`);
        return response;
      } catch (error: any) {
        lastError = error;
        
        // Extract error details safely
        const errorMessage = error.message || "";
        const errorCode = error.status || (error.error && error.error.code);
        
        console.error(`[Gemini Error] Falha com o modelo "${modelName}" na tentativa ${attempt}:`, errorMessage);
        
        // Check if the error is due to high demand, rate limits, or service unavailability (503, 429)
        const isTransient = 
          errorCode === 503 || 
          errorCode === 429 || 
          errorMessage.includes("503") || 
          errorMessage.includes("429") || 
          errorMessage.includes("UNAVAILABLE") || 
          errorMessage.includes("high demand") ||
          errorMessage.includes("temporary");
          
        if (!isTransient) {
          // If it's a structural error (e.g. invalid parameter, bad request), don't retry, fail immediately or try next model
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < 2) {
          const delay = attempt * 1000;
          console.log(`[Gemini] Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    console.warn(`[Gemini] Modelo "${modelName}" indisponível. Tentando próximo modelo da lista...`);
  }

  // If we reach here, all models failed
  throw lastError || new Error("Não foi possível obter resposta de nenhum modelo Gemini disponível.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware with high size limit for base64 image uploads
  app.use(express.json({ limit: "15mb" }));

  // API Route for Gemini diagnosis
  app.post("/api/diagnose", async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Nenhuma imagem foi fornecida." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Configuração do GEMINI_API_KEY está ausente no servidor." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Você é um especialista em fitossanidade do cajueiro (Anacardium occidentale) no Piauí, Nordeste do Brasil.
Analise esta imagem de folha, galho, fruto ou flor de cajueiro e identifique possíveis pragas (como broca-das-pontas, mosca-da-fruta, ácaro-do-bronzeamento, pulgão), doenças (como antracnose, mofo-preto, oídio, resinose) ou deficiências nutricionais.
Responda obrigatoriamente em formato JSON válido contendo exatamente as seguintes chaves (não coloque blocos markdown de código como \`\`\`json, apenas o objeto puro):
{
  "praga": "Nome da praga/doença identificada (ex: Antracnose, Broca-das-pontas, Ácaro-do-bronzeamento, ou Planta Saudável)",
  "saudavel": boolean,
  "gravidade": "nenhuma" | "leve" | "moderada" | "grave",
  "descricao": "Uma descrição simples, curta (2-3 frases) e de fácil compreensão da praga/doença identificada, voltada para agricultores familiares piauienses.",
  "recomendacoes": ["Recomendação 1 (preferir métodos agroecológicos, orgânicos e acessíveis de controle)", "Recomendação 2", "Recomendação 3"],
  "prevencao": ["Dica de prevenção 1", "Dica de prevenção 2"]
}`;

      // Remove prefix if present in base64 string
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const response = await generateWithRetryAndFallback(
        ai,
        {
          contents: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            },
            prompt
          ],
          config: {
            responseMimeType: "application/json",
          }
        },
        ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"]
      );

      const responseText = response.text || "";
      let result;
      try {
        const cleanedText = responseText.replace(/```json|```/g, "").trim();
        result = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Erro ao analisar JSON do Gemini:", responseText);
        result = {
          praga: "Erro na análise",
          saudavel: false,
          gravidade: "moderada",
          descricao: "Não foi possível estruturar os dados. O texto retornado foi: " + responseText.substring(0, 200),
          recomendacoes: ["Tente tirar a foto novamente com foco melhor.", "Garanta boa iluminação."],
          prevencao: []
        };
      }

      return res.json(result);
    } catch (error: any) {
      console.error("Erro no endpoint /api/diagnose:", error);
      return res.status(500).json({ error: error.message || "Erro interno no servidor de diagnóstico." });
    }
  });

  // API Route for Gemini intelligent chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Nenhuma mensagem foi fornecida." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Configuração do GEMINI_API_KEY está ausente no servidor." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const systemInstruction = `Você é o CajuAjudante, o assistente virtual inteligente e especialista em cajucultura do CajuTech.
Seu objetivo é auxiliar produtores rurais, estudantes de agronomia e professores com dúvidas sobre o cultivo do cajueiro (Anacardium occidentale), manejo de pragas (antracnose, broca-das-pontas, tripes, etc.), irrigação, adubação orgânica, colheita e pós-colheita, além de derivados do caju (cajuína, doces, castanha de caju, polpa, etc.).
Seja sempre muito amigável, prestativo, didático, simples e use uma linguagem calorosa e acessível para o agricultor familiar do Nordeste brasileiro (especialmente do Piauí).
Sempre responda de forma estruturada e concisa, usando formatação markdown limpa (como tópicos e negritos) para facilitar a leitura.
Se o assunto não for relacionado ao cultivo do caju, derivados do caju, agronomia geral, agricultura ou sobre o aplicativo CajuTech, gentilmente lembre o usuário de que você é um especialista em cajucultura e prefere responder dúvidas dentro do seu tema de especialidade.`;

      // Format chat history for @google/genai
      const contents: any[] = [];
      
      if (Array.isArray(history)) {
        history.forEach((h: any) => {
          const role = h.sender === "user" ? "user" : "model";
          contents.push({
            role,
            parts: [{ text: h.text }]
          });
        });
      }

      // Add current message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await generateWithRetryAndFallback(
        ai,
        {
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        },
        ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"]
      );

      return res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Erro no endpoint /api/chat:", error);
      return res.status(500).json({ error: error.message || "Erro interno no servidor de chat inteligente." });
    }
  });

  // Serve static assets or use Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
