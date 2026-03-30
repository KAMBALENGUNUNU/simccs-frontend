import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
    onTranscript: (transcript: string) => void;
    className?: string;
}

export function VoiceInput({ onTranscript, className = "" }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError("Web Speech API is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false; // Using false to ensure we only append full, finalized segments
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event: any) => {
            let segment = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    segment += event.results[i][0].transcript;
                }
            }
            if (segment) {
                onTranscript(segment);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === 'not-allowed') {
                setError("Microphone access denied.");
            } else if (event.error !== 'aborted') {
                setError(`Error: ${event.error}`);
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore errors on cleanup stop
                }
            }
        };
    }, [onTranscript]);

    const toggleListening = useCallback(() => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
        } else {
            setError(null);
            try {
                recognition.start();
            } catch (e) {
                console.error("Failed to start recognition:", e);
                // Sometimes it's already started or in a weird state
                try {
                    recognition.stop();
                    setTimeout(() => recognition.start(), 100);
                } catch (stopErr) {
                    console.error("Failed to recover recognition:", stopErr);
                }
            }
        }
    }, [isListening]);

    if (error && error.includes("not supported")) {
        return (
            <div className="flex items-center space-x-2 text-rose-500 text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-3 h-3" />
                <span>Speech Input Unavailable</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            <button
                type="button"
                onClick={toggleListening}
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-500 shadow-sm hover:shadow-md ${isListening
                        ? 'bg-rose-500 text-white ring-4 ring-rose-500/20 animate-pulse'
                        : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                    }`}
                title={isListening ? "Stop Listening" : "Start Voice Input"}
            >
                {isListening ? (
                    <Mic className="w-5 h-5" />
                ) : (
                    <MicOff className="w-5 h-5 opacity-60" />
                )}

                {isListening && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                )}
            </button>

            {isListening && (
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 dark:text-rose-400 animate-pulse">
                    Listening...
                </span>
            )}

            {error && !error.includes("not supported") && (
                <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {error}
                </span>
            )}
        </div>
    );
}
