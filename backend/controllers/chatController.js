const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ensure they use a valid API key, or provide a mock response if none is found.
const chatWithPsychiatrist = async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(200).json({
                response: "I'm DermaSupport, your AI Therapist. I'm currently in 'mock mode' because my creator hasn't added a `GEMINI_API_KEY` to the `.env` file yet! Once that's added, I can actively help you through any anxiety or fears you are experiencing regarding your skin condition."
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use gemini-2.5-flash as default, it's fast and highly capable
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: "You are DermaSupport, an empathetic, supportive, and professional AI Therapist. Your purpose is to help people struggling with fear, trauma, or anxiety related to their skin diseases (like acne, eczema, psoriasis, hair loss, etc.). You must be incredibly compassionate, reassuring, and validating. Guide them through their emotional distress with supportive therapeutic techniques. Do not give direct medical skin treatment advice; focus entirely on their psychological well-being, self-esteem, and mental health. Always be conversational, warm, and relatively concise (don't write huge essays unless needed).",
        });

        // Gemini API strictly requires history to start with a 'user' role, and strictly alternate.
        // It cannot handle back-to-back AI messages which happen on frontend network errors.
        const cleanHistory = [];
        let nextExpectedRole = 'user';
        
        (history || []).forEach(msg => {
            const mappedRole = msg.role === 'ai' ? 'model' : 'user';
            // Only push if it matches the expected strictly alternating pattern and is not empty
            if (mappedRole === nextExpectedRole && msg.text) {
                cleanHistory.push({
                    role: mappedRole,
                    parts: [{ text: msg.text }]
                });
                nextExpectedRole = nextExpectedRole === 'user' ? 'model' : 'user';
            }
        });

        // Ensure history always starts with user, just in case
        while (cleanHistory.length > 0 && cleanHistory[0].role !== 'user') {
            cleanHistory.shift();
        }

        const chat = model.startChat({
            history: cleanHistory,
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.status(200).json({ response: responseText });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to generate response. Check your API key or connection.' });
    }
};

module.exports = {
    chatWithPsychiatrist
};
