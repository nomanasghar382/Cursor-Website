"use client";

import { Mic, MicOff, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { aiApi } from "@/lib/api/ai";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

type SpeechRecognitionResult = { 0: { transcript: string }; isFinal: boolean };
type SpeechRecognitionEvent = { results: ArrayLike<SpeechRecognitionResult> };
type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
};

type AiVoiceSearchButtonProps = {
  onTranscript: (transcript: string) => void;
};

export function AiVoiceSearchButton({ onTranscript }: AiVoiceSearchButtonProps) {
  const token = useAuthStore((state) => state.accessToken);
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    setSupported(Boolean(Recognition));
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = async (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (!transcript) return;
      setProcessing(true);
      try {
        const response = await aiApi.voiceSearch({ transcript, language: "en-US", confidence: 0.9 }, token);
        onTranscript(response.transcript);
        toast.success("Voice search processed");
      } catch {
        onTranscript(transcript);
        toast.error("Voice search fallback used transcript only");
      } finally {
        setProcessing(false);
      }
    };
    recognition.onerror = () => {
      setListening(false);
      toast.error("Voice capture failed");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, [onTranscript, token]);

  if (!supported) {
    return (
      <Button type="button" variant="outline" size="icon" disabled aria-label="Voice search unavailable">
        <MicOff />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={listening ? "default" : "outline"}
      size="icon"
      aria-label={listening ? "Stop voice search" : "Start voice search"}
      disabled={processing}
      onClick={() => {
        const recognition = recognitionRef.current;
        if (!recognition) return;
        if (listening) {
          recognition.stop();
          setListening(false);
          return;
        }
        setListening(true);
        recognition.start();
      }}
    >
      {processing ? <Loader2 className="animate-spin" /> : listening ? <Mic className="animate-pulse" /> : <Mic />}
    </Button>
  );
}
