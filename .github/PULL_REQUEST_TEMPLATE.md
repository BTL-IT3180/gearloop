## Thay đổi gì
<!-- 1–3 câu. Issue: Closes #___ -->

## Files đã chạm
<!-- Liệt kê từng file — so với "Entities/files dự kiến chạm" trong issue.
     Agent chạm file khác → REVIEWER TỪ CHỐI. -->

## Đã test thế nào
<!-- Screenshot/log từ app chạy thật (production URL hoặc preview URL). Không nhận "chạy được máy tôi". -->

## Checklist review (3 câu hỏi audit AI)
- [ ] Làm ĐÚNG acceptance criteria — không thêm tính năng thừa?
- [ ] Không bịa entity/field/dependency ngoài `doc/data-model.md` và `AGENTS.md`?
- [ ] Không có stub/TODO/giá trị cứng giả vờ chạy được? Không `any`?
- [ ] `npm run lint && npm run build` xanh?
