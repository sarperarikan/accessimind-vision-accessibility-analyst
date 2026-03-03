export class VideoStorageService {
    private static instance: VideoStorageService;
    private readonly DB_NAME = 'AccessiMindVideoDB';
    private readonly STORE_NAME = 'videos';
    private readonly DB_VERSION = 1;

    private constructor() { }

    public static getInstance(): VideoStorageService {
        if (typeof window === 'undefined') {
            return new VideoStorageService();
        }
        if (!VideoStorageService.instance) {
            VideoStorageService.instance = new VideoStorageService();
        }
        return VideoStorageService.instance;
    }

    private async getDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined') {
                reject(new Error('IndexedDB not supported on server'));
                return;
            }

            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => {
                console.error('VideoStorageService: Failed to open DB', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME);
                }
            };
        });
    }

    public async saveVideo(id: string, base64: string): Promise<void> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.STORE_NAME], 'readwrite');
                const store = transaction.objectStore(this.STORE_NAME);
                const request = store.put(base64, id);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('VideoStorageService: Error saving video', error);
            // Non-blocking error
        }
    }

    public async getVideo(id: string): Promise<string | null> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.STORE_NAME], 'readonly');
                const store = transaction.objectStore(this.STORE_NAME);
                const request = store.get(id);

                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('VideoStorageService: Error getting video', error);
            return null;
        }
    }

    public async deleteVideo(id: string): Promise<void> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.STORE_NAME], 'readwrite');
                const store = transaction.objectStore(this.STORE_NAME);
                const request = store.delete(id);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.warn('VideoStorageService: Error deleting video', error);
        }
    }
}
