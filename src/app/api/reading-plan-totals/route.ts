import { NextResponse } from 'next/server';
import { allPlanData, plans } from '@/lib/reading-plan-data';
import { stableMergeSort } from '@/lib/perf-algorithms';
import { getOrSetRamCache } from '@/lib/ram-cache';

const READING_PLAN_TOTALS_RAM_CACHE_KEY = 'api:reading-plan-totals:v1';
const READING_PLAN_TOTALS_TTL_MS = 10 * 60 * 1000;

type ReadingPlanTotalsPayload = {
  ok: true;
  totals: Record<string, number>;
  titles: Record<string, string>;
};

export async function GET() {
  try {
    const payload = await getOrSetRamCache<ReadingPlanTotalsPayload>(
      READING_PLAN_TOTALS_RAM_CACHE_KEY,
      READING_PLAN_TOTALS_TTL_MS,
      async () => {
        const sortedPlans = stableMergeSort([...plans], (a, b) =>
          String(a.slug).localeCompare(String(b.slug), 'es-MX')
        );
        const totals = Object.fromEntries(
          Object.entries(allPlanData).map(([slug, days]) => [slug, Array.isArray(days) ? days.length : 0])
        );
        const titles = Object.fromEntries(
          sortedPlans.map((plan) => [String(plan.slug), String(plan.titleKey ?? plan.title ?? plan.slug)])
        );
        return {
          ok: true,
          totals,
          titles,
        };
      }
    );

    return NextResponse.json(payload);
  } catch (error) {
    console.error('[api/reading-plan-totals GET]', error);
    return NextResponse.json({ ok: false, error: 'No se pudieron cargar los totales de planes.' }, { status: 500 });
  }
}
