import { getStore } from '@netlify/blobs';
import fs from 'fs';
import path from 'path';

const BLOB_STORE_NAME = 'chaturanga-media';

/**
 * Helper to obtain the Netlify Blobs store.
 * Supports production Netlify environment, explicit NETLIFY_SITE_ID & NETLIFY_AUTH_TOKEN,
 * or automatic local directory fallback for local development.
 */
function getMediaStore() {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;

  if (siteID && token) {
    return getStore({
      name: BLOB_STORE_NAME,
      siteID,
      token,
      consistency: 'strong'
    });
  }

  // On Netlify production, getStore without credentials auto-binds to the site environment
  try {
    return getStore({
      name: BLOB_STORE_NAME,
      consistency: 'strong'
    });
  } catch (err) {
    return null;
  }
}

// Local filesystem fallback directory for dev environments without Netlify credentials
const LOCAL_STORAGE_DIR = path.join(process.cwd(), '.netlify_blobs_fallback');

function ensureLocalDir() {
  if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
    fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
  }
}

export interface BlobUploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

/**
 * Upload an image into Netlify Blobs storage.
 */
export async function uploadImageBlob(
  data: Buffer | Uint8Array,
  originalFilename: string,
  contentType: string
): Promise<BlobUploadResult> {
  const extMatch = originalFilename.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
  const baseName = originalFilename.replace(/\.[^/.]+$/, "");
  const cleanName = baseName
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const key = `${timestamp}_${randomSuffix}_${cleanName || 'image'}.${ext}`;
  const uploadedAt = new Date().toISOString();

  const store = getMediaStore();

  let uploadedViaNetlify = false;
  if (store) {
    try {
      await store.set(key, Buffer.from(data) as any, {
        metadata: {
          originalFilename,
          contentType,
          size: data.byteLength,
          uploadedAt
        }
      });
      uploadedViaNetlify = true;
    } catch (err: any) {
      console.warn('Netlify Blobs upload fell back to local storage:', err.message);
    }
  }

  // Fallback to local disk store if Netlify Blobs store is not connected
  if (!uploadedViaNetlify) {
    ensureLocalDir();
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    fs.writeFileSync(filePath, Buffer.from(data));
    const metaPath = path.join(LOCAL_STORAGE_DIR, `${key}.meta.json`);
    fs.writeFileSync(
      metaPath,
      JSON.stringify({ originalFilename, contentType, size: data.byteLength, uploadedAt })
    );
  }

  return {
    key,
    url: `/api/media/${encodeURIComponent(key)}`,
    size: data.byteLength,
    contentType,
    uploadedAt
  };
}

/**
 * Retrieve a stored image blob by key.
 */
export async function getImageBlob(key: string): Promise<{
  data: Buffer | Uint8Array | null;
  contentType: string;
} | null> {
  const sanitizedKey = path.basename(key);
  const store = getMediaStore();

  if (store) {
    try {
      const item = await store.get(sanitizedKey, { type: 'arrayBuffer' });
      if (item) {
        const metadata = await store.getMetadata(sanitizedKey);
        const contentType = (metadata?.metadata as any)?.contentType || 'image/jpeg';
        return {
          data: Buffer.from(item),
          contentType
        };
      }
    } catch {
      // Fall through to local fallback
    }
  }

  // Check local fallback
  ensureLocalDir();
  const localFilePath = path.join(LOCAL_STORAGE_DIR, sanitizedKey);
  if (fs.existsSync(localFilePath)) {
    const data = fs.readFileSync(localFilePath);
    let contentType = 'image/jpeg';
    const metaPath = path.join(LOCAL_STORAGE_DIR, `${sanitizedKey}.meta.json`);
    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        if (meta.contentType) contentType = meta.contentType;
      } catch {}
    }
    return { data, contentType };
  }

  return null;
}

/**
 * List all uploaded blobs from store.
 */
export async function listImageBlobs(): Promise<BlobUploadResult[]> {
  const store = getMediaStore();
  const results: BlobUploadResult[] = [];

  if (store) {
    try {
      const list = await store.list();
      for (const item of list.blobs) {
        const itemAny = item as any;
        results.push({
          key: item.key,
          url: `/api/media/${encodeURIComponent(item.key)}`,
          size: itemAny.size || 0,
          contentType: itemAny.metadata?.contentType || 'image/jpeg',
          uploadedAt: itemAny.uploadedAt || new Date().toISOString()
        });
      }
      return results.reverse();
    } catch {
      // Fall through to local fallback
    }
  }

  // Check local fallback
  ensureLocalDir();
  const files = fs.readdirSync(LOCAL_STORAGE_DIR).filter(f => !f.endsWith('.meta.json'));
  for (const f of files) {
    const metaPath = path.join(LOCAL_STORAGE_DIR, `${f}.meta.json`);
    let meta: any = {};
    if (fs.existsSync(metaPath)) {
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      } catch {}
    }
    const stat = fs.statSync(path.join(LOCAL_STORAGE_DIR, f));
    results.push({
      key: f,
      url: `/api/media/${encodeURIComponent(f)}`,
      size: stat.size,
      contentType: meta.contentType || 'image/jpeg',
      uploadedAt: meta.uploadedAt || stat.mtime.toISOString()
    });
  }

  return results.reverse();
}

/**
 * Delete a blob from storage.
 */
export async function deleteImageBlob(key: string): Promise<boolean> {
  const sanitizedKey = path.basename(key);
  const store = getMediaStore();

  if (store) {
    try {
      await store.delete(sanitizedKey);
      return true;
    } catch {
      // Fall through
    }
  }

  ensureLocalDir();
  const localFilePath = path.join(LOCAL_STORAGE_DIR, sanitizedKey);
  const metaPath = path.join(LOCAL_STORAGE_DIR, `${sanitizedKey}.meta.json`);
  let deleted = false;
  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath);
    deleted = true;
  }
  if (fs.existsSync(metaPath)) {
    fs.unlinkSync(metaPath);
  }

  return deleted;
}
