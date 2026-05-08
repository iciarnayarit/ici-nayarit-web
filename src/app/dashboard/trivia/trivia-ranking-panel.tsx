'use client';

type RankingUser = {
  displayName: string;
  title: string;
  points: number;
};

type Props = {
  rankingUsers: RankingUser[];
  viewerRank: number | null;
  effectiveTriviaPoints: number;
  pointsToTop20: number;
  formatPoints: (n: number) => string;
};

export default function TriviaRankingPanel({
  rankingUsers,
  viewerRank,
  effectiveTriviaPoints,
  pointsToTop20,
  formatPoints,
}: Props) {
  return (
    <article className="flex min-h-[260px] flex-col rounded-xl bg-[#F7F7F8] p-3.5 shadow-sm sm:p-4">
      <h3 className="text-3xl font-semibold tracking-tight text-[#1C2F4E] sm:text-4xl">Ranking Global</h3>
      <div className="mt-2 h-0.5 w-24 bg-[#AA8437]" />
      <div className="mt-3 flex-1 space-y-2 sm:mt-4 sm:space-y-2.5">
        {(rankingUsers.length > 0 ? rankingUsers : []).map((user, i) => (
          <div key={`${user.displayName}-${i}`} className="flex items-center justify-between gap-3 rounded-lg p-1">
            <div className="min-w-0">
              <p className="truncate font-semibold text-[#1D2F4D]">{user.displayName}</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-[#9296A0]">{user.title}</p>
            </div>
            <span className={`text-sm font-semibold ${i === 0 ? 'text-[#D3A840]' : 'text-[#2F3D56]'}`}>
              {formatPoints(viewerRank !== null && viewerRank === i + 1 ? effectiveTriviaPoints : user.points)}
            </span>
          </div>
        ))}
        {rankingUsers.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">El ranking del día aún no está disponible.</p>
        ) : null}
      </div>

      <div className="mt-auto rounded-lg bg-[#192F56] p-3.5 text-center text-white sm:mt-4 sm:p-4">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#A5B4CF]">Tu posición actual</p>
        <p className="text-5xl font-semibold leading-none text-[#F3CD5D] sm:text-5xl">{viewerRank ? `#${viewerRank}` : '—'}</p>
        <p className="mt-1 text-[11px] text-[#99A9C6]">
          {viewerRank
            ? pointsToTop20 > 0
              ? `A ${formatPoints(pointsToTop20)} pts del Top 20`
              : '¡Ya estás dentro del Top 20!'
            : 'Inicia sesión y avanza para aparecer en el ranking'}
        </p>
      </div>
    </article>
  );
}
