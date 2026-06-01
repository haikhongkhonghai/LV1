// avatarDB.js: Quản lý lưu trữ ảnh đại diện bệnh nhân bằng IndexedDB

class AvatarDB {
    static #DB_NAME = 'HIS_AvatarDB';       // Tên database
    static #DB_VERSION = 1;                   // Phiên bản DB
    static #STORE_NAME = 'avatars';           // Tên object store

    // Mở kết nối tới IndexedDB, tự tạo object store nếu chưa có
    static #openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.#DB_NAME, this.#DB_VERSION);

            // Được gọi khi tạo DB lần đầu hoặc khi nâng version
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                // Tạo object store 'avatars' với key là patientId
                if (!db.objectStoreNames.contains(this.#STORE_NAME)) {
                    db.createObjectStore(this.#STORE_NAME, { keyPath: 'patientId' });
                }
            };

            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    static async saveAvatar(patientId, imageBlob) {
        try {
            const db = await this.#openDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.#STORE_NAME, 'readwrite');
                const store = tx.objectStore(this.#STORE_NAME);
                // put() sẽ thêm mới hoặc ghi đè nếu đã tồn tại
                store.put({ patientId, image: imageBlob });
                tx.oncomplete = () => resolve(true);
                tx.onerror = (e) => reject(e.target.error);
            });
        } catch (e) {
            console.error('AvatarDB.saveAvatar error:', e);
            return false;
        }
    }

    static async getAvatar(patientId) {
        try {
            const db = await this.#openDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.#STORE_NAME, 'readonly');
                const store = tx.objectStore(this.#STORE_NAME);
                const request = store.get(patientId);
                request.onsuccess = () => {
                    const result = request.result;
                    resolve(result ? result.image : null);
                };
                request.onerror = (e) => reject(e.target.error);
            });
        } catch (e) {
            console.error('AvatarDB.getAvatar error:', e);
            return null;
        }
    }

    static async deleteAvatar(patientId) {
        try {
            const db = await this.#openDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.#STORE_NAME, 'readwrite');
                const store = tx.objectStore(this.#STORE_NAME);
                store.delete(patientId);
                tx.oncomplete = () => resolve(true);
                tx.onerror = (e) => reject(e.target.error);
            });
        } catch (e) {
            console.error('AvatarDB.deleteAvatar error:', e);
            return false;
        }
    }
}
