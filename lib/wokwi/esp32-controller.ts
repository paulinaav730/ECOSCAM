/**
 * Módulo de preparación e interfaz de hardware para integración con ESP32 / Wokwi
 * Permite que en el futuro un circuito ESP32 (simulado en Wokwi vía puente WebSocket/WebSerial
 * o físico) controle el personaje de ECO WORLD mediante:
 * - Potenciómetro (movimiento continuo o direccional del personaje)
 * - Botón 1 (Recoger residuo / Confirmar entrega en contenedor / Iniciar misión)
 * - Botón 2 (Alternar acción secundaria / Pausar / Soltar)
 * Y reciba el estado en vivo del juego (puntuación, tiempo, recuperación del ecosistema).
 *
 * NOTA: Este módulo NO simula una conexión falsa. Permanece en estado 'disconnected'
 * hasta que un puente real (WebSocket o Web Serial o evento externo de Wokwi) se conecte.
 */

export interface WokwiESP32InputPacket {
  /** Valor crudo del ADC del ESP32 (0 a 4095) o normalizado (-1 a 1) */
  potentiometerValue?: number;
  /** Eje normalizado (-1.0 izquierda/arriba a +1.0 derecha/abajo) */
  axisX?: number;
  axisY?: number;
  /** Botón 1: Acción principal (Recoger / Clasificar / Confirmar) */
  buttonPrimaryPressed?: boolean;
  /** Botón 2: Acción secundaria (Pausar / Cambiar modo / Acción extra) */
  buttonSecondaryPressed?: boolean;
}

export interface WokwiESP32GameStateTelemetry {
  ecosystemId: string;
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  timeRemainingSeconds: number;
  recoveryPercentage: number;
  holdingWasteCategory: string | null;
  lastClassificationResult: 'correct' | 'mistake' | null;
}

export type WokwiInputListener = (packet: WokwiESP32InputPacket) => void;

export class WokwiESP32ControllerBridge {
  private listeners: Set<WokwiInputListener> = new Set();
  private ws: WebSocket | null = null;
  public connectionStatus: 'disconnected' | 'connecting' | 'connected' =
    'disconnected';

  constructor() {
    if (typeof window !== 'undefined') {
      // Escucha eventos DOM estándar por si una extensión o iframe de Wokwi inyecta paquetes
      window.addEventListener('ecoworld:wokwi-input', ((
        e: CustomEvent<WokwiESP32InputPacket>
      ) => {
        if (e.detail) {
          this.emitInput(e.detail);
        }
      }) as EventListener);
    }
  }

  /**
   * Convierte la lectura de un potenciómetro de ESP32 (ADC 12-bit: 0..4095)
   * a un eje normalizado entre -1.0 y +1.0 con zona muerta central.
   */
  public static normalizePotentiometerADC(
    adcValue: number,
    deadzone = 0.08
  ): number {
    const clamped = Math.max(0, Math.min(4095, adcValue));
    const normalized = (clamped / 4095) * 2 - 1;
    if (Math.abs(normalized) < deadzone) return 0;
    return Number(normalized.toFixed(3));
  }

  public onInput(listener: WokwiInputListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public emitInput(packet: WokwiESP32InputPacket): void {
    let resolvedAxisX = packet.axisX;
    if (
      typeof resolvedAxisX !== 'number' &&
      typeof packet.potentiometerValue === 'number'
    ) {
      resolvedAxisX = WokwiESP32ControllerBridge.normalizePotentiometerADC(
        packet.potentiometerValue
      );
    }

    const normalizedPacket: WokwiESP32InputPacket = {
      ...packet,
      axisX: resolvedAxisX,
    };

    this.listeners.forEach((listener) => listener(normalizedPacket));
  }

  /**
   * Permite conectar a un puente WebSocket de Wokwi / ESP32 cuando esté activo.
   */
  public connectWebSocketBridge(wsUrl: string): void {
    if (typeof window === 'undefined') return;
    this.disconnect();
    this.connectionStatus = 'connecting';

    try {
      const socket = new WebSocket(wsUrl);
      this.ws = socket;

      socket.onopen = () => {
        this.connectionStatus = 'connected';
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WokwiESP32InputPacket;
          this.emitInput(data);
        } catch {
          // Ignorar tramas malformadas
        }
      };

      socket.onclose = () => {
        this.connectionStatus = 'disconnected';
        this.ws = null;
      };

      socket.onerror = () => {
        this.connectionStatus = 'disconnected';
      };
    } catch {
      this.connectionStatus = 'disconnected';
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionStatus = 'disconnected';
  }

  /**
   * Envía el estado del juego de vuelta al ESP32 (ej. para encender LEDs o pantalla OLED en Wokwi).
   */
  public sendTelemetryToDevice(telemetry: WokwiESP32GameStateTelemetry): void {
    if (this.ws && this.connectionStatus === 'connected') {
      try {
        this.ws.send(JSON.stringify({ type: 'TELEMETRY', payload: telemetry }));
      } catch {
        // Ignorar errores de envío si el socket se cerró
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ecoworld:telemetry', { detail: telemetry })
      );
    }
  }
}

export const wokwiBridge = new WokwiESP32ControllerBridge();
