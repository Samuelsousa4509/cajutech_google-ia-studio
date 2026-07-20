import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: "Nenhuma imagem fornecida." });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY não configurada." });

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        { inlineData: { mimeType: "image/jpeg", data: base64Data } },
        "Você é especialista em cajueiro no Piauí. Analise a imagem e retorne JSON com os campos: praga (string), saudavel (boolean), gravidade (nenhuma/leve/moderada/grave), descricao (string), recomendacoes (array de strings), prevencao (array de strings)."
      ],
      config: { responseMimeType: "application/json" }
    });

    const text = response.text?.replace(/```json|```/g, "").trim();
    return res.json(JSON.parse(text));
  } catch (e) {
    return res.status(500).json({ error: e.message || "Erro ao chamar a IA." });
  }
}
