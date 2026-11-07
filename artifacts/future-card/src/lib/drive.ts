export type DriveLink = { kind: 'file' | 'folder'; id: string };

const DRIVE_HOSTS = new Set(['drive.google.com', 'docs.google.com']);
const ID_RE = /^[A-Za-z0-9_-]{10,}$/;

export function parseDriveLink(input: string | null | undefined): DriveLink | null {
  if (!input) return null;
  let url: URL;
  try {
    url = new URL(String(input).trim());
  } catch {
    return null;
  }
  if (!DRIVE_HOSTS.has(url.hostname)) return null;

  const fileMatch = url.pathname.match(/\/file\/(?:u\/\d+\/)?d\/([^/]+)/);
  if (fileMatch && ID_RE.test(fileMatch[1])) return { kind: 'file', id: fileMatch[1] };

  const folderMatch = url.pathname.match(/\/folders\/([^/]+)/);
  if (folderMatch && ID_RE.test(folderMatch[1])) return { kind: 'folder', id: folderMatch[1] };

  const qid = url.searchParams.get('id');
  if (qid && ID_RE.test(qid)) return { kind: 'file', id: qid };

  return null;
}

export function normalizeDriveLink(input: string | null | undefined): string | null {
  const link = parseDriveLink(input);
  if (!link) return null;
  return link.kind === 'file'
    ? `https://drive.google.com/file/d/${link.id}/view?usp=sharing`
    : `https://drive.google.com/drive/folders/${link.id}?usp=sharing`;
}

export function drivePreviewUrl(input: string | null | undefined): string | null {
  const link = parseDriveLink(input);
  if (!link || link.kind !== 'file') return null;
  return `https://drive.google.com/file/d/${link.id}/preview`;
}

export function isDriveUrl(input: string | null | undefined): boolean {
  return parseDriveLink(input) !== null;
}

/** Where the card's QR code leads (mirrors the server logic). */
export function qrTargetFor(card: { id: string; voiceMessageUrl?: string | null }): string {
  return normalizeDriveLink(card.voiceMessageUrl) ?? `${window.location.origin}/listen/${card.id}`;
}
