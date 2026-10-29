'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Call as TwilioCall } from '@twilio/voice-sdk';

export type CallStatus = 'idle' | 'connecting' | 'ringing' | 'in-call' | 'error';

export function useTwilioDevice() {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [networkQuality, setNetworkQuality] = useState<number>(5);
  const [isMuted, setIsMuted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deviceRef = useRef<any>(null);
  const activeCallRef = useRef<TwilioCall | null>(null);

  // Inicializar Twilio Device con token
  const initializeDevice = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      setError(null);
      const res = await fetch('/api/twilio/token');
      if (!res.ok) {
        throw new Error('No se pudo obtener el token de voz');
      }

      const { token } = await res.json();
      if (!token) throw new Error('Token vacío');

      // Import dinámico para evitar errores de SSR con WebRTC
      const { Device, Call } = await import('@twilio/voice-sdk');

      if (deviceRef.current) {
        deviceRef.current.destroy();
      }

      const device = new Device(token, {
        codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
        maxAverageBitrate: 16000, // Opus a 16kbps: optimización de datos móviles
        enableIceRestart: true,
      });

      device.on('registered', () => {
        setIsInitialized(true);
      });

      device.on('error', (twilioError: { message?: string }) => {
        console.error('Error en Twilio Device:', twilioError);
        setError(twilioError.message || 'Error en dispositivo de voz');
        setCallStatus('error');
      });

      device.on('incoming', (call: TwilioCall) => {
        activeCallRef.current = call;
        setCallStatus('ringing');

        call.on('disconnect', () => {
          activeCallRef.current = null;
          setCallStatus('idle');
          setIsMuted(false);
        });

        call.on('cancel', () => {
          activeCallRef.current = null;
          setCallStatus('idle');
          setIsMuted(false);
        });
      });

      await device.register();
      deviceRef.current = device;
      setIsInitialized(true);
    } catch (err: unknown) {
      console.error('Error inicializando dispositivo Twilio:', err);
      const msg = err instanceof Error ? err.message : 'Error al conectar softphone';
      setError(msg);
      setIsInitialized(false);
    }
  }, []);

  useEffect(() => {
    initializeDevice();

    return () => {
      if (activeCallRef.current) {
        activeCallRef.current.disconnect();
      }
      if (deviceRef.current) {
        deviceRef.current.destroy();
      }
    };
  }, [initializeDevice]);

  // Realizar llamada saliente
  const makeCall = async (phoneNumber: string) => {
    if (!deviceRef.current || !isInitialized) {
      setError('El teléfono aún no está conectado a la red');
      return;
    }

    try {
      setCallStatus('connecting');
      setError(null);

      const call = await deviceRef.current.connect({
        params: { To: phoneNumber },
      });

      activeCallRef.current = call;

      call.on('accept', () => {
        setCallStatus('in-call');
      });

      call.on('disconnect', () => {
        activeCallRef.current = null;
        setCallStatus('idle');
        setIsMuted(false);
        setNetworkQuality(5);
      });

      call.on('error', (err: { message?: string }) => {
        console.error('Error en llamada activa:', err);
        setError(err.message || 'Error en la llamada');
        setCallStatus('error');
      });

      // Métrica de calidad de red VoIP en tiempo real
      call.on('sample', (sample: { rtt?: number; jitter?: number; packetsLostFraction?: number }) => {
        let quality = 5;
        if ((sample.rtt && sample.rtt > 300) || (sample.packetsLostFraction && sample.packetsLostFraction > 0.05)) {
          quality = 3;
        }
        if ((sample.rtt && sample.rtt > 600) || (sample.packetsLostFraction && sample.packetsLostFraction > 0.15)) {
          quality = 1;
        }
        setNetworkQuality(quality);
      });
    } catch (err: unknown) {
      console.error('Fallo al iniciar llamada:', err);
      const msg = err instanceof Error ? err.message : 'Fallo al conectar llamada';
      setError(msg);
      setCallStatus('error');
    }
  };

  // Contestar llamada entrante
  const answerCall = () => {
    if (activeCallRef.current && callStatus === 'ringing') {
      activeCallRef.current.accept();
      setCallStatus('in-call');
    }
  };

  // Colgar llamada
  const hangup = () => {
    if (activeCallRef.current) {
      activeCallRef.current.disconnect();
    } else if (deviceRef.current) {
      deviceRef.current.disconnectAll();
    }
    activeCallRef.current = null;
    setCallStatus('idle');
    setIsMuted(false);
  };

  // Silenciar / Activar micrófono
  const toggleMute = () => {
    if (activeCallRef.current) {
      const nextMute = !isMuted;
      activeCallRef.current.mute(nextMute);
      setIsMuted(nextMute);
    }
  };

  return {
    callStatus,
    networkQuality,
    isMuted,
    isInitialized,
    error,
    makeCall,
    answerCall,
    hangup,
    toggleMute,
    refreshDevice: initializeDevice,
  };
}
