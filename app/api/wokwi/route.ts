import { NextRequest, NextResponse } from 'next/server';

interface WokwiRoomState {
  potentiometerValue: number;
  axisMode: 'horizontal' | 'vertical';
  buttonPrimaryPressed: boolean;
  buttonSecondaryPressed: boolean;
  seq: number;
  updatedAt: number;
  telemetry: {
    ecosystemId: string;
    isPlaying: boolean;
    score: number;
    timeRemainingSeconds: number;
    recoveryPercentage: number;
    holdingWasteCategory: string | null;
    lastClassificationResult: 'correct' | 'mistake' | null;
  };
}

const rooms = new Map<string, WokwiRoomState>();

function getOrCreateRoom(roomCode: string): WokwiRoomState {
  const key = (roomCode || 'ECOSCAM').trim().toUpperCase();
  let room = rooms.get(key);
  if (!room) {
    room = {
      potentiometerValue: 2048,
      axisMode: 'horizontal',
      buttonPrimaryPressed: false,
      buttonSecondaryPressed: false,
      seq: 0,
      updatedAt: 0,
      telemetry: {
        ecosystemId: 'parque_olvidado',
        isPlaying: false,
        score: 0,
        timeRemainingSeconds: 90,
        recoveryPercentage: 0,
        holdingWasteCategory: null,
        lastClassificationResult: null,
      },
    };
    rooms.set(key, room);
  }
  return room;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomCode = searchParams.get('room') || 'ECOSCAM';
  const room = getOrCreateRoom(roomCode);
  const isActive = Date.now() - room.updatedAt < 15000;

  return NextResponse.json(
    {
      connected: isActive,
      room: roomCode.toUpperCase(),
      potentiometerValue: room.potentiometerValue,
      axisMode: room.axisMode,
      buttonPrimaryPressed: room.buttonPrimaryPressed,
      buttonSecondaryPressed: room.buttonSecondaryPressed,
      seq: room.seq,
      updatedAt: room.updatedAt,
      telemetry: room.telemetry,
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const roomCode = (body.room || 'ECOSCAM').toString().toUpperCase();
    const room = getOrCreateRoom(roomCode);

    // Si el mensaje viene del navegador enviando telemetría hacia el ESP32
    if (body.source === 'game_telemetry' && body.telemetry) {
      room.telemetry = {
        ...room.telemetry,
        ...body.telemetry,
      };
      return NextResponse.json(
        { ok: true, telemetry: room.telemetry },
        { headers: CORS_HEADERS }
      );
    }

    // Si el mensaje viene del ESP32 en Wokwi enviando lecturas de potenciómetro y botones
    if (typeof body.potentiometerValue === 'number') {
      room.potentiometerValue = Math.max(
        0,
        Math.min(4095, Math.round(body.potentiometerValue))
      );
    }
    if (body.axisMode === 'horizontal' || body.axisMode === 'vertical') {
      room.axisMode = body.axisMode;
    }
    if (typeof body.buttonPrimaryPressed === 'boolean') {
      room.buttonPrimaryPressed = body.buttonPrimaryPressed;
    }
    if (typeof body.buttonSecondaryPressed === 'boolean') {
      room.buttonSecondaryPressed = body.buttonSecondaryPressed;
    }

    room.seq += 1;
    room.updatedAt = Date.now();

    return NextResponse.json(
      {
        ok: true,
        seq: room.seq,
        telemetry: room.telemetry,
      },
      { headers: CORS_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Formato JSON inválido' },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
