/**
 * SoundChain Persistent Audio Storage Engine (IndexedDB)
 * Stores binary audio masters and artwork blobs permanently in the browser.
 * Ensures custom uploaded tracks (e.g. MP3, WAV, AAC, FLAC) persist across sessions,
 * reloads, and tab closures without depending on transient blob: URLs or external gateways.
 */

const DB_NAME = "SoundChain_Media_DB";
const DB_VERSION = 1;
const STORE_AUDIO = "audio_masters";
const STORE_COVERS = "cover_artwork";

// In-memory cache of active object URLs for the current window session
const liveUrlCache = new Map();

/**
 * Open or upgrade the IndexedDB instance
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this browser environment."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO);
      }
      if (!db.objectStoreNames.contains(STORE_COVERS)) {
        db.createObjectStore(STORE_COVERS);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an audio binary (Blob or File) for a track ID
 * @param {string} trackId Unique track ID or bytes32Id
 * @param {Blob|File} fileOrBlob Audio binary
 */
export async function saveTrackAudio(trackId, fileOrBlob) {
  if (!trackId || !fileOrBlob) return false;
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AUDIO, "readwrite");
      const store = tx.objectStore(STORE_AUDIO);
      const req = store.put(fileOrBlob, String(trackId));

      req.onsuccess = () => {
        // Invalidate or update active cache
        if (liveUrlCache.has(trackId)) {
          try {
            URL.revokeObjectURL(liveUrlCache.get(trackId));
          } catch {}
        }
        const newUrl = URL.createObjectURL(fileOrBlob);
        liveUrlCache.set(trackId, newUrl);
        resolve(true);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to save audio to IndexedDB:", err);
    return false;
  }
}

/**
 * Retrieve the raw audio Blob from IndexedDB
 * @param {string} trackId Track ID or bytes32Id
 */
export async function getTrackAudioBlob(trackId) {
  if (!trackId) return null;
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AUDIO, "readonly");
      const store = tx.objectStore(STORE_AUDIO);
      const req = store.get(String(trackId));

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Could not read audio from IndexedDB:", err);
    return null;
  }
}

/**
 * Get a playable object URL for a track's audio binary
 * @param {string} trackId Track ID or bytes32Id
 */
export async function getTrackAudioUrl(trackId) {
  if (!trackId) return null;

  // Check in-memory session cache first
  if (liveUrlCache.has(trackId)) {
    return liveUrlCache.get(trackId);
  }

  // Retrieve from IndexedDB
  const blob = await getTrackAudioBlob(trackId);
  if (blob) {
    const url = URL.createObjectURL(blob);
    liveUrlCache.set(trackId, url);
    return url;
  }

  return null;
}

/**
 * Check if audio binary exists in IndexedDB
 * @param {string} trackId
 */
export async function hasTrackAudio(trackId) {
  if (!trackId) return false;
  if (liveUrlCache.has(trackId)) return true;
  const blob = await getTrackAudioBlob(trackId);
  return !!blob;
}

/**
 * Save cover artwork binary
 */
export async function saveTrackCover(trackId, fileOrBlob) {
  if (!trackId || !fileOrBlob) return false;
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_COVERS, "readwrite");
      const store = tx.objectStore(STORE_COVERS);
      const req = store.put(fileOrBlob, String(trackId));
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to save cover art:", err);
    return false;
  }
}

/**
 * Get cover artwork URL
 */
export async function getTrackCoverUrl(trackId) {
  if (!trackId) return null;
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_COVERS, "readonly");
      const store = tx.objectStore(STORE_COVERS);
      const req = store.get(String(trackId));
      req.onsuccess = () => {
        if (req.result) {
          resolve(URL.createObjectURL(req.result));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/**
 * Utility to extract duration in seconds and formatted MM:SS string from an Audio File
 * @param {File|Blob} file
 * @returns {Promise<{durationSec: number, durationFormatted: string}>}
 */
export function extractAudioDuration(file) {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    audio.src = url;

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const sec = Math.round(audio.duration) || 210;
      const mins = Math.floor(sec / 60);
      const remSecs = sec % 60;
      const formatted = `${mins}:${remSecs < 10 ? "0" : ""}${remSecs}`;
      resolve({ durationSec: sec, durationFormatted: formatted });
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ durationSec: 210, durationFormatted: "3:30" });
    };
  });
}
