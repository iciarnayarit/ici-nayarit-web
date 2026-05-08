'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { grantEngagementPoints, type EngagementPointsAction } from '@/lib/engagement-points';

type EngagementPageTrackerProps = {
  action?: EngagementPointsAction;
  dedupeKey: string;
};

export default function EngagementPageTracker({ action = 'bible_read', dedupeKey }: EngagementPageTrackerProps) {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    void grantEngagementPoints({
      action,
      dedupeKey,
      isSignedIn: authLoaded && isSignedIn === true,
    });
  }, [action, dedupeKey, authLoaded, isSignedIn]);

  return null;
}
