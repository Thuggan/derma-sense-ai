const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const History = require('../models/History');

// Ensure they use a valid API key, or provide a mock response if none is found.
const chatWithPsychiatrist = async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(200).json({
                response: "I'm DermaSupport, your AI Therapist. I'm currently in 'mock mode' because my creator hasn't added a `GEMINI_API_KEY` to the `.env` file yet! Once that's added, I can actively help you through any anxiety or fears you are experiencing regarding your skin condition."
            });
        }

        // --- Privacy Preserving Therapy Logic ---
        // As a strict medical data privacy rule (HIPAA/GDPR compliance), 
        // we DO NOT send the patient's database diagnostic records to the third-party LLM.
        // The AI remains zero-knowledge about the user's specific medical history unless the user 
        // explicitly chooses to disclose it in the chat themselves.
        
        const systemInstruction = "You are DermaSupport, an empathetic, supportive, and professional AI Therapist. Your purpose is to help people struggling with fear, trauma, or anxiety related to their skin diseases. You must be compassionate and validating. Guide them through emotional distress with CBT therapeutic techniques. Do not give direct medical skin treatment advice; focus entirely on psychology. Always be conversational, warm, and concise.\n\nCRITICAL SAFETY INSTRUCTION: If the user indicates severe distress, references suicide, self-harm, or extreme depression, you MUST append the exact word [EMERGENCY] at the very end of your response to trigger safety protocols in the app.";
        // ------------------------------------

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use gemini-1.5-flash due to extremely high demand/503 errors on the 2.x endpoints right now
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction,
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
        
        // Handle Gemini 503 Service Unavailable / High demand errors gracefully
        if (error.status === 503 || (error.message && error.message.includes('503'))) {
            return res.status(200).json({ 
                response: "I'm currently assisting many patients and experiencing high demand. Please give me a moment and try again!" 
            });
        }

        // Handle 429 Quota Exceeded / Too many requests errors gracefully
        if (error.status === 429 || (error.message && error.message.includes('429'))) {
            return res.status(200).json({ 
                response: "My processing systems have reached their free usage limits for today. Please update the API key in the backend `.env` file with a fresh one from Google AI Studio, or try again later." 
            });
        }
        
        res.status(500).json({ error: 'Failed to generate response. Check your API key or connection.', details: error.message });
    }
};

module.exports = {
    chatWithPsychiatrist
};
