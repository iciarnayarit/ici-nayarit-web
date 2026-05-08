import CommentariesCatalog from '@/app/comentarios/commentaries-catalog';
import { fetchAvailableCommentaries } from '@/lib/helloao-commentaries';

export default async function CommentariesCatalogSlot() {
  const commentaries = await fetchAvailableCommentaries();
  return <CommentariesCatalog commentaries={commentaries} />;
}

