import { notFound } from 'next/navigation';
import DashboardBibliaReadingToolbar from '@/app/dashboard/biblia/dashboard-biblia-reading-toolbar';
import TriviaTopicClient from '@/app/dashboard/trivia/[topic]/trivia-topic-client';
import { getTriviaTopicBySlug, TRIVIA_TOPICS } from '@/lib/trivia-topics';

type Props = {
  params: Promise<{ topic: string }>;
};

export function generateStaticParams() {
  return TRIVIA_TOPICS.map(topic => ({ topic: topic.slug }));
}

export default async function TriviaTopicPage({ params }: Props) {
  const { topic } = await params;
  const topicData = getTriviaTopicBySlug(topic);
  if (!topicData) notFound();

  return (
    <div className="min-h-screen bg-[#ECEEF0] pb-8 sm:pb-14">
      <div className="mx-auto w-full max-w-4xl px-3 pt-3 sm:px-6 sm:pt-5">
        <DashboardBibliaReadingToolbar />
        <TriviaTopicClient topic={topicData} />
      </div>
    </div>
  );
}
