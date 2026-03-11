import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { ChannelDTO, UserRole } from '../types/api';
import {
    Send, User, Clock, Hash, Plus, Lock
} from 'lucide-react';

interface Message {
    senderName: string;
    content: string;
    timestamp: string;
    channelId: number;
}

export function Chat() {
    const { channelId } = useParams();
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();

    // State
    const [channels, setChannels] = useState<ChannelDTO[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isCreating, setIsCreating] = useState(false); // For modal
    const [newChannelName, setNewChannelName] = useState('');

    // Refs
    const abortControllerRef = useRef<AbortController | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Load Channel List on Mount
    useEffect(() => {
        loadChannels();
    }, []);

    const loadChannels = async () => {
        try {
            const res = await apiClient.request<ChannelDTO[]>('GET', '/api/chat/channels');
            setChannels(res.data);
            // If no channel selected, default to first one
            if (!channelId && res.data.length > 0) {
                navigate(`/chat/${res.data[0].id}`);
            }
        } catch (err) {
            console.error("Failed to load channels", err);
        }
    };

    // 2. Load History & Connect SSE when Channel ID changes
    useEffect(() => {
        if (!channelId) return;

        // Reset messages for new channel
        setMessages([]);

        // Load history
        apiClient.request<Message[]>('GET', `/api/chat/channels/${channelId}/history`)
            .then(res => {
                setMessages(res.data);
                scrollToBottom();
            });

        // Abort previous SSE connection if exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const connectSSE = async () => {
            try {
                await fetchEventSource(`http://localhost:8080/api/chat/channels/${channelId}/stream`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    signal: abortController.signal,
                    onopen: async (response) => {
                        if (response.ok) {
                            setIsConnected(true);
                        } else {
                            console.error('SSE Connection failed', response.status);
                        }
                    },
                    onmessage: (event) => {
                        if (event.event === 'message') {
                            const receivedMsg: Message = JSON.parse(event.data);
                            if (receivedMsg.channelId === parseInt(channelId)) {
                                setMessages((prev) => [...prev, receivedMsg]);
                                scrollToBottom();
                            }
                        }
                    },
                    onclose: () => {
                        setIsConnected(false);
                    },
                    onerror: (err) => {
                        console.error('SSE Error:', err);
                        setIsConnected(false);
                        throw err; // let fetchEventSource retry
                    }
                });
            } catch (err) {
                // Connection aborted or retry limit reached
            }
        };

        connectSSE();

        return () => {
            abortController.abort();
            setIsConnected(false);
        };
    }, [channelId]);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !channelId) return;

        const payload = {
            content: newMessage,
            senderName: user?.email,
            channelId: parseInt(channelId),
        };

        const currentMessage = newMessage;
        setNewMessage(''); // optimistic clear UI

        try {
            await apiClient.request('POST', `/api/chat/channels/${channelId}/messages`, payload);
        } catch (err) {
            console.error("Failed to send message", err);
            setNewMessage(currentMessage); // revert on error
        }
    };

    const handleCreateChannel = async () => {
        if (!newChannelName.trim()) return;
        try {
            const res = await apiClient.request<ChannelDTO>('POST', '/api/chat/channels', {
                name: newChannelName,
                description: 'Crisis Channel',
                type: 'PUBLIC'
            });
            setChannels([...channels, res.data]);
            setIsCreating(false);
            setNewChannelName('');
            navigate(`/chat/${res.data.id}`);
        } catch (err) {
            alert('Failed to create channel');
        }
    };

    // --- Render Helpers ---
    const activeChannel = channels.find(c => c.id.toString() === channelId);
    const canCreate = hasRole(UserRole.ADMIN) || hasRole(UserRole.EDITOR);

    return (
        <Layout>
            <div className="max-w-6xl mx-auto h-[calc(100vh-10rem)] flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {/* --- LEFT SIDEBAR: CHANNELS --- */}
                <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="font-bold text-gray-700">Channels</h2>
                        {canCreate && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="p-1 hover:bg-gray-200 rounded text-blue-600"
                                title="Create Channel"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {channels.map(channel => (
                            <button
                                key={channel.id}
                                onClick={() => navigate(`/chat/${channel.id}`)}
                                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${channel.id.toString() === channelId
                                        ? 'bg-blue-100 text-blue-800 font-medium'
                                        : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Hash className="w-4 h-4 mr-2 opacity-70" />
                                <span className="truncate">{channel.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- RIGHT AREA: CHAT --- */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <div className="flex items-center space-x-2">
                                <Hash className="w-5 h-5 text-gray-400" />
                                <h2 className="text-lg font-bold text-gray-900">{activeChannel?.name || 'Select a Channel'}</h2>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{activeChannel?.description}</p>
                        </div>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <span>{isConnected ? 'Live Encrypted' : 'Connecting...'}</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                        {messages.map((msg, index) => {
                            const isMe = msg.senderName === user?.email;
                            return (
                                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMe
                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                                        }`}>
                                        <div className={`flex items-center space-x-2 text-xs mb-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                                            <span className="font-bold">{msg.senderName.split('@')[0]}</span>
                                            <span>• {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={`Message #${activeChannel?.name || '...'}`}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                disabled={!channelId}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!channelId || !newMessage.trim()}
                                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- CREATE CHANNEL MODAL --- */}
                {isCreating && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-xl w-96">
                            <h3 className="text-lg font-bold mb-4">Create New Channel</h3>
                            <input
                                className="w-full border p-2 rounded mb-4"
                                placeholder="Channel Name (e.g. Flood Ops)"
                                value={newChannelName}
                                onChange={e => setNewChannelName(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2">
                                <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button onClick={handleCreateChannel} className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
}