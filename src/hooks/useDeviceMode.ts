import { useEffect, useState } from 'react';

export interface DeviceMode {
  /** Dispositivo com entrada por toque (sem mouse preciso). */
  isTouch: boolean;
  /** Tela em retrato (altura maior que largura). */
  isPortrait: boolean;
}

function read(): DeviceMode {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return { isTouch: false, isPortrait: false };
  }
  return {
    isTouch: window.matchMedia('(pointer: coarse)').matches,
    isPortrait: window.matchMedia('(orientation: portrait)').matches,
  };
}

/**
 * Observa o tipo de ponteiro (toque x mouse) e a orientação da tela.
 * Usado para adaptar a fase ao celular: controles de toque e pedido de
 * rotação para paisagem.
 */
export function useDeviceMode(): DeviceMode {
  const [mode, setMode] = useState<DeviceMode>(read);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const pointer = window.matchMedia('(pointer: coarse)');
    const orientation = window.matchMedia('(orientation: portrait)');
    const update = () => setMode(read());
    pointer.addEventListener('change', update);
    orientation.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      pointer.removeEventListener('change', update);
      orientation.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return mode;
}
