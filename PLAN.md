# Plan code portfolio (kiểu huyml.co) với Claude Code

**Stack mặc định:** Next.js (App Router, TypeScript) · Tailwind CSS v4 + CSS variables · GSAP (ScrollTrigger, SplitText, Flip) qua `@gsap/react` · Lenis · deploy Vercel.
**Repo:** `benzenzz/portfolio-website-piti` (hiện chỉ có README). **Thư mục máy:** `~\Desktop\PORTFOLIO WEB`.

## Cách dùng plan này

1. Mỗi phase = **một lần chat** trong Claude Code. Xong phase thì commit, gõ `/clear`, rồi dán prompt phase tiếp theo.
2. Với phase lớn (2, 5, 6, 7), bấm **Shift+Tab** để vào **Plan mode** trước khi dán prompt. Claude sẽ đưa kế hoạch, bạn đọc rồi mới cho code.
3. Sau mỗi phase, tự mở `npm run dev` → http://localhost:3000 xem bằng mắt. Không đạt thì nói thẳng: "card bay chậm quá", "chữ bị tràn trên mobile"...
4. Lưu file này vào thư mục dự án là `PLAN.md` để Claude Code đọc được khi cần.

> Lưu ý quan trọng: CLAUDE.md của bạn quy định **intro không được chặn người xem** và **không scroll-jacking**. Nên loader 0→100 sẽ ngắn (~1,5s, bỏ qua ở lần ghé sau), còn card deck / gallery dùng *pin + scrub* (cuộn vẫn tự nhiên) chứ không khoá cuộn.

---

## Phase 0 — Chuẩn bị (tự làm, ~10 phút)

1. Kiểm tra Node: mở terminal VS Code, chạy `node -v` (cần **v20 trở lên**; chưa có thì cài bản LTS ở nodejs.org).
2. Đảm bảo `CLAUDE.md` nằm ở **gốc** thư mục `PORTFOLIO WEB` (Claude Code tự đọc file này mỗi lần chạy).
3. Tạo thư mục `reference/` và bỏ vào: ảnh moodboard, 3 video quay huyml.co, ảnh chụp màn hình bạn thích.
4. Tạo thư mục `content-raw/` và bỏ vào những gì bạn có: ảnh/video dự án thật, tên dự án, năm, vai trò, bio ngắn, email, link social. Chưa có thì để trống, Claude sẽ dùng placeholder có ghi rõ.
5. Mở Claude Code trong VS Code, gõ `/plugin` để chắc chắn gsap-skills và web-animation-skills đã bật.

**Prompt 0 (kiểm tra trước khi code):**
```
Đọc CLAUDE.md, PLAN.md, và xem các file trong reference/ và content-raw/. Kiểm tra git remote đã trỏ tới github.com/benzenzz/portfolio-website-piti chưa, và liệt kê các skill/plugin đang có (gsap, web-animation, awwwards-animations, taste-skill, playwright). Chưa viết code. Tóm tắt lại cho mình: (1) hướng thiết kế bạn hiểu từ moodboard, (2) nội dung thật mình đã có và còn thiếu gì, (3) mọi thứ đã sẵn sàng cho Phase 1 chưa.
```

---

## Phase 1 — Khung dự án + design system

**Kết quả:** chạy được `npm run dev`, có màu/font/spacing tokens, trang trống nhưng đúng "gu".

**Prompt 1:**
```
Phase 1 trong PLAN.md. Khởi tạo Next.js (App Router, TypeScript, ESLint, Tailwind CSS v4, thư mục src/) ngay trong thư mục hiện tại, giữ nguyên CLAUDE.md, PLAN.md, reference/, content-raw/ và README.md. Cài thêm gsap, @gsap/react, lenis.

Sau đó dựng design system theo mục 3 của CLAUDE.md:
- Tokens màu (ink, paper, red, gray, line), type scale bằng clamp(), spacing, và motion tokens (duration + easing) trong globals.css dưới dạng CSS variables, nối vào Tailwind.
- Chọn 1 font display condensed đậm + 1 font sans dễ đọc qua next/font/google, giải thích ngắn vì sao chọn.
- Tạo src/content/projects.ts chứa dữ liệu dự án (title, slug, year, category, role, cover, description, media). Lấy dữ liệu thật từ content-raw/ nếu có, còn lại dùng placeholder dạng "[Project year]".
- Trang chủ tạm chỉ hiện tên + danh sách dự án dạng chữ để kiểm tra tokens.

Dùng taste-skill để chọn font/tỉ lệ. Chạy npm run build và lint, báo kết quả. Thêm .gitignore chuẩn Next.js. Commit với message rõ ràng nhưng chưa push.
```

**Bạn kiểm tra:** font có hợp moodboard không, màu đỏ có bị lạm dụng không.

---

## Phase 2 — Nền móng animation (Lenis + GSAP)

**Kết quả:** cuộn mượt, GSAP đăng ký đúng cách, tôn trọng reduced-motion. Đây là phase quan trọng nhất, làm kỹ để các phase sau không lỗi.

**Prompt 2 (dùng Plan mode):**
```
Phase 2 trong PLAN.md. Dùng gsap-skills và web-animation-skills. Dựng nền móng animation cho cả site:
- Một client component SmoothScroll (Lenis) bọc layout, đồng bộ với ScrollTrigger (lenis.on('scroll', ScrollTrigger.update) và chạy Lenis trong gsap.ticker, tắt lagSmoothing).
- Một file src/lib/gsap.ts đăng ký ScrollTrigger, SplitText, Flip, useGSAP một lần duy nhất, và export các ease/duration dùng chung khớp với motion tokens.
- Dùng gsap.matchMedia để có nhánh prefers-reduced-motion: tắt Lenis, bỏ parallax/transform lớn, chỉ giữ fade nhẹ.
- Mọi animation dùng useGSAP với scope, tự cleanup khi đổi route.
- Thêm một section demo tạm (vài khối chữ fade-in khi cuộn) để mình kiểm tra.

Giải thích ngắn cách các phase sau sẽ dùng nền này. Chạy build, báo kết quả, commit.
```

**Bạn kiểm tra:** cuộn bằng chuột/trackpad có mượt không; bật Reduce motion trong Windows (Settings → Accessibility → Visual effects → Animation effects: Off) rồi tải lại trang.

---

## Phase 3 — Loader 0→100

**Prompt 3:**
```
Phase 3 trong PLAN.md. Làm loader kiểu huyml.co (xem video trong reference/): số đếm 0→100 chữ lớn, sau đó màn loader trượt/mask mở ra để lộ hero.
Ràng buộc theo CLAUDE.md: tổng thời gian ≤ 1,8s, không chặn tương tác lâu, chỉ hiện ở lần ghé đầu tiên trong phiên (sessionStorage), reduced-motion thì bỏ qua hẳn, và nội dung trang vẫn có trong HTML khi JS lỗi.
Dùng GSAP timeline, tách thành component Loader riêng, báo cho phần hero biết khi loader xong để hero bắt đầu animate. Build, commit.
```

---

## Phase 4 — Hero + chữ lớn reveal

**Prompt 4:**
```
Phase 4 trong PLAN.md. Dựng hero và hệ thống text reveal:
- Hero: câu giới thiệu ngắn chữ display rất lớn + 1 CTA "View selected work". Nội dung lấy từ content-raw/, thiếu thì placeholder.
- Component <RevealText> dùng SplitText (lines/words, mask) để chữ trượt lên khi vào màn hình, có prop chọn kiểu split và delay. Dùng lại được ở mọi section.
- Chữ phải xuống dòng đẹp trên mobile 360px, không tràn ngang, SplitText tự re-split khi resize (autoSplit).
Dùng awwwards-animations nếu có cho phần kinetic type. Build, commit.
```

---

## Phase 5 — Card deck: bay lên → xoè quạt → vòng xoay 3D

**Kết quả:** hiệu ứng "chữ ký" giống video 1 của huyml.

**Prompt 5 (dùng Plan mode):**
```
Phase 5 trong PLAN.md. Xem kỹ video card deck trong reference/ rồi tái tạo bằng GSAP + CSS 3D (không dùng WebGL):
1. Một xấp card (ảnh cover dự án từ projects.ts) nằm chồng giữa màn hình, bay lên từ dưới khi section vào view.
2. Cuộn tiếp: card xoè ra hình quạt.
3. Cuộn tiếp: card xếp thành vòng tròn 3D (perspective, rotateY theo góc, translateZ theo bán kính) và quay theo cuộn.
Dùng một ScrollTrigger timeline pin + scrub (cuộn vẫn tự nhiên, không khoá). Chỉ animate transform/opacity, dùng will-change hợp lý.
Mỗi card là link tới trang dự án, có focus state bằng bàn phím.
Mobile: giảm số card và bán kính, hoặc thay bằng carousel vuốt đơn giản. Reduced-motion: hiện lưới card tĩnh.
Đưa plan trước, code sau. Build, commit.
```

**Bạn kiểm tra:** so cạnh video ref, chỉnh tốc độ/độ cong bằng lời ("xoè rộng hơn", "quay chậm lại").

---

## Phase 6 — Gallery đổi bố cục (scatter → circle → row)

**Prompt 6 (dùng Plan mode):**
```
Phase 6 trong PLAN.md. Xem video gallery trong reference/. Làm section gallery dùng GSAP Flip:
- 3 trạng thái bố cục: scatter (ảnh rải ngẫu nhiên có kiểm soát), circle (xếp vòng tròn), row (hàng ngang).
- Chuyển trạng thái theo cuộn (ScrollTrigger) VÀ có nút bấm chuyển layout để người dùng chủ động, nút có trạng thái active rõ ràng.
- Vị trí scatter tính theo seed cố định để không nhảy lung tung giữa các lần tải.
- Tính lại khi resize. Mobile: chỉ dùng row/lưới. Reduced-motion: đổi layout không animation.
Build, commit.
```

---

## Phase 7 — Trang dự án + chuyển trang

**Prompt 7 (dùng Plan mode):**
```
Phase 7 trong PLAN.md. Làm route /work/[slug] đọc từ projects.ts (generateStaticParams):
- Bố cục case study theo mục 6.3 CLAUDE.md: bối cảnh, vai trò của mình, quá trình, hình ảnh/video, kết quả (chỉ nội dung thật hoặc placeholder rõ ràng).
- Ảnh dùng next/image, video lazy-load.
- Chuyển trang mượt: ảnh cover từ trang chủ "bay" sang hero của trang dự án (Flip hoặc View Transitions API, chọn cách ổn định nhất với App Router và giải thích).
- Link "Next project" ở cuối. Nút Back hoạt động đúng, scroll về đầu trang, ScrollTrigger được dọn sạch.
Build, commit.
```

---

## Phase 8 — Navigation, About, Contact

**Prompt 8:**
```
Phase 8 trong PLAN.md. Làm:
- Header/nav cố định gọn (Work, About, Contact), menu mobile mở toàn màn hình có animation, đóng bằng Esc, focus trap đúng.
- Section About/Capabilities ngắn gọn từ content-raw/.
- Section Contact: email lớn có hiệu ứng hover, nút copy email, link social thật.
- Footer.
Không bịa nội dung. Build, commit.
```

---

## Phase 9 — QA & tối ưu

**Prompt 9:**
```
Phase 9 trong PLAN.md. Dùng playwright (hoặc chrome-browser) để kiểm tra toàn site ở 375px, 768px, 1440px:
- Chụp màn hình từng section, tìm chữ đè nhau, tràn ngang, ảnh vỡ, lỗi console.
- Thử điều hướng chỉ bằng bàn phím, kiểm tra focus.
- Bật emulate prefers-reduced-motion và kiểm tra lại.
- Chạy Lighthouse (performance, accessibility), mục tiêu ≥ 90; tối ưu ảnh, font, bundle GSAP nếu cần.
Lập danh sách vấn đề, sửa lần lượt, báo cáo theo mục 11 "Definition of done" của CLAUDE.md, ghi rõ mục nào chưa kiểm được. Commit.
```

---

## Phase 10 — Đưa lên mạng

**Prompt 10:**
```
Phase 10 trong PLAN.md. Push nhánh hiện tại lên GitHub (benzenzz/portfolio-website-piti). Hướng dẫn mình từng bước deploy lên Vercel: đăng nhập bằng GitHub, import repo, cấu hình mặc định Next.js. Thêm metadata (title, description, Open Graph image, favicon) và sitemap trước khi deploy.
```

---

## Mẹo khi làm

- **Sai thì quay lại được:** mỗi phase đều commit, nên `git log` + nhờ Claude "quay về commit trước" khi hỏng.
- **Góp ý bằng hình:** chụp màn hình rồi kéo vào khung chat Claude Code, kèm "chỗ này muốn giống giây 0:05 trong video ref".
- **Chưa có nội dung thật** cũng cứ làm tới Phase 6, sau đó dán nội dung vào content-raw/ và nói "thay placeholder bằng nội dung thật trong content-raw/".
- Nếu Claude Code định cài thêm thư viện lạ (Three.js, Framer Motion...), hỏi nó lý do trước khi đồng ý.
