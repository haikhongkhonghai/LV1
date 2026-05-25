/*
    1. Quản lý trạng thái.
    2. Mẫu dữ liệu khởi tạo.
    3. Hàm tiện ích UI.
    4. Đổ dữ liệu lên bảng.
    5. Xử lý Form, Autocomplete, load dữ liệu.
    6. Gán sự kiện tương tác.
    7. Khởi chạy ứng dụng.
*/

// ==================== QUẢN LÝ TRẠNG THÁI (STATE) ====================
const appState = {
    apt: { page: 1, pageSize: 20, data: [], filteredData: null, sortDateDirection: null },
    pt: { page: 1, pageSize: 20, data: [], filteredData: null },
    selectedPatient: null,
    editingPatientId: null,
    editingAptId: null,
    provinces: []
};

// ==================== KHỞI TẠO DỮ LIỆU MẪU (SEED DATA) ====================
// Tạo dữ liệu giả lập ban đầu để test giao diện
function seedIfEmpty() {
    // Nếu đã có dữ liệu trong storage rồi thì không chạy lại nữa
    if (StorageManager.getAll('patients').length > 0) return;
    const patients = [
        { id: 'BN130520260001', name: 'Nguyễn Văn A', birthDate: '1985-03-15', gender: 'Nam', phone: '0901234567', province: 'ho_chi_minh', address: '', createdAt: '01/01/2026' },
        { id: 'BN130520260002', name: 'Nguyễn Văn B', birthDate: '1990-07-22', gender: 'Nữ', phone: '0912345678', province: 'ho_chi_minh', address: '', createdAt: '05/01/2026' },
        { id: 'BN130520260003', name: 'Nguyễn Văn C', birthDate: '1978-11-08', gender: 'Nam', phone: '0923456789', province: 'ho_chi_minh', address: '', createdAt: '10/01/2026' },
        { id: 'BN130520260004', name: 'Nguyễn Văn D', birthDate: '1995-01-30', gender: 'Nữ', phone: '0934567890', province: 'ho_chi_minh', address: '', createdAt: '15/02/2026' },
        { id: 'BN130520260005', name: 'Nguyễn Văn E', birthDate: '1982-09-12', gender: 'Nam', phone: '0945678901', province: 'ho_chi_minh', address: '', createdAt: '20/02/2026' },
        { id: 'BN130520260006', name: 'Nguyễn Văn F', birthDate: '1988-05-25', gender: 'Nữ', phone: '0956789012', province: 'da_nang', address: '', createdAt: '01/03/2026' },
        { id: 'BN130520260007', name: 'Nguyễn Văn G', birthDate: '1975-12-03', gender: 'Nam', phone: '0967890123', province: 'ha_noi', address: '', createdAt: '10/03/2026' },
        { id: 'BN130520260008', name: 'Nguyễn Văn H', birthDate: '1992-06-18', gender: 'Nữ', phone: '0978901234', province: 'ho_chi_minh', address: '', createdAt: '15/03/2026' }
    ];

    StorageManager.saveAll('patients', patients);
    const ts = Date.now();
    const apts = [];

    // Sinh ngẫu nhiên 40 mẫu appointments
    for (let i = 0; i < 40; i++) {
        const p = patients[Math.floor(Math.random() * patients.length)];
        const date = new Date();
        date.setDate(date.getDate() + Math.floor(Math.random() * 30)); // Trong vòng 30 ngày tới
        const dateStr = date.toISOString().split('T')[0];

        const h = 8 + Math.floor(Math.random() * 9); // 8h - 16h
        const m = Math.random() > 0.5 ? 0 : 30;
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

        const clinics = MedicalAppointment.CLINICS;
        const doctors = MedicalAppointment.DOCTORS;
        const services = [...MedicalAppointment.SERVICES, ...MedicalAppointment.PACKAGES];
        const statuses = MedicalAppointment.STATUSES;

        apts.push({
            id: (ts + i + 1).toString(),
            patientId: p.id,
            patientName: p.name,
            patientPhone: p.phone,
            appointmentDate: dateStr,
            timeSlot: calcTimeSlot(timeStr),
            clinic: clinics[Math.floor(Math.random() * clinics.length)],
            services: services[Math.floor(Math.random() * services.length)],
            requestContent: 'Khám sức khỏe ngẫu nhiên ' + (i + 1),
            remark: Math.random() > 0.8 ? 'Ghi chú ngẫu nhiên' : '',
            doctor: doctors[Math.floor(Math.random() * doctors.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            createdAt: new Date().toLocaleDateString('vi-VN')
        });
    }

    StorageManager.saveAll('appointments', apts);
}

// ==================== CÁC HÀM TIỆN ÍCH ====================
// Format date string về dạng DD/MM/YYYY để hiển thị
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

// Hàm tính thời lượng khám khoảng xung nhịp 30p một.
function calcTimeSlot(time) {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const endM = m + 30;
    const endH = h + Math.floor(endM / 60);
    const eM = endM % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} - ${String(endH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;
}

// Hàm escape HTML để ngăn chặn XSS khi chèn dữ liệu người dùng qua innerHTML.
function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Hàm hiển thị màu dựa vào trạng thái. 
function getStatusClass(status) {
    const map = { 'Chờ khám': 'status-pending', 'Đã xác nhận': 'status-progress', 'Đang khám': 'status-progress', 'Đã khám': 'status-completed', 'Đã hủy': 'status-cancelled' };
    return map[status] || 'status-pending';
}

// Hiển thị một thông báo góc phải màn hình trong 3 giây.
function showToast(msg, type = 'success') {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    t.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${escapeHTML(msg)}</span>`;
    c.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}

// Hàm hiển thị xác nhận trước khi xóa.
function showConfirm(msg, onYes) {
    const modal = document.getElementById('confirm-dialog');
    document.getElementById('confirm-message').textContent = msg;
    modal.classList.add('show');
    const yesBtn = document.getElementById('confirm-yes');
    const noBtn = document.getElementById('confirm-no');
    const close = () => { modal.classList.remove('show'); yesBtn.replaceWith(yesBtn.cloneNode(true)); };
    noBtn.onclick = close;
    modal.onclick = e => { if (e.target === modal) close(); };
    document.getElementById('confirm-yes').onclick = () => { close(); onYes(); };
}

// Mở modal theo ID
function openModalById(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('show'); document.body.style.overflow = 'hidden'; }
}

// Đóng modal theo ID
function closeModalById(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('show'); document.body.style.overflow = ''; }
}

// ==================== RENDER DỮ LIỆU LÊN BẢNG ====================
function checkValid(status, _date) {
    if (status != "Đã xác nhận")
        return true
    const currentDate = new Date();
    const year = _date.slice(0, 4);
    const month = _date.slice(5, 7);
    const day = _date.slice(8);
    const date = new Date(year, month - 1, day);
    if (currentDate >= date)
        return false
    else
        return true
}
// Vẽ bảng lịch hẹn khám
function renderAptTable() {
    const tbody = document.getElementById('appointments-tbody');
    const s = appState.apt;
    s.data = s.filteredData || MedicalAppointment.getAll();

    // Sắp xếp danh sách
    if (s.sortDateDirection) {
        s.data.sort((a, b) => {
            const dateA = new Date(a.appointmentDate).getTime();
            const dateB = new Date(b.appointmentDate).getTime();
            return s.sortDateDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }

    // Tính toán phân trang
    const total = s.data.length;
    const start = (s.page - 1) * s.pageSize;
    const pageData = s.data.slice(start, start + s.pageSize);
    let i = 0;
    // Render danh sách
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="12"><i class="fas fa-calendar-times" style="font-size:2rem;margin-bottom:0.5rem;display:block;opacity:0.3"></i>Không có lịch hẹn nào</td></tr>';
    } else {
        let html = '';
        for (const a of pageData) {
            var check = checkValid(a.status, a.appointmentDate);
            const rowStyle = check ? '' : ' style="background-color: rgba(173, 17, 17, 0.2)"';
            html += `<tr${rowStyle}>
                <td>${start + i + 1}</td>
                <td><span class="status-badge ${getStatusClass(a.status)}">${escapeHTML(a.status)}</span></td>
                <td title="${escapeHTML(a.patientName)}" >${escapeHTML(a.patientName)}</td>
                <td>${escapeHTML(a.patientPhone)}</td>
                <td>${formatDate(a.appointmentDate)}</td>
                <td>${escapeHTML(a.timeSlot)}</td>
                <td title="${escapeHTML(a.clinic)}">${escapeHTML(a.clinic)}</td>
                <td title="${escapeHTML(a.services)}">${escapeHTML(a.services)}</td>
                <td title="${escapeHTML(a.requestContent)}">${escapeHTML(a.requestContent)}</td>
                <td>${escapeHTML(a.doctor)}</td>
                <td title="${escapeHTML(a.remark)}">${escapeHTML(a.remark)}</td>
                <td><button class="action-btn delete" title="Xóa" data-id="${escapeHTML(a.id)}" data-type="apt"><i class="fas fa-trash-alt"></i></button></td>
                </tr>`;
            i++;
        }
        tbody.innerHTML = html;
    }
    renderPagination('apt-pagination', 'apt-pagination-info', total, s.page, s.pageSize, p => { s.page = p; renderAptTable(); });
}
function getProvinceName(codename) {
    if (!codename) return '';
    const prov = appState.provinces?.find(x => x.codename === codename);
    return prov ? prov.name : codename;
}
// Đổ dữ liệu danh sách các Bệnh nhân.
function renderPtTable() {
    const tbody = document.getElementById('patients-tbody');
    const s = appState.pt;
    s.data = s.filteredData || Patient.getAll();
    const total = s.data.length;
    const start = (s.page - 1) * s.pageSize;
    const pageData = s.data.slice(start, start + s.pageSize);

    if (pageData.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="10"><i class="fas fa-user-slash" style="font-size:2rem;margin-bottom:0.5rem;display:block;opacity:0.3"></i>Không có bệnh nhân nào</td></tr>';
    } else {
        const getProvinceName = (codename) => {
            if (!codename) return '';
            const prov = appState.provinces?.find(x => x.codename === codename);
            return prov ? prov.name : codename;
        };

        tbody.innerHTML = pageData.map((p, i) => {
            const cityName = getProvinceName(p.province);
            const fullAddress = p.address ? (cityName ? `${p.address}, ${cityName}` : p.address) : (cityName || '—');
            return `<tr>
            <td>${start + i + 1}</td>
            <td>${escapeHTML(p.id)}</td>
            <td title="${escapeHTML(p.name)}">${escapeHTML(p.name)}</td>
            <td>${formatDate(p.birthDate)}</td>
            <td>${escapeHTML(p.gender)}</td>
            <td title="${escapeHTML(fullAddress)}">${escapeHTML(fullAddress)}</td>
            <td>${escapeHTML(p.phone)}</td>
            <td>${escapeHTML(p.createdAt)}</td>
            <td><button class="action-btn view-apt-btn" title="Xem lịch hẹn" data-patient-id="${escapeHTML(p.id)}"><i class="fas fa-calendar-alt"></i></button></td>
            <td><button class="action-btn delete" title="Xóa" data-id="${escapeHTML(p.id)}" data-type="pt"><i class="fas fa-trash-alt"></i></button></td>
        </tr>`;
        }).join('');
    }
    renderPagination('pt-pagination', 'pt-pagination-info', total, s.page, s.pageSize, p => { s.page = p; renderPtTable(); });
}

// Điều tiết các nút phân trang
function renderPagination(containerId, infoId, total, page, pageSize, onChange) {
    const container = document.getElementById(containerId);
    const infoEl = document.getElementById(infoId);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (infoEl) infoEl.textContent = total > 0 ? `Trang ${page} / ${totalPages}` : '';
    if (!container) return;

    let html = `<button class="page-btn" ${page <= 1 ? 'disabled' : ''} data-page="${page - 1}"><i class="fas fa-chevron-left"></i></button>`;
    let startP = Math.max(1, page - 2), endP = Math.min(totalPages, page + 2);
    if (startP > 1) html += `<button class="page-btn" data-page="1">1</button>` + (startP > 2 ? '<span style="padding:0 4px">...</span>' : '');

    for (let i = startP; i <= endP; i++) {
        html += `<button class="page-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    if (endP < totalPages) html += (endP < totalPages - 1 ? '<span style="padding:0 4px">...</span>' : '') + `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;

    html += `<button class="page-btn" ${page >= totalPages ? 'disabled' : ''} data-page="${page + 1}"><i class="fas fa-chevron-right"></i></button>`;
    container.innerHTML = html;

    container.querySelectorAll('.page-btn:not(:disabled)').forEach(btn => {
        btn.addEventListener('click', () => onChange(parseInt(btn.dataset.page)));
    });
}

// Hiển thị danh sách lịch hẹn của 1 BN
function showPatientAppointments(patientId) {
    const patient = Patient.findById(patientId);
    if (!patient) { showToast('Không tìm thấy bệnh nhân', 'error'); return; }
    // Sắp xếp danh sách
    const appointments = MedicalAppointment.getByPatientId(patientId)
        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
    let addressdetail = patient.address;
    let provincename = getProvinceName(patient.province);
    if (addressdetail) {
        fullAddress = addressdetail + ", " + provincename;
    }
    else {
        fullAddress = provincename;
    }

    // Refill tóm tắt thông tin trên header
    const summary = document.getElementById('patient-apt-summary');
    summary.innerHTML = `
        <div class="patient-apt-info">
            <span><strong>${escapeHTML(patient.name)}</strong></span>
            <span class="info-sep">|</span>
            <span>Mã: <strong>${escapeHTML(patient.id)}</strong></span>
            <span class="info-sep">|</span>
            <span>SĐT: <strong>${escapeHTML(patient.phone)}</strong></span>
            <span class="info-sep">|</span>
            <span>Tổng lịch hẹn: <strong>${appointments.length}</strong></span>
			<span class="info-sep">|</span>
			<span>Địa chỉ chi tiết: <strong>${fullAddress}</strong></span>

        </div>
    `;

    // Refill bảng danh sách lịch hẹn
    const tbody = document.getElementById('patient-apt-tbody');
    if (appointments.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="7"><i class="fas fa-calendar-times" style="font-size:1.5rem;margin-bottom:0.5rem;display:block;opacity:0.3"></i>Bệnh nhân chưa có lịch hẹn nào</td></tr>';
    } else {
        tbody.innerHTML = appointments.map((a, i) => `<tr>
            <td>${i + 1}</td>
            <td><span class="status-badge ${getStatusClass(a.status)}">${escapeHTML(a.status)}</span></td>
            <td>${formatDate(a.appointmentDate)}</td>
            <td>${escapeHTML(a.timeSlot)}</td>
            <td title="${escapeHTML(a.clinic)}">${escapeHTML(a.clinic)}</td>
            <td title="${escapeHTML(a.services)}">${escapeHTML(a.services)}</td>
            <td>${escapeHTML(a.doctor)}</td>
        </tr>`).join('');
    }

    const modal = document.getElementById('modal-patient-appointments');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// ==================== XỬ LÝ FORM & AUTOCOMPLETE ====================

// Logic tìm kiếm bệnh nhân tự động gợi ý (autocomplete)
function setupPatientSearch() {
    const input = document.getElementById('apt-search-patient');
    const dropdown = document.getElementById('patient-autocomplete');
    if (!input || !dropdown) return;
    let debounce;
    input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            const val = input.value.trim();
            if (val.length < 1) { dropdown.classList.remove('show'); return; }
            const results = Patient.search({ name: val });
            if (results.length === 0) {
                dropdown.innerHTML = '<div class="ac-item ac-empty">Không tìm thấy bệnh nhân</div>';
            } else {
                dropdown.innerHTML = results.slice(0, 8).map(p => `<div class="ac-item" data-id="${escapeHTML(p.id)}"><strong>${escapeHTML(p.name)}</strong><span>${escapeHTML(p.id)} — ${escapeHTML(p.phone)}</span></div>`).join('');
            }
            dropdown.classList.add('show');
        }, 250);
    });
    // chọn bệnh nhân từ Autocomplete
    dropdown.addEventListener('click', e => {
        const item = e.target.closest('.ac-item[data-id]');
        if (!item) return;
        selectPatient(item.dataset.id);
        dropdown.classList.remove('show');
    });

    document.addEventListener('click', e => { if (!e.target.closest('.search-group')) dropdown.classList.remove('show'); });
}

// Chọn bệnh nhân từ Autocomplete và hiển thị thông tin.
function selectPatient(id) {
    const p = Patient.findById(id);
    if (!p) return;
    appState.selectedPatient = p;
    document.getElementById('apt-search-patient').value = p.name;
    document.getElementById('apt-pi-name').textContent = p.name;
    document.getElementById('apt-pi-code').textContent = p.id;
    document.getElementById('apt-pi-gender').textContent = p.gender;
    document.getElementById('apt-pi-dob').textContent = formatDate(p.birthDate);
    document.getElementById('apt-pi-phone').textContent = p.phone;
    document.getElementById('apt-pi-address').textContent = p.address || '—';

    // Tìm lịch sử khám gần nhất.
    const apts = MedicalAppointment.getByPatientId(p.id);
    const sorted = apts.filter(a => a.appointmentDate).sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
    document.getElementById('apt-pi-lastvisit').textContent = sorted.length > 0 ? formatDate(sorted[0].appointmentDate) : 'Chưa có';
    document.querySelector('.patient-info-card').style.display = 'block';
}

// Clear thông tin bệnh nhân đã chọn.
function clearPatientSelection() {
    appState.selectedPatient = null;
    document.getElementById('apt-search-patient').value = '';
    ['apt-pi-name', 'apt-pi-code', 'apt-pi-gender', 'apt-pi-dob', 'apt-pi-phone', 'apt-pi-address', 'apt-pi-lastvisit'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    });
    document.querySelector('.patient-info-card').style.display = 'none';
}

function showInlineError(inputId, msg) {
    const input = document.getElementById(inputId);
    let errDiv = document.getElementById(inputId + '-err');
    if (input) {
        input.classList.add('input-error');
        if (errDiv) {
            errDiv.textContent = msg;
            errDiv.classList.add('show');
        }
    }
}

function clearInlineErrors(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    container.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
}

// Reset Form
function resetAptForm() {
    clearPatientSelection();
    const searchInput = document.getElementById('apt-search-patient');
    if (searchInput) searchInput.disabled = false;

    ['apt-date', 'apt-time', 'apt-request', 'apt-remark'].forEach(id => { const el = document.getElementById(id); if (el) el.value = id === 'apt-time' ? '00:00' : ''; });
    ['apt-service', 'apt-clinic', 'apt-doctor', 'apt-status'].forEach(id => { const el = document.getElementById(id); if (el) el.selectedIndex = 0; });
    clearInlineErrors('modal-add-appointment');
}

function resetPtForm() {
    ['pt-name', 'pt-birthdate', 'pt-phone', 'pt-address'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    ['pt-gender-modal', 'pt-province'].forEach(id => { const el = document.getElementById(id); if (el) el.selectedIndex = 0; });
    clearInlineErrors('modal-add-patient');
}

// Đổ dữ liệu tĩnh vào các ô Select
function populateSelects() {
    const fill = (id, items) => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const def = sel.options[0]?.textContent || '';
        sel.innerHTML = `<option value="">${escapeHTML(def)}</option>` + items.map(i => `<option value="${escapeHTML(i)}">${escapeHTML(i)}</option>`).join('');
    };
    // Gom cả Dịch vụ và Gói dịch vụ vì đã bỏ bộ chọn loại.
    const allServices = [...MedicalAppointment.SERVICES, ...MedicalAppointment.PACKAGES];
    fill('apt-service', allServices);
    fill('apt-clinic', MedicalAppointment.CLINICS);
    fill('apt-doctor', MedicalAppointment.DOCTORS);
    fill('apt-status', MedicalAppointment.STATUSES);
}

// Lấy danh sách tỉnh/thành phố từ API
async function fetchProvinces() {
    try {
        const res = await fetch('https://provinces.open-api.vn/api/v2/');
        const data = await res.json();
        appState.provinces = data;

        const select = document.getElementById('pt-province');
        if (select) {
            let html = '<option value="">Chọn tỉnh/thành phố</option>';
            data.forEach(p => {
                html += `<option value="${escapeHTML(p.codename)}">${escapeHTML(p.name)}</option>`;
            });
            select.innerHTML = html;
        }
    } catch (e) {
        console.error("Lỗi tải tỉnh thành:", e);
    }
}

// ==================== BINDING CÁC SỰ KIỆN CLICK / CHANGE ====================

// Gắn các sự kiện
function setupEvents() {

    // Sort logic cho cột Ngày hẹn khám
    const thSortDate = document.getElementById('th-sort-apt-date');
    if (thSortDate) {
        thSortDate.addEventListener('click', () => {
            const icon = document.getElementById('icon-sort-apt-date');
            if (appState.apt.sortDateDirection === null || appState.apt.sortDateDirection === 'desc') {
                appState.apt.sortDateDirection = 'asc';
                icon.className = 'fas fa-sort-up';
            } else {
                appState.apt.sortDateDirection = 'desc';
                icon.className = 'fas fa-sort-down';
            }
            appState.apt.page = 1;
            renderAptTable();
        });
    }

    // Buttons Xóa Table
    document.getElementById('appointments-tbody').addEventListener('click', e => {
        const btn = e.target.closest('.action-btn.delete');
        if (btn) {
            showConfirm('Bạn có chắc muốn xóa lịch hẹn này?', () => {
                const apt = MedicalAppointment.findById(btn.dataset.id);
                if (apt) { apt.delete(); appState.apt.filteredData = null; renderAptTable(); showToast('Đã xóa lịch hẹn'); }
            });
            return;
        }
    });

    document.getElementById('appointments-tbody').addEventListener('dblclick', e => {
        // Bỏ qua nếu click vào nút action
        if (e.target.closest('.action-btn')) return;

        // Mở modal sửa thông tin khi dblclick vào dòng
        const row = e.target.closest('tr');
        if (row && !row.classList.contains('empty-row')) {
            const delBtnInRow = row.querySelector('.action-btn.delete');
            if (!delBtnInRow) return;
            const aptId = delBtnInRow.dataset.id;
            const apt = MedicalAppointment.findById(aptId);
            if (apt) {
                appState.editingAptId = aptId;
                document.querySelector('#modal-add-appointment .modal-header h2').innerHTML = 'Sửa thông tin lịch hẹn';

                // Mở khóa cho phép chọn ngày quá khứ ở chế độ Sửa
                document.getElementById('apt-date').removeAttribute('min');

                selectPatient(apt.patientId);
                const searchInput = document.getElementById('apt-search-patient');
                if (searchInput) {
                    searchInput.disabled = true;
                }

                // Đổ dữ liệu lên form
                document.getElementById('apt-date').value = apt.appointmentDate || '';
                if (apt.timeSlot) {
                    // Extract start time from 'HH:mm - HH:mm'
                    const startTime = apt.timeSlot.split(' - ')[0];
                    document.getElementById('apt-time').value = startTime || '00:00';
                }

                document.getElementById('apt-clinic').value = apt.clinic || '';
                document.getElementById('apt-service').value = apt.services || '';
                document.getElementById('apt-request').value = apt.requestContent || '';
                document.getElementById('apt-remark').value = apt.remark || '';
                document.getElementById('apt-doctor').value = apt.doctor || '';
                document.getElementById('apt-status').value = apt.status || '';

                openModalById('modal-add-appointment');
            }
        }
    });

    document.getElementById('patients-tbody').addEventListener('click', e => {
        const delBtn = e.target.closest('.action-btn.delete');
        if (delBtn) {
            const patientId = delBtn.dataset.id;
            const patientAppointments = MedicalAppointment.getByPatientId(patientId);
            const hasActiveAppointments = patientAppointments.some(apt => apt.status !== 'Đã hủy');

            if (hasActiveAppointments) {
                showToast('Bệnh nhân vẫn còn lịch hẹn khám đang chờ xử lý', 'error');
                return;
            }

            showConfirm('Xóa bệnh nhân sẽ xóa cả lịch hẹn liên quan. Tiếp tục?', () => {
                Patient.deleteById(patientId);
                appState.pt.filteredData = null; appState.apt.filteredData = null;
                renderPtTable(); renderAptTable(); showToast('Đã xóa bệnh nhân');
            });
            return;
        }
        const aptBtn = e.target.closest('.action-btn[data-patient-id]');
        if (aptBtn) {
            showPatientAppointments(aptBtn.dataset.patientId);
            return;
        }
    });

    document.getElementById('patients-tbody').addEventListener('dblclick', e => {
        // Bỏ qua nếu click trực tiếp vào nút action hoặc các thành phần không phải hàng
        if (e.target.closest('.action-btn')) return;

        // Mở modal sửa thông tin khi ấn vào dòng
        const row = e.target.closest('tr');
        if (row && !row.classList.contains('empty-row')) {
            const delBtnInRow = row.querySelector('.action-btn.delete');
            if (!delBtnInRow) return;
            const ptId = delBtnInRow.dataset.id;
            const patient = Patient.findById(ptId);
            if (patient) {
                appState.editingPatientId = ptId;
                document.querySelector('#modal-add-patient .modal-header h2').innerHTML = 'Sửa thông tin bệnh nhân';

                // Khóa ngày sinh không được ở tương lai
                const todayStr = new Date().toISOString().split('T')[0];
                document.getElementById('pt-birthdate').max = todayStr;

                // Đổ dữ liệu có sẵn lên form
                document.getElementById('pt-name').value = patient.name;
                document.getElementById('pt-birthdate').value = patient.birthDate || '';
                document.getElementById('pt-gender-modal').value = patient.gender || '';
                document.getElementById('pt-phone').value = patient.phone || '';
                document.getElementById('pt-province').value = patient.province || '';
                document.getElementById('pt-address').value = patient.address || '';

                openModalById('modal-add-patient');
            }
        }
    });

    // Box Tìm kiếm bộ lọc Page 1 (Lịch hẹn)
    document.getElementById('btn-search-apt').addEventListener('click', () => {
        const filters = {
            nameOrCode: document.getElementById('filter-apt-name').value.trim(),
            status: document.getElementById('filter-apt-status').value,
            phone: document.getElementById('filter-apt-phone').value.trim(),
            dateFrom: document.getElementById('filter-apt-date-from').value,
            dateTo: document.getElementById('filter-apt-date-to').value
        };
        appState.apt.filteredData = MedicalAppointment.search(filters);
        appState.apt.page = 1;
        renderAptTable();
    });
    document.getElementById('btn-reset-apt').addEventListener('click', () => {
        ['filter-apt-name', 'filter-apt-phone', 'filter-apt-date-from', 'filter-apt-date-to'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('filter-apt-status').value = '';
        appState.apt.filteredData = null; appState.apt.page = 1; renderAptTable();
    });

    // Box Tìm kiếm bộ lọc Page 2 (Danh sách bệnh nhân)
    document.getElementById('btn-search-pt').addEventListener('click', () => {
        const filters = {
            nameOrCode: document.getElementById('filter-pt-name').value.trim(),
            phone: document.getElementById('filter-pt-phone').value.trim(),
            gender: document.getElementById('filter-pt-gender').value
        };
        appState.pt.filteredData = Patient.search(filters);
        appState.pt.page = 1;
        renderPtTable();
    });
    document.getElementById('btn-reset-pt').addEventListener('click', () => {
        ['filter-pt-name', 'filter-pt-phone'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('filter-pt-gender').value = '';
        appState.pt.filteredData = null; appState.pt.page = 1; renderPtTable();
    });

    // Box chọn số lượng hiển thị
    document.getElementById('apt-page-size').addEventListener('change', e => {
        appState.apt.pageSize = parseInt(e.target.value); appState.apt.page = 1; renderAptTable();
    });
    document.getElementById('pt-page-size').addEventListener('change', e => {
        appState.pt.pageSize = parseInt(e.target.value); appState.pt.page = 1; renderPtTable();
    });

    // Nút lưu trong modal thêm lịch hẹn
    document.getElementById('btn-save-appointment').addEventListener('click', () => {
        clearInlineErrors('modal-add-appointment');
        let isValid = true;

        if (!appState.selectedPatient) {
            showInlineError('apt-search-patient', 'Bạn chưa chọn bệnh nhân');
            isValid = false;
        }

        const dateVal = document.getElementById('apt-date').value;
        if (!dateVal) {
            showInlineError('apt-date', 'Bạn chưa nhập ngày khám');
            isValid = false;
        } else if (!appState.editingAptId) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const inputDate = new Date(dateVal);
            if (inputDate < today) {
                showInlineError('apt-date', 'Không thể chọn ngày trong quá khứ');
                isValid = false;
            }
        }

        const timeVal = document.getElementById('apt-time').value;
        if (!timeVal) {
            showInlineError('apt-time', 'Bạn chưa nhập giờ khám');
            isValid = false;
        }

        if (!isValid) return;

        const processSave = () => {
            const apt = new MedicalAppointment({
                id: appState.editingAptId || null,
                patientId: appState.selectedPatient.id,
                patientName: appState.selectedPatient.name,
                patientPhone: appState.selectedPatient.phone,
                appointmentDate: dateVal,
                timeSlot: calcTimeSlot(timeVal),
                clinic: document.getElementById('apt-clinic').value,
                services: document.getElementById('apt-service').value,
                requestContent: document.getElementById('apt-request').value.trim(),
                remark: document.getElementById('apt-remark').value.trim(),
                doctor: document.getElementById('apt-doctor').value,
                status: document.getElementById('apt-status').value || 'Chờ khám',
                createdAt: appState.editingAptId ? MedicalAppointment.findById(appState.editingAptId).createdAt : undefined
            });
            const result = apt.save();
            if (!result.valid) { showToast(result.errors.join('. '), 'error'); return; }

            showToast(appState.editingAptId ? 'Cập nhật lịch hẹn thành công!' : 'Thêm lịch hẹn thành công!');
            closeModalById('modal-add-appointment');
            resetAptForm();
            appState.editingAptId = null;
            appState.apt.filteredData = null;
            renderAptTable();
        };

        if (appState.editingAptId) {
            showConfirm('Bạn có chắc muốn lưu các thay đổi này?', processSave);
        } else {
            processSave();
        }
    });

    // Nút lưu trong modal thêm bệnh nhân
    document.getElementById('btn-save-patient').addEventListener('click', () => {
        clearInlineErrors('modal-add-patient');
        let isValid = true;

        const ptName = document.getElementById('pt-name').value.trim();
        if (!ptName) {
            showInlineError('pt-name', 'Bạn chưa nhập tên người bệnh');
            isValid = false;
        }

        const phoneVal = document.getElementById('pt-phone').value.trim();
        const phoneRegex = /^0[0-9]{8,10}$/;
        if (!phoneVal) {
            showInlineError('pt-phone', 'Bạn chưa nhập số điện thoại');
            isValid = false;
        } else if (!phoneRegex.test(phoneVal)) {
            showInlineError('pt-phone', 'Số điện thoại phải từ 9-11 số và bắt đầu bằng 0');
            isValid = false;
        }

        const dobVal = document.getElementById('pt-birthdate').value;
        if (!dobVal) {
            showInlineError('pt-birthdate', 'Bạn chưa nhập ngày sinh');
            isValid = false;
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const inputDate = new Date(dobVal);
            if (inputDate > today) {
                showInlineError('pt-birthdate', 'Ngày sinh không thể chọn ở tương lai');
                isValid = false;
            }
        }

        const genderVal = document.getElementById('pt-gender-modal').value;
        if (!genderVal) {
            showInlineError('pt-gender-modal', 'Bạn chưa chọn giới tính');
            isValid = false;
        }

        if (!isValid) return;

        const processSave = () => {
            const pt = new Patient({
                id: appState.editingPatientId || null,
                name: ptName,
                birthDate: dobVal,
                gender: genderVal,
                phone: phoneVal,
                province: document.getElementById('pt-province').value,
                address: document.getElementById('pt-address').value.trim(),
                createdAt: appState.editingPatientId ? Patient.findById(appState.editingPatientId).createdAt : undefined
            });
            const result = pt.save();
            if (!result.valid) { showToast(result.errors.join('. '), 'error'); return; }

            showToast(appState.editingPatientId ? 'Cập nhật bệnh nhân thành công!' : 'Thêm bệnh nhân thành công!');
            closeModalById('modal-add-patient');
            resetPtForm();
            appState.editingPatientId = null;
            appState.pt.filteredData = null;
            renderPtTable();
        };

        if (appState.editingPatientId) {
            showConfirm('Bạn có chắc muốn lưu các thay đổi này?', processSave);
        } else {
            processSave();
        }
    });

    // Modal đóng danh sách
    const closePatientAptsModal = () => closeModalById('modal-patient-appointments');
    document.getElementById('btn-close-patient-apts')?.addEventListener('click', closePatientAptsModal);
    document.getElementById('btn-close-patient-apts-footer')?.addEventListener('click', closePatientAptsModal);
    document.getElementById('modal-patient-appointments')?.addEventListener('click', e => {
        if (e.target === e.currentTarget) closePatientAptsModal();
    });
}

// Setup các hiệu ứng sidebar và chuyển trang
function setupUI() {
    const sidebar = document.getElementById('sidebar');
    const toggleSidebar = document.getElementById('toggleSidebar');
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page-content');
    const pageTitle = document.getElementById('pageTitle');

    // Responsive sidebar có dạng 2 chế độ 
    if (toggleSidebar) {
        toggleSidebar.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                sidebar.classList.toggle('show');
                sidebar.classList.remove('collapsed');
            } else {
                sidebar.classList.toggle('collapsed');
                sidebar.classList.remove('show');
            }
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = item.getAttribute('data-page');
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            pages.forEach(page => page.classList.remove('active'));
            const activePage = document.getElementById(`page-${pageId}`);
            if (activePage) activePage.classList.add('active');

            const titleSpan = item.querySelector('span');
            if (titleSpan && pageTitle) pageTitle.textContent = titleSpan.textContent;
            if (window.innerWidth <= 1024) sidebar.classList.remove('show');
        });
    });

    // Modal thêm lịch hẹn và thêm bệnh nhân
    document.getElementById('btn-add-appointment')?.addEventListener('click', () => {
        appState.editingAptId = null;
        document.querySelector('#modal-add-appointment .modal-header h2').innerHTML = 'Thêm lịch hẹn';

        // Khóa ngày trong quá khứ ở UI đối với Thêm mới
        const todayStr = new Date().toISOString().split('T')[0];
        document.getElementById('apt-date').min = todayStr;

        resetAptForm();
        openModalById('modal-add-appointment');
    });
    document.getElementById('btn-close-appointment')?.addEventListener('click', () => {
        appState.editingAptId = null;
        closeModalById('modal-add-appointment');
    });
    document.getElementById('btn-cancel-appointment')?.addEventListener('click', () => {
        appState.editingAptId = null;
        closeModalById('modal-add-appointment');
    });

    document.getElementById('btn-add-patient')?.addEventListener('click', () => {
        appState.editingPatientId = null;
        document.querySelector('#modal-add-patient .modal-header h2').innerHTML = 'Thêm bệnh nhân mới';

        // Khóa ngày sinh không được ở tương lai
        const todayStr = new Date().toISOString().split('T')[0];
        document.getElementById('pt-birthdate').max = todayStr;

        resetPtForm();
        openModalById('modal-add-patient');
    });
    document.getElementById('btn-close-patient')?.addEventListener('click', () => {
        appState.editingPatientId = null;
        closeModalById('modal-add-patient');
    });
    document.getElementById('btn-cancel-patient')?.addEventListener('click', () => {
        appState.editingPatientId = null;
        closeModalById('modal-add-patient');
    });

    ['modal-add-appointment', 'modal-add-patient'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', e => {
            if (e.target === e.currentTarget) closeModalById(id);
        });
    });
}
// ==================== KHỞI CHẠY ỨNG DỤNG ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Check quyền login trước
    if (!Auth.initAuthGuard()) return;

    seedIfEmpty();           // Seed dữ liệu test
    setupUI();               // Cấu hình sidebar, responsive
    populateSelects();       // Đổ dữ liệu vào các ô select
    setupPatientSearch();    // Bật tính năng tìm kiếm gợi ý bệnh nhân
    setupEvents();           // Gắn các click event cho nút, table...

    await fetchProvinces();  // Gọi API lấy tỉnh/thành phố của VN

    renderAptTable();        // Load dữ liệu ban đầu lên bảng
    renderPtTable();

    const card = document.querySelector('.patient-info-card');
    if (card) card.style.display = 'none';
});