// Utility to safely manage and access API Keys in the browser
// Handles missing keys, 401 Unauthorized, and dynamic runtime configuration

const STORAGE_KEY = 'sandwichef_api_key';

export interface ApiKeyStatus {
  hasKey: boolean;
  keySource: 'localStorage' | 'env' | 'none';
  maskedKey: string;
}

/**
 * Retrieves the currently active API Key safely
 */
export function getStoredApiKey(): string {
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local && local.trim().length > 0) {
      return local.trim();
    }
  } catch (e) {
    // Ignore localStorage block in restrictive iframes
  }

  // Fallback to environment variable if configured
  try {
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_API_KEY;
    if (typeof envKey === 'string' && envKey.trim().length > 0) {
      return envKey.trim();
    }
  } catch (e) {
    // Ignore
  }

  return '';
}

/**
 * Saves a user-provided API key to localStorage safely
 */
export function saveApiKey(key: string): boolean {
  try {
    const cleanKey = key.trim();
    if (cleanKey.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, cleanKey);
    }
    // Dispatch custom event for reactive UI updates
    window.dispatchEvent(new CustomEvent('sandwichef_apikey_changed', { detail: { hasKey: cleanKey.length > 0 } }));
    return true;
  } catch (e) {
    console.warn('Could not save API key to localStorage:', e);
    return false;
  }
}

/**
 * Clears stored API key
 */
export function clearApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('sandwichef_apikey_changed', { detail: { hasKey: false } }));
  } catch (e) {
    // Ignore
  }
}

/**
 * Returns API key status and source
 */
export function getApiKeyStatus(): ApiKeyStatus {
  const key = getStoredApiKey();
  if (!key) {
    return {
      hasKey: false,
      keySource: 'none',
      maskedKey: '',
    };
  }

  let isFromLocal = false;
  try {
    isFromLocal = !!localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    isFromLocal = false;
  }

  const masked = key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : '••••••••';

  return {
    hasKey: true,
    keySource: isFromLocal ? 'localStorage' : 'env',
    maskedKey: masked,
  };
}

/**
 * Safe fetch wrapper that handles 401 Unauthorized without crashing the app
 */
export async function safeApiCall<T>(
  apiFunction: () => Promise<T>,
  fallbackValue: T,
  onError?: (error: any, is401: boolean) => void
): Promise<{ data: T; isError: boolean; is401: boolean; error?: any }> {
  try {
    const data = await apiFunction();
    return { data, isError: false, is401: false };
  } catch (err: any) {
    const errorMessage = err?.message || String(err);
    const status = err?.status || err?.response?.status;
    const is401 = status === 401 || errorMessage.includes('401') || errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('api key not valid');

    console.warn('[Sandwichef API Safe Guard] Caught API Error gracefully:', {
      is401,
      errorMessage,
    });

    if (onError) {
      onError(err, is401);
    }

    if (is401) {
      window.dispatchEvent(
        new CustomEvent('sandwichef_api_401', {
          detail: { error: errorMessage },
        })
      );
    }

    return {
      data: fallbackValue,
      isError: true,
      is401,
      error: err,
    };
  }
}
