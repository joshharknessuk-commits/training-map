import { NextRequest, NextResponse } from 'next/server';
import { db, classes } from '@grapplemap/db';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    let query = db.select().from(classes).where(eq(classes.gymId, id)).$dynamic();

    if (activeOnly) {
      query = query.where(and(eq(classes.gymId, id), eq(classes.isActive, 1)));
    }

    const result = await query;

    return NextResponse.json({ classes: result });
  } catch (error) {
    console.error('Get gym classes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
