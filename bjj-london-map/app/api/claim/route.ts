import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { claimSchema } from '@/lib/validation/claim';

export const runtime = 'nodejs';

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
const rateLimitStore = new Map<string, RateLimitEntry>();

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

  if (
    typeof body === 'object' &&
    body !== null &&
    'company' in body &&
    typeof (body as { company?: unknown }).company === 'string' &&
    (body as { company: string }).company.trim().length > 0
  ) {
    return successResponse();
  }

  const parseResult = claimSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: 'Validation failed.',
        details: parseResult.error.flatten(),
      },
      { status: 422 },
    );
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Missing DATABASE_URL environment variable.');
    return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
  }

  try {
    const sql = neon(connectionString);
    const { gymId, name, email, proof, message } = parseResult.data;

    await sql`
      INSERT INTO gym_claims (gym_id, claimant_name, claimant_email, proof_url, message)
      VALUES (${gymId}::uuid, ${name}, ${email}, ${proof ?? null}, ${message ?? null});
    `;

    console.log(`Gym claim recorded for ${gymId} by ${email}`);
    return successResponse();
  } catch (error) {
    console.error('Failed to create gym claim', error);
    return NextResponse.json({ error: 'Unable to process claim.' }, { status: 500 });
  }
}
