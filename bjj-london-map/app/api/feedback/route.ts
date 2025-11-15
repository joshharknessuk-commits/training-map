import { NextRequest, NextResponse } from 'next/server';
import { feedbackSchema } from '@/lib/validation/feedback';
import { getDrizzleDb } from '@/lib/db/drizzle';
import { feedback } from '@/lib/db/schema/feedback';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed.',
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  if (parsed.data.website && parsed.data.website.length > 0) {
    return new NextResponse(null, { status: 204 });
  }

  const db = getDrizzleDb();
  try {
    await db.insert(feedback).values({
      name: parsed.data.name ?? null,
      email: parsed.data.email ?? null,
      message: parsed.data.message.trim(),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api/feedback] Failed to store feedback', error);
    return NextResponse.json({ error: 'Unable to store feedback.' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 });
}

export function PUT() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 });
}

export function DELETE() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 });
}
