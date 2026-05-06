require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModels() {
    const modelsToTest = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-3.1-flash-preview'];
    
    for (const modelName of modelsToTest) {
        console.log(`Testing ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('hello');
            console.log(`[SUCCESS] ${modelName}:`, result.response.text());
        } catch (e) {
            console.log(`[FAILED] ${modelName}:`, e.message);
        }
    }
}
testModels();
