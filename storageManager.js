class StorageManager {

    // Lấy toàn bộ dữ liệu từ localStorage theo key
    static getAll(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`StorageManager.getAll error for key "${key}":`, e);
            return [];
        }
    }

    // Lưu dữ liệu vào localStorage
    static saveAll(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`StorageManager.saveAll error for key "${key}":`, e);
        }
    }

    // Tìm kiếm phần tử theo ID
    static findById(key, id) {
        const items = this.getAll(key);
        return items.find(item => item.id === id) || null;
    }

    // Thêm mới một phần tử
    static addItem(key, item) {
        const items = this.getAll(key);
        items.push(item);
        this.saveAll(key, items);
    }

    // Cập nhật thông tin phần tử theo ID
    static updateItem(key, id, updatedData) {
        const items = this.getAll(key);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updatedData };
            this.saveAll(key, items);
            return true;
        }
        return false;
    }

    // Xóa phần tử theo ID
    static deleteItem(key, id) {
        const items = this.getAll(key);
        const filtered = items.filter(item => item.id !== id);
        this.saveAll(key, filtered);
        return filtered.length < items.length;
    }
}