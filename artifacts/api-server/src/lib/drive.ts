/**
 * Google Drive integration.
 *
 * Voice messages are uploaded to the owner's Google Drive (via an OAuth
 * refresh token — this works with a normal personal Gmail account, unlike a
 * service account which has no Drive storage quota). Each uploaded file is
 * shared as "anyone with the link can view", and that public link is what
 * the QR code on the printed card points to.
 *
 * Required environment variables (set them in Vercel → Settings →
 * Environment Variables):
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REFRESH_TOKEN       (scope: https://www.googleapis.com/auth/drive.file)
 * Optional:
 *   GOOGLE_DRIVE_FOLDER_ID     (folder the files are put in)
 *
 * GOOGLE_OAUTH_TOKEN_URL / GOOGLE_DRIVE_API_BASE exist only so tests can
 * point the code at a local mock server.
 */

const TOKEN_URL = () =>
  process.env.GOOGLE_OAUTH_TOKEN_URL || "https://oauth2.googleapis.com/token";
const API_BASE = () =>
  (process.env.GOOGLE_DRIVE_API_BASE || "https://www.googleapis.com").replace(/\/$/, "");

export function isDriveConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN,
  );
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN || "",
    grant_type: "refresh_token",
  });

  const res = await fetch(TOKEN_URL(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new Error(
      `Google token refresh failed (${res.status}): ${json.error_description || json.error || "unknown error"}`,
    );
  }

  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + Number(json.expires_in || 3000) * 1000,
  };
  return cachedToken.value;
}

export interface DriveUploadResult {
  id: string;
  url: string;
}

export async function uploadToDrive(
  data: Buffer,
  mimeType: string,
  fileName: string,
): Promise<DriveUploadResult> {
  const token = await getAccessToken();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

  const metadata: Record<string, unknown> = { name: fileName, mimeType };
  if (folderId) metadata.parents = [folderId];

  const boundary = `fc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
    ),
    data,
    Buffer.from(`\r\n--${boundary}--`),
  ]);

  const uploadRes = await fetch(
    `${API_BASE()}/upload/drive/v3/files?uploadType=multipart&fields=id&supportsAllDrives=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  );
  const uploaded: any = await uploadRes.json().catch(() => ({}));
  if (!uploadRes.ok || !uploaded.id) {
    throw new Error(
      `Drive upload failed (${uploadRes.status}): ${uploaded?.error?.message || "unknown error"}`,
    );
  }

  // Make it viewable by anyone who scans the QR code (no Google login needed).
  const permRes = await fetch(
    `${API_BASE()}/drive/v3/files/${encodeURIComponent(uploaded.id)}/permissions?supportsAllDrives=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    },
  );
  if (!permRes.ok) {
    const perm: any = await permRes.json().catch(() => ({}));
    throw new Error(
      `Drive sharing failed (${permRes.status}): ${perm?.error?.message || "unknown error"}`,
    );
  }

  return { id: uploaded.id, url: driveFileViewUrl(uploaded.id) };
}

// ---------------------------------------------------------------------------
// Drive link helpers
// ---------------------------------------------------------------------------

export type DriveLink = { kind: "file" | "folder"; id: string };

const DRIVE_HOSTS = new Set(["drive.google.com", "docs.google.com"]);
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
  if (fileMatch && ID_RE.test(fileMatch[1])) return { kind: "file", id: fileMatch[1] };

  const folderMatch = url.pathname.match(/\/folders\/([^/]+)/);
  if (folderMatch && ID_RE.test(folderMatch[1])) return { kind: "folder", id: folderMatch[1] };

  const qid = url.searchParams.get("id");
  if (qid && ID_RE.test(qid)) return { kind: "file", id: qid };

  return null;
}

export function driveFileViewUrl(id: string): string {
  return `https://drive.google.com/file/d/${id}/view?usp=sharing`;
}

export function normalizeDriveLink(input: string | null | undefined): string | null {
  const link = parseDriveLink(input);
  if (!link) return null;
  return link.kind === "file"
    ? driveFileViewUrl(link.id)
    : `https://drive.google.com/drive/folders/${link.id}?usp=sharing`;
}
