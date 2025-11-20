import { NextRequest, NextResponse } from 'next/server';
import { getDrizzleDb, gymClaims, checkRateLimit } from '@grapplemap/db';
import { claimSchema } from '@/lib/validation/claim';

export const runtime = 'nodejs';

const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);

  // Apply database-backed rate limiting
  const rateLimitResult = await checkRateLimit(`claim:${ip}`, {
    maxRequests: RATE_LIMIT,
    windowMs: WINDOW_MS,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
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

  try {
    const db = getDrizzleDb();
    const { gymId, name, email, proof, message } = parseResult.data;

    await db.insert(gymClaims).values({
      gymId,
      claimantName: name,
      claimantEmail: email,
      proofUrl: proof ?? null,
      message: message ?? null,
    });

    console.log(`Gym claim recorded for ${gymId} by ${email}`);
    return successResponse();
  } catch (error) {
    console.error('Failed to create gym claim', error);
    return NextResponse.json({ error: 'Unable to process claim.' }, { status: 500 });
  }
}
