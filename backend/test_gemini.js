const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function test() {
    try {
        console.log("Using key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
        const chat = model.startChat({});
        const result = await chat.sendMessage("hello");
        const responseText = result.response.text();
        console.log("Success:", true);
        console.log("Response:", responseText);
    } catch (err) {
        console.error("Error calling Gemini API:", err);
    }
}
test();
