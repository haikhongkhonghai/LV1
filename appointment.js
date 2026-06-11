// MedicalAppointment: Class đại diện cho thực thể Lịch hẹn khám
// Quản lý nghiệp vụ liên quan đến lịch hẹn và đồng bộ với thông tin bệnh nhân

class MedicalAppointment {
    static STORAGE_KEY = 'appointments';

    static STATUSES = ['Chờ khám', 'Đã xác nhận', 'Đang khám', 'Đã khám', 'Đã hủy'];
    static CLINICS = [
        'Phòng Khám Nội 1', 'Phòng Khám Nội 2'
    ];
    static DOCTORS = [
        'BS. A', 'BS. B'
    ];
    static SERVICES = [
        'Khám nội tổng quát', 'Khám mắt'
    ];
    static PACKAGES = [
        'Gói khám sức khỏe tổng quát'
    ];


    constructor(data = {}) {
        this.id = data.id || null;
        this.patientId = data.patientId || '';
        this.patientName = data.patientName || '';
        this.patientPhone = data.patientPhone || '';
        this.appointmentDate = data.appointmentDate || '';
        this.timeSlot = data.timeSlot || '';
        this.clinic = data.clinic || '';
        this.services = data.services || '';
        this.requestContent = data.requestContent || '';
        this.remark = data.remark || '';
        this.doctor = data.doctor || '';
        this.status = data.status || 'Chờ khám';
        this.createdAt = data.createdAt || '';
    }


    toJSON() {
        return {
            id: this.id,
            patientId: this.patientId,
            patientName: this.patientName,
            patientPhone: this.patientPhone,
            appointmentDate: this.appointmentDate,
            timeSlot: this.timeSlot,
            clinic: this.clinic,
            services: this.services,
            requestContent: this.requestContent,
            remark: this.remark,
            doctor: this.doctor,
            status: this.status,
            createdAt: this.createdAt
        };
    }

    // Validate thông tin đặt lịch hẹn
    validate() {
        const errors = [];
        if (!this.patientId) errors.push('Chưa chọn bệnh nhân');

        if (!this.appointmentDate) {
            errors.push('Ngày hẹn khám không được để trống');
        } else if (!this.id) {
            // Khi tạo mới: Không cho phép chọn ngày trong quá khứ
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const inputDate = new Date(this.appointmentDate);
            if (inputDate < today) {
                errors.push('Không thể đặt lịch hẹn vào ngày trong quá khứ');
            }
        }

        if (!this.timeSlot) errors.push('Giờ khám không được để trống');
        return { valid: errors.length === 0, errors };
    }

    // Lưu lịch hẹn vào local storage
    save() {
        const validation = this.validate();
        if (!validation.valid) return validation;

        if (!this.id) {
            this.id = Date.now().toString(); // Dùng timestamp làm ID duy nhất
            const now = new Date();
            this.createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        }

        // Tự động đồng bộ tên và SĐT từ thông tin Bệnh nhân sang
        const patient = Patient.findById(this.patientId);
        if (patient) {
            this.patientName = patient.name;
            this.patientPhone = patient.phone;
        }

        const existing = StorageManager.findById(MedicalAppointment.STORAGE_KEY, this.id);
        if (existing) {
            StorageManager.updateItem(MedicalAppointment.STORAGE_KEY, this.id, this.toJSON());
        } else {
            StorageManager.addItem(MedicalAppointment.STORAGE_KEY, this.toJSON());
        }

        return { valid: true, errors: [] };
    }

    delete() {
        return StorageManager.deleteItem(MedicalAppointment.STORAGE_KEY, this.id);
    }

    // Lấy toàn bộ danh sách lịch hẹn
    static getAll() {
        return StorageManager.getAll(MedicalAppointment.STORAGE_KEY).map(d => new MedicalAppointment(d));
    }

    // Tìm kiếm lịch hẹn theo ID
    static findById(id) {
        const data = StorageManager.findById(MedicalAppointment.STORAGE_KEY, id);
        return data ? new MedicalAppointment(data) : null;
    }

    // Tìm kiếm lịch hẹn theo bộ lọc
    static search(filters = {}) {
        let appointments = MedicalAppointment.getAll();
        if (filters.nameOrCode) {
            const kw = removeVietnamese(filters.nameOrCode).toLowerCase();
            appointments = appointments.filter(a =>
                removeVietnamese(a.patientName).toLowerCase().includes(kw) || a.patientId.toLowerCase().includes(kw)
            );
        }
        if (filters.status) {
            appointments = appointments.filter(a => a.status === filters.status);
        }
        if (filters.phone) {
            appointments = appointments.filter(a => a.patientPhone.includes(filters.phone));
        }
        if (filters.dateFrom) {
            appointments = appointments.filter(a => a.appointmentDate >= filters.dateFrom);
        }
        if (filters.dateTo) {
            appointments = appointments.filter(a => a.appointmentDate <= filters.dateTo);
        }
        return appointments;
    }

    // Lấy tất cả lịch hẹn của một bệnh nhân cụ thể
    static getByPatientId(patientId) {
        return MedicalAppointment.getAll().filter(a => a.patientId === patientId);
    }
}