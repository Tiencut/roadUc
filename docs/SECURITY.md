## SECURITY.md

Tài liệu này tóm tắt các bước quan trọng để vận hành an toàn ứng dụng `duHocUc` trong môi trường production.

**Mục tiêu ngắn gọn**
- Bảo vệ tài khoản admin (không để mặc định `admin/admin`).
- Bảo mật JWT bằng secret mạnh và cơ chế luân phiên.
- Giữ an toàn dữ liệu (backup, phục hồi) và giảm rủi ro brute-force.

---

## 1. Biểu tượng nhanh (Immediate checklist)
- Thiết lập `JWT_SECRET` trong môi trường (không commit vào git).
- Xóa hoặc đổi mật khẩu tài khoản admin mặc định nếu tồn tại.
- Bật HTTPS/SSL trước khi triển khai public.
- Thêm rate-limiting cho endpoint đăng nhập.

---

## 2. Biến môi trường quan trọng
- `JWT_SECRET` — bắt buộc trong production. Phải là chuỗi dài, ngẫu nhiên (>=32 ký tự). Không commit.
- `NODE_ENV=production` để framework và libs hoạt động ở chế độ production.

Ví dụ (PowerShell):
```powershell
# tạm thời trong session hiện tại
$env:JWT_SECRET = 'một_chuỗi_rất_phức_tạp_và_ngẫu_nhiên_độ_dài_lớn'

# hoặc set vĩnh viễn cho user (PowerShell admin)
setx JWT_SECRET "một_chuỗi_rất_phức_tạp_và_ngẫu_nhiên_độ_dài_lớn"
```

Ví dụ Docker Compose (.env):
```
JWT_SECRET=replace_with_a_strong_secret_here
NODE_ENV=production
```

---

## 3. Xóa/Đổi default admin (nếu có)
Ứng dụng có thể tạo user mặc định trên lần chạy đầu. Hãy **đổi mật khẩu** hoặc **xóa** account đó ngay khi deploy.

Ví dụ curl (thay `ADMIN_TOKEN` bằng token của bạn):
```bash
# đổi mật khẩu cho current user
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"admin","newPassword":"StrongNewPass123!"}'

# hoặc xóa user (bằng admin khác) - với endpoint admin users
curl -X DELETE http://localhost:3000/api/admin/users/<admin-id> \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Nếu bạn muốn, có thể disable auto-create admin trong code: tìm hàm `ensureDefaultAdmin` trong `be/src/index.ts` và thay logic để chỉ tạo khi biến môi trường bật.

---

## 4. Password policy & authentication
- Bắt buộc mật khẩu tối thiểu 8 ký tự, khuyến nghị yêu cầu chữ HOA, chữ thường, số và ký tự đặc biệt.
- Lưu mật khẩu bằng bcrypt (ít nhất salt rounds = 10).
- Giới hạn số lần đăng nhập thất bại (rate-limiting / lockout) để chống brute-force.

---

## 5. Reset mật khẩu
- Triển khai flow reset password qua email: tạo token thời hạn ngắn, gửi link đến email, xác thực token ở endpoint thay mật khẩu.
- Không cho phép reset password hiển thị trực tiếp password mới trong email.

---

## 6. Tokens & Revocation
- JWT có thể bị revoke: ứng dụng có cơ chế blacklist; đảm bảo blacklist được lưu an toàn và có TTL (có thể xoá các item cũ).
- Hãy log `jti` khi cấp token để dễ revoke.

---

## 7. Giao thức & Cookies
- Dùng HTTPS (TLS) cho mọi kết nối tới API và frontend.
- Nếu lưu token trên client, ưu tiên HttpOnly Secure cookie; nếu dùng localStorage (dev), hiểu rủi ro XSS.

---

## 8. Backup & Restore
- Backup file-based DB (`be/data/*.json`) trước mỗi write quan trọng. Ứng dụng đã tạo backup timestamped cho CMS; mở rộng quyết định backup schedule (cron).
- Kiểm tra restore procedure trên môi trường staging thường xuyên.

---

## 9. Logging & Monitoring
- Ghi log authentication failures và suspicious behaviour (nhiều login thất bại từ cùng IP) với mức độ ghi phù hợp.
- Kết nối Sentry / ELK / log service để cảnh báo.

---

## 10. Network / Deployment
- Đặt server API sau reverse proxy / load balancer (Nginx, Azure Front Door, Cloudflare) để có TLS, WAF, rate-limiting.
- Giới hạn CORS origin chỉ cho domain cần thiết.

---

## 11. Hardening tiếp theo (nâng cao)
- Thêm 2FA cho admin.
- Session management: hiển thị list sessions và khả năng revoke.
- Continuous security scans và dependency audit (npm audit, Snyk, dependabot).

---

## 12. Quick checklist trước khi public
- Đặt `JWT_SECRET` mạnh.
- Xóa/đổi default admin.
- Bật HTTPS và cấu hình reverse proxy.
- Cài rate limiting cho `/api/auth/login`.
- Kiểm thử restore backup.

---

## 13. Hành động tôi có thể làm giúp bạn
- (A) Thêm code để bắt lỗi nếu `JWT_SECRET` không được set (fail-fast).
- (B) Thêm endpoint nhỏ để xoá default admin hoặc chuyển auto-create admin sang chỉ khi `ALLOW_DEFAULT_ADMIN=true`.
- (C) Triển khai basic rate-limiter middleware (express-rate-limit) cho login endpoint.

Hãy chọn A/B/C hoặc yêu cầu khác, tôi sẽ patch code ngay.
