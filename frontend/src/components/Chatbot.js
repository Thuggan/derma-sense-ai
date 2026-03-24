import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaTimes, FaUser, FaRobot, FaArrowUp } from 'react-icons/fa';
import '../styles/Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await axios.post(`${baseUrl}/chat`, {
                message: userMessage.text,
                history: messages // pass previous conversation history
            });

            if (response.data && response.data.response) {
                setMessages(prev => [...prev, { role: 'ai', text: response.data.response }]);
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
                        <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
                            <FaTimes />
                        </button>
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
                        <input
                            type="text"
                            placeholder="Share how you're feeling..."
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
