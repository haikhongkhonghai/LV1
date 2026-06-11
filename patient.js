// Patient: Class đại diện cho thực thể Bệnh nhân
// Chứa thông tin bệnh nhân và các hàm thao tác dữ liệu (localStorage)

class Patient {
    static STORAGE_KEY = 'patients';
    static ID_PREFIX = 'BN';

    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.birthDate = data.birthDate || '';
        this.gender = data.gender || '';
        this.phone = data.phone || '';
        this.province = data.province || '';
        this.address = data.address || '';
        this.createdAt = data.createdAt || '';
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            birthDate: this.birthDate,
            gender: this.gender,
            phone: this.phone,
            province: this.province,
            address: this.address,
            createdAt: this.createdAt
        };
    }

    // Validate dữ liệu đầu vào của bệnh nhân trước khi lưu
    validate() {
        const errors = [];
        if (!this.name.trim()) errors.push('Tên bệnh nhân không được để trống');
        if (!this.phone.trim()) errors.push('Số điện thoại không được để trống');

        const phoneRegex = /^0[0-9]{8,10}$/;
        if (this.phone.trim() && !phoneRegex.test(this.phone.trim())) {
            errors.push('Số điện thoại không hợp lệ (yêu cầu từ 9-11 chữ số, bắt đầu bằng số 0)');
        }

        if (this.birthDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const inputDate = new Date(this.birthDate);
            if (inputDate > today) {
                errors.push('Ngày sinh không thể chọn ở tương lai');
            }
        }

        return { valid: errors.length === 0, errors };
    }

    save() {
        const validation = this.validate();
        if (!validation.valid) return validation;

        if (!this.id) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const dateStr = `${dd}${mm}${yyyy}`;

            const items = StorageManager.getAll(Patient.STORAGE_KEY);
            const prefix = Patient.ID_PREFIX + dateStr;
            let maxNum = 0;
            items.forEach(item => {
                if (item.id && item.id.startsWith(prefix)) {
                    const num = parseInt(item.id.replace(prefix, ''), 10);
                    if (!isNaN(num) && num > maxNum) maxNum = num;
                }
            });
            const counter = String(maxNum + 1).padStart(4, '0');

            this.id = prefix + counter;
            const today2 = new Date();
            this.createdAt = `${today2.getFullYear()}-${String(today2.getMonth() + 1).padStart(2, '0')}-${String(today2.getDate()).padStart(2, '0')}`;
        }

        const existing = StorageManager.findById(Patient.STORAGE_KEY, this.id);
        if (existing) {
            StorageManager.updateItem(Patient.STORAGE_KEY, this.id, this.toJSON());
        } else {
            StorageManager.addItem(Patient.STORAGE_KEY, this.toJSON());
        }

        return { valid: true, errors: [] };
    }

    // Lấy toàn bộ danh sách bệnh nhân và map thành các thực thể Patient
    static getAll() {
        return StorageManager.getAll(Patient.STORAGE_KEY).map(d => new Patient(d));
    }

    // Tìm kiếm bệnh nhân theo ID
    static findById(id) {
        const data = StorageManager.findById(Patient.STORAGE_KEY, id);
        return data ? new Patient(data) : null;
    }

    // Tìm kiếm bệnh nhân theo bộ lọc
    static search(filters = {}) {
        let patients = Patient.getAll();
        if (filters.nameOrCode) {
            const kw = removeVietnamese(filters.nameOrCode).toLowerCase();
            patients = patients.filter(p =>
                removeVietnamese(p.name).toLowerCase().includes(kw) || p.id.toLowerCase().includes(kw)
            );
        }
        if (filters.name) {
            const kw = removeVietnamese(filters.name).toLowerCase();
            patients = patients.filter(p =>
                removeVietnamese(p.name).toLowerCase().includes(kw)
            );
        }
        if (filters.phone) {
            patients = patients.filter(p => p.phone.includes(filters.phone));
        }
        if (filters.gender) {
            patients = patients.filter(p => p.gender === filters.gender);
        }
        return patients;
    }

    static deleteById(id) {
        const appointments = MedicalAppointment.getByPatientId(id);
        appointments.forEach(apt => apt.delete());
        return StorageManager.deleteItem(Patient.STORAGE_KEY, id);
    }
}