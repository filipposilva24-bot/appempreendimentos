export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { empreendimento } = req.body;
    if (!empreendimento) {
        return res.status(400).json({ error: 'Empreendimento não informado' });
    }

    const token = process.env.GEMINI_API_KEY;
    if (!token) {
        return res.status(500).json({ error: 'Token do Gemini não configurado nas variáveis do Vercel' });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
        
        let headers = { "Content-Type": "application/json" };
        if (token.startsWith('AQ.')) {
            headers["Authorization"] = `Bearer ${token}`;
        } else {
            // Caso decida usar chave clássica com ?key= no futuro
            // url += `?key=${token}`;
        }

        const prompt = `Gere uma ficha técnica imobiliária curta e profissional para o empreendimento: ${empreendimento}. Inclua local provável, tipologia de dormitórios e itens de lazer em formato HTML limpo utilizando apenas tags <strong>, <em>, 📍 e 🏊‍♂️. Seja direto.`;

        const respostaApi = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const dados = await respostaApi.json();
        
        if (dados.candidates && dados.candidates[0]) {
            let textoGerado = dados.candidates[0].content.parts[0].text;
            textoGerado = textoGerado.replace(/```html/g, '').replace(/```/g, '').trim();
            return res.status(200).json({ resultado: textoGerado });
        } else {
            return res.status(500).json({ error: 'Erro ao gerar conteúdo pela IA', detalhes: dados });
        }

    } catch (erro) {
        console.error("Erro interno:", erro);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}
