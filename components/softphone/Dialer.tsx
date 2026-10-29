'use client';
import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Delete, Wifi, WifiOff } from 'lucide-react';
import { useTwilioDevice } from '@/hooks/useTwilioDevice';

const DIALPAD = [
  { key: '1', sub: '' }, { key: '2', sub: 'ABC' }, { key: '3', sub: 'DEF' },
  { key: '4', sub: 'GHI' }, { key: '5', sub: 'JKL' }, { key: '6', sub: 'MNO' },
  { key: '7', sub: 'PQRS' }, { key: '8', sub: 'TUV' }, { key: '9', sub: 'WXYZ' },
  { key: '*', sub: '' }, { key: '0', sub: '+' }, { key: '#', sub: '' },
];

const STATUS_LABELS: Record<string, string> = {
  idle: 'Listo',
  connecting: 'Conectando...',
  ringing: 'Llamada entrante',
  'in-call': 'En llamada',
  error: 'Error de conexión',
};

const STATUS_COLORS: Record<string, string> = {
  idle: 'text-zinc-400',
  connecting: 'text-blue-500',
  ringing: 'text-yellow-500 animate-pulse',
  'in-call': 'text-green-500',
  error: 'text-red-500',
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function Dialer() {
  const [number, setNumber] = useState('');
  const [callTimer, setCallTimer] = useState(0);
  const {
    callStatus,
    networkQuality,
    isMuted,
    isInitialized,
    error,
    makeCall,
    answerCall,
    hangup,
    toggleMute,
  } = useTwilioDevice();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const paramCall = new URLSearchParams(window.location.search).get('call');
      if (paramCall) {
        setNumber(decodeURIComponent(paramCall));
      }
    }
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (callStatus === 'in-call') {
      setCallTimer(0);
      interval = setInterval(() => setCallTimer((t) => t + 1), 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleKey = (key: string) => {
    if (callStatus === 'idle') setNumber((p) => p + key);
  };

  const handleCall = () => {
    if (callStatus === 'idle' && number) makeCall(number);
    else if (callStatus === 'ringing') answerCall();
    else if (callStatus === 'in-call' || callStatus === 'connecting') hangup();
  };

  const isInProgress = callStatus === 'in-call' || callStatus === 'connecting';

  return (
    <div className="flex flex-col gap-4 p-5 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-100 dark:border-zinc-800 w-full">
      {/* Header con calidad de red */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Softphone</h2>
        <div className="flex items-center gap-1.5">
          {networkQuality >= 3 ? (
            <Wifi size={14} className="text-green-500" />
          ) : (
            <WifiOff size={14} className="text-red-500" />
          )}
          <div className="flex gap-0.5 items-end">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className={cn(
                  'w-1 rounded-sm transition-colors',
                  bar <= networkQuality ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'
                )}
                style={{ height: `${bar * 3 + 4}px` }}
              />
            ))}
          </div>
          <span className="text-xs text-zinc-400">
            {isInitialized ? 'Conectado' : 'Iniciando...'}
          </span>
        </div>
      </div>

      {/* Display */}
      <div className="relative">
        <div className="w-full text-center text-2xl font-mono bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-3 min-h-[3.5rem] flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
          {callStatus === 'in-call' ? (
            <span className="text-green-500 font-bold">{formatTime(callTimer)}</span>
          ) : number ? (
            <span className="text-zinc-900 dark:text-white tracking-widest">{number}</span>
          ) : (
            <span className="text-zinc-300 dark:text-zinc-600 text-base">Ingresa un número</span>
          )}
        </div>
        {number && callStatus === 'idle' && (
          <button
            onClick={() => setNumber((p) => p.slice(0, -1))}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400"
          >
            <Delete size={16} />
          </button>
        )}
      </div>

      {/* Estado */}
      <div className={`text-center text-sm font-medium ${STATUS_COLORS[callStatus]}`}>
        {error || STATUS_LABELS[callStatus]}
      </div>

      {/* Teclado */}
      <div className="grid grid-cols-3 gap-2">
        {DIALPAD.map(({ key, sub }) => (
          <button
            key={key}
            onClick={() => handleKey(key)}
            disabled={isInProgress}
            className="h-14 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">{key}</span>
            {sub && <span className="text-[9px] text-zinc-400 leading-none">{sub}</span>}
          </button>
        ))}
      </div>

      {/* Controles */}
      <div className="flex gap-3 items-center">
        {callStatus === 'in-call' && (
          <button
            onClick={toggleMute}
            className={cn(
              'p-3 rounded-full transition-colors',
              isMuted
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
            )}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        )}

        <button
          onClick={handleCall}
          disabled={callStatus === 'idle' && !number}
          className={cn(
            'flex-1 h-14 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95',
            isInProgress
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : callStatus === 'ringing'
              ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse'
              : 'bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          {isInProgress ? (
            <><PhoneOff size={20} /> Colgar</>
          ) : callStatus === 'ringing' ? (
            <><Phone size={20} /> Contestar</>
          ) : (
            <><Phone size={20} /> Llamar</>
          )}
        </button>
      </div>
    </div>
  );
}
