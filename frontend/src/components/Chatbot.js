import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { FaTimes, FaUser, FaRobot, FaArrowUp, FaMicrophone, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import '../styles/Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                { 
                    role: 'ai', 
                    text: 'Hello! I am DermaSupport, your personal AI Therapist. Dealing with a skin condition can be stressful, frustrating, and even isolating. I am here to provide a safe space to talk, manage anxiety, or just listen. How are you feeling today?' 
                }
            ]);
        }
    }, [messages.length]);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const speakMessage = (text) => {
        if (isMuted || !window.speechSynthesis) return;
        window.speechSynthesis.cancel(); // Stop playing previous message
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to get a soothing female voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoices = [
            'Google UK English Female',
            'Google US English', // Often default female in Chrome
            'Microsoft Zira', // Windows
            'Samantha', // Mac female
            'Victoria' // Mac female
        ];
        
        let selectedVoice = null;
        for (let name of preferredVoices) {
            selectedVoice = voices.find(v => v.name.includes(name));
            if (selectedVoice) break;
        }
        
        // Fallback to any voice with "Female" in the name, or just the first English voice
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.name.includes('Female')) || voices.find(v => v.lang.startsWith('en'));
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        // Lower pitch and slightly slower rate for a more calming, therapeutic effect
        utterance.rate = 0.92; 
        utterance.pitch = 0.9;
        
        window.speechSynthesis.speak(utterance);
    };

    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support voice input.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev ? prev + ' ' + transcript : transcript);
        };
        recognition.onerror = (event) => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        
        recognition.start();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        
        // Add user message to state
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await API.post(`/chat`, {
                message: userMessage.text,
                history: messages // pass previous conversation history
            });

            if (response && response.response) {
                let aiText = response.response;
                let isEmergency = false;
                
                // 1. LLM-based trigger
                if (aiText.includes('[EMERGENCY]')) {
                    isEmergency = true;
                    // remove flag from user view
                    aiText = aiText.replace(/\[EMERGENCY\]/g, '').trim();
                }

                // 2. Fallback rule-based trigger (for absolute safety)
                const lowerInput = userMessage.text.toLowerCase();
                if (lowerInput.includes('suicide') || 
                    lowerInput.includes('die') || 
                    lowerInput.includes('kill myself') || 
                    lowerInput.includes('end it all') ||
                    lowerInput.includes('self harm') ||
                    lowerInput.includes('give up')) {
                    isEmergency = true;
                }

                setMessages(prev => [...prev, { role: 'ai', text: aiText, isEmergency }]);
                speakMessage(aiText);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I'm having trouble connecting to my thoughts right now. Please try again later." }]);
            }
        } catch (error) {
            console.error('Chat API Error:', error);
            setMessages(prev => [...prev, { role: 'ai', text: "I'm currently unable to reach my service network. Make sure your backend API is running and configured correctly." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-wrapper">
            {/* Floating Toggle Button */}
            {!isOpen && (
                <button 
                    className="chatbot-toggle-btn" 
                    onClick={() => setIsOpen(true)}
                    title="Talk to DermaSupport Therapist"
                >
                    <span style={{ display: 'flex', fontSize: '38px', alignItems: 'center', justifyContent: 'center' }}>
                        <FaRobot color="#ffffff" />
                    </span>
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="chatbot-panel">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <span style={{ fontSize: '28px', display: 'flex', color: '#00d2ff' }}>
                                <FaRobot />
                            </span>
                            <div>
                                <h3>DermaSupport AI</h3>
                                <span>Mental Health Assistant</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                className="chatbot-close-btn" 
                                onClick={() => {
                                    setIsMuted(!isMuted);
                                    if(!isMuted) window.speechSynthesis.cancel();
                                }}
                                title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                            >
                                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                            </button>
                            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-bubble-container ${msg.role === 'user' ? 'user-container' : 'ai-container'}`}>
                                <div className={`chat-icon ${msg.role === 'user' ? 'user-icon' : 'ai-icon'}`}>
                                    {msg.role === 'user' ? <FaUser /> : <FaRobot />}
                                </div>
                                <div className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                                    {msg.text}
                                    {msg.isEmergency && (
                                        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#ffeaea', color: '#d32f2f', borderRadius: '5px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #ffcdd2' }}>
                                            ⚠️ We noticed you're in severe distress. Please reach out for professional help immediately.<br/>
                                            <a href="tel:988" style={{color: '#d32f2f', textDecoration: 'underline'}}>Call 988 Suicide & Crisis Lifeline</a><br/>
                                            <a href="https://www.google.com/search?q=emergency+online+psychiatrist+therapy" target="_blank" rel="noopener noreferrer" style={{color: '#d32f2f', textDecoration: 'underline'}}>Find an online professional therapist</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-bubble-container ai-container">
                                <div className="chat-icon ai-icon"><FaRobot /></div>
                                <div className="chat-bubble ai-bubble loading-dots">
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form className="chatbot-input-area" onSubmit={handleSendMessage}>
                        <button 
                            type="button" 
                            onClick={handleVoiceInput} 
                            disabled={isLoading}
                            style={{ 
                                background: 'transparent', border: 'none', color: isListening ? '#f44336' : '#666', 
                                fontSize: '20px', cursor: 'pointer', padding: '0 10px' 
                            }}
                            title="Speak to type"
                        >
                            <FaMicrophone />
                        </button>
                        <input
                            type="text"
                            placeholder={isListening ? "Listening..." : "Share how you're feeling..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !input.trim()}>
                            <span style={{ display: 'flex', fontSize: '20px', alignItems: 'center', justifyContent: 'center' }}>
                                <FaArrowUp color="#ffffff" />
                            </span>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
