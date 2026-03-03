import { SkeletonParticipantGrid } from '@/app/components/ui/Skeleton';

/**
 * Checkin Loading — Matches operational checklist layout
 */
export default function Loading() {
  return (
    <div role="status" aria-label="頁面載入中">
      <SkeletonParticipantGrid count={8} />
    </div>
  );
}
