import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: "Nenhuma mensagem fornecida." });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY não configurada." });

  const ai = new GoogleGenAI({ apiKey });

  const contents = [];
  if (Array.isArray(history)) {
    history.forEach(h => {
      contents.push({ role: h.sender === "user" ? "user" : "model", parts: [{ text: h.text }] });
    });
    while (contents.length > 0 && contents[0].role === "model") contents.shift();
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents,
      config: {
        systemInstruction: `Você é Cajuína, assistente especialista em cajucultura do CajuTech. Ajude produtores, alunos e professores com dúvidas sobre cultivo do cajueiro no Nordeste do Brasil. Use linguagem simples e acolhedora.`,
        temperature: 0.7
      }
    });
    return res.json({ text: response.text || "" });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Erro no chat." });
  }
}
