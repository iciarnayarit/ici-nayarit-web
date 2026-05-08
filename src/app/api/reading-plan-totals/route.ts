import { NextResponse } from 'next/server';
import { allPlanData, plans } from '@/lib/reading-plan-data';

export async function GET() {
  try {
    const totals = Object.fromEntries(Object.entries(allPlanData).map(([slug, days]) => [slug, Array.isArray(days) ? days.length : 0]));
    const titles = Object.fromEntries(
      plans.map(plan => [String(plan.slug), String(plan.titleKey ?? plan.title ?? plan.slug)])
    );

    return NextResponse.json({
      ok: true,
      totals,
      titles,
    });
  } catch (error) {
    console.error('[api/reading-plan-totals GET]', error);
    return NextResponse.json({ ok: false, error: 'No se pudieron cargar los totales de planes.' }, { status: 500 });
  }
}
