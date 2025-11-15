import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { feedbackSchema } from '@/lib/validation/feedback';

export const runtime = 'nodejs';

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

interface FeedbackEntry {
  id: string;
  name?: string;
  email?: string;
  message: string;
  ip: string;
  submittedAt: number;
}

const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;
const rateLimitStore = new Map<string, RateLimitEntry>();
const recentFeedback: FeedbackEntry[] = [];
const MAX_ENTRIES = 50;

function successResponse(): NextResponse {
  return NextResponse.json({ success: true });
}

function getClientIp(request: NextRequest): string {
  const header = request.headers.get('x-forwarded-for');
  if (header) {
    const [ip] = header.split(',').map((part) => part.trim());
    if (ip) {
      return ip;
    }
  }

  return request.ip ?? 'unknown';
}

function applyRateLimit(ip: string): NextResponse | null {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.firstRequest > WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, firstRequest: now });
    return null;
  }

  if (entry.count >= RATE_LIMIT) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  entry.count += 1;
  return null;
}

function rememberFeedback(entry: FeedbackEntry) {
  recentFeedback.push(entry);
  if (recentFeedback.length > MAX_ENTRIES) {
    recentFeedback.shift();
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);
  const rateLimitResponse = applyRateLimit(ip);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const parseResult = feedbackSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: 'Validation failed.',
        details: parseResult.error.flatten(),
      },
      { status: 422 },
    );
  }

  const data = parseResult.data;
  if (data.website.length > 0) {
    return successResponse();
  }

  const entry: FeedbackEntry = {
    id: randomUUID(),
    name: data.name,
    email: data.email,
    message: data.message,
    ip,
    submittedAt: Date.now(),
  };

  rememberFeedback(entry);
  console.info('Feedback received', {
    id: entry.id,
    name: entry.name,
    email: entry.email,
    ip,
    submittedAt: new Date(entry.submittedAt).toISOString(),
  });

  return successResponse();
}
