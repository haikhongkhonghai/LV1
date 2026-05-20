Hệ thống Quản lý Lịch hẹn Khám & Bệnh nhân (HIS)

Một dự án Frontend nhỏ mô phỏng hệ thống quản lý thông tin bệnh nhân và lịch hẹn khám bệnh tại phòng khám/bệnh viện. Dự án sử dụng hoàn toàn công nghệ thuần HTML, CSS, JavaScript kết hợp với lưu trữ dữ liệu tại Local


Cấu trúc dự án

LV1

index.html          # Trang chủ / Dashboard quản lý chính (yêu cầu login)

login.html          # Trang đăng nhập hệ thống

style.css           # Toàn bộ CSS giao diện, responsive và hiệu ứng

app.js              # Controller chính điều phối trạng thái, DOM và sự kiện

auth.js             # Module quản lý đăng nhập, đăng xuất và phân quyền (Guard)

patient.js          # Model định nghĩa thực thể Bệnh nhân (Patient)

appointment.js      # Model định nghĩa thực thể Lịch hẹn khám (MedicalAppointment)

storageManager.js   # Lớp Helper trung gian thao tác CRUD với localStorage

README.md           # Hướng dẫn và mô tả dự án