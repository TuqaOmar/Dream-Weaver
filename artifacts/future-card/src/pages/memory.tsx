import { Redirect, useRoute } from 'wouter';

/** Legacy public URL — the listen page is the single public view now. */
export default function MemoryPublicView() {
  const [, params] = useRoute('/memory/:id');
  return <Redirect to={params?.id ? `/listen/${params.id}` : '/'} replace />;
}
