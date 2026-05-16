# Ringkasan Pembelajaran Bootstrap 5.3

**Tanggal:** 16 Mei 2026  
**Sumber:** https://getbootstrap.com/docs/5.3/  
**Tujuan:** Memahami Bootstrap 5.3 sebelum implementasi ke aplikasi

---

## 1. Bootstrap 5.3 Overview

### Quickstart
- Bootstrap 5.3 menggunakan HTML5, CSS, dan JavaScript
- Include CSS di `<head>` dan JS bundle sebelum `</body>`
- JS bundle sudah termasuk Popper (untuk dropdowns, popovers, tooltips)
- Versi terbaru: 5.3.8

### Struktur HTML Dasar
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bootstrap demo</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <h1>Hello, world!</h1>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

---

## 2. Modals

### How it Works
- Modals dibangun dengan HTML, CSS, dan JavaScript
- Positioned over everything else di document
- Remove scroll dari `<body>` agar modal content yang scroll
- **Klik backdrop akan otomatis close modal**
- Bootstrap hanya support **satu modal window at a time** (nested modals tidak didukung)
- Modals use `position: fixed` - sebaiknya place modal HTML di top-level position
- Ada caveats di mobile devices
- HTML `autofocus` attribute tidak bekerja di Bootstrap modals - perlu custom JavaScript

### Best Practices Modals
1. **Single Modal Rule:** Hanya satu modal aktif dalam satu waktu
2. **Placement:** Place modal HTML di top-level position (bukan dalam fixed element lain)
3. **Dismiss Action:** Selalu include dismiss action di header atau explicit dismiss action di body
4. **Accessibility:** Modal title sebaiknya menggunakan `<h1>` (bukan `<h5>`) karena modal adalah context terpisah
5. **Scrolling:** Gunakan `tabindex="-1"` untuk proper keyboard navigation

### Structure Modal
```html
<div class="modal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title">Modal title</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Modal body text goes here.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>
```

### Modal Options
- **Static Backdrop:** `data-bs-backdrop="static"` - modal tidak bisa ditutup dengan klik backdrop
- **Keyboard Disable:** `data-bs-keyboard="false"` - modal tidak bisa ditutup dengan ESC
- **Sizes:** `modal-sm`, `modal-lg`, `modal-xl`
- **Centered:** `modal-dialog-centered`
- **Scrolling:** `modal-dialog-scrollable` untuk long content
- **Fullscreen:** `modal-fullscreen` dan responsive variants

### JavaScript Usage
```javascript
// Via data attributes
<button type="button" data-bs-toggle="modal" data-bs-target="#myModal">
  Launch demo modal
</button>

// Via JavaScript
const myModal = new bootstrap.Modal(document.getElementById('myModal'))
myModal.show()

// With options
const myModal = new bootstrap.Modal(document.getElementById('myModal'), {
  keyboard: false,
  backdrop: 'static'
})

// Events
myModal.addEventListener('hidden.bs.modal', event => {
  // Do something when modal is hidden
})
```

---

## 3. Alerts

### Overview
Alerts menyediakan contextual feedback messages untuk typical user actions
- Built entirely with CSS (no JavaScript required untuk basic usage)
- 8 semantic variants: primary, secondary, success, danger, warning, info, light, dark

### Basic Alert
```html
<div class="alert alert-primary" role="alert">
  A simple primary alert—check it out!
</div>
```

### Dismissible Alerts
```html
<div class="alert alert-warning alert-dismissible fade show" role="alert">
  <strong>Holy guacamole!</strong> You should check in on some of those fields below.
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
```

### JavaScript Behavior
```javascript
// Initialize all dismissible alerts
const alertList = document.querySelectorAll('.alert')
const alerts = [...alertList].map(element => new bootstrap.Alert(element))

// Triggers
<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>

// Methods
alert.close() // Close alert manually

// Events
alert.addEventListener('closed.bs.alert', event => {
  // Do something when alert is closed
})
```

---

## 4. Toasts

### Overview
Toasts adalah lightweight notification messages
- Push notifications ke visitors
- Fully customizable
- Support stacking dan multiple toasts

### Basic Toast
```html
<div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
  <div class="toast-header">
    <strong class="me-auto">Bootstrap</strong>
    <small>11 mins ago</small>
    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
  </div>
  <div class="toast-body">
    Hello, world! This is a toast message.
  </div>
</div>
```

### Toast Container
```html
<div class="toast-container position-fixed bottom-0 end-0 p-3">
  <!-- Toasts go here -->
</div>
```

### JavaScript Usage
```javascript
// Initialize
const toastEl = document.getElementById('liveToast')
const toast = new bootstrap.Toast(toastEl)

// Show
toast.show()

// Hide
toast.hide()

// Options
const toast = new bootstrap.Toast(toastEl, {
  animation: true,
  autohide: true,
  delay: 5000
})

// Events
toastEl.addEventListener('shown.bs.toast', () => {
  // Do something
})
```

### Accessibility
- Include `aria-live="assertive"` dan `aria-atomic="true"` untuk screen readers
- Live region harus ada di markup sebelum toast generated
- Tidak generate both toast container dan toast secara bersamaan (screen readers tidak akan announce)

---

## 5. Spinners

### Overview
Spinners indicate loading state
- Built entirely with HTML and CSS (no JavaScript)
- Two types: Border spinner dan Growing spinner

### Border Spinner
```html
<div class="spinner-border" role="status">
  <span class="visually-hidden">Loading...</span>
</div>
```

### Growing Spinner
```html
<div class="spinner-grow" role="status">
  <span class="visually-hidden">Loading...</span>
</div>
```

### Colors
```html
<div class="spinner-border text-primary" role="status"></div>
<div class="spinner-border text-secondary" role="status"></div>
<div class="spinner-border text-success" role="status"></div>
<!-- etc -->
```

### Alignment
```html
<!-- Flexbox centering -->
<div class="d-flex justify-content-center">
  <div class="spinner-border" role="status"></div>
</div>

<!-- Margin centering -->
<div class="spinner-border m-5" role="status"></div>
```

### Size
```html
<div class="spinner-border spinner-border-sm" role="status"></div> <!-- small -->
<div class="spinner-border" role="status"></div> <!-- default -->
```

### Buttons with Spinners
```html
<button class="btn btn-primary" type="button" disabled>
  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
  <span class="visually-hidden">Loading...</span>
  Loading...
</button>
```

---

## 6. Best Practices untuk Aplikasi Web

### Modals
1. **Gunakan untuk:** Critical confirmations, complex forms, detailed information
2. **Jangan gunakan untuk:** Simple notifications (gunakan toast/alert)
3. **Single modal rule:** Hanya satu modal aktif dalam satu waktu
4. **Backdrop options:** Gunakan `data-bs-backdrop="static"` untuk critical actions
5. **Keyboard support:** Enable ESC untuk dismiss (default) kecuali critical
6. **Accessibility:** Gunakan `tabindex="-1"` dan proper aria labels
7. **Position:** Place modal HTML di top-level, bukan nested

### Alerts vs Toasts vs Modals

| Component | Gunakan Untuk | Persistent? | User Action Required? |
|-----------|---------------|-------------|----------------------|
| **Alert** | Page-level notifications, errors | Yes (manual dismiss) | Optional |
| **Toast** | Temporary notifications, success messages | No (auto-hide) | No |
| **Modal** | Critical actions, complex forms, detailed info | Yes (manual dismiss) | Yes (usually) |

### Spinners
1. **Gunakan untuk:** Loading states, processing indicators
2. **Placement:** Centered di modal atau inline dengan button
3. **Accessibility:** Selalu include `visually-hidden` text untuk screen readers
4. **Button state:** Disable button saat menampilkan spinner

### Performance
1. **Lazy load modals:** Don't load semua modal content sekaligus
2. **Clean up:** Destroy modal instances setelah tidak digunakan
3. **Event listeners:** Remove event listeners setelah use
4. **Animation:** Respect `prefers-reduced-motion` media query

### Accessibility
1. **ARIA labels:** Gunakan proper aria-labels dan roles
2. **Keyboard navigation:** Pastikan semua komponen bisa diakses dengan keyboard
3. **Screen readers:** Test dengan screen reader
4. **Focus management:** Proper focus trap di modals

---

## 7. Kesimpulan untuk Implementasi

### Rekomendasi untuk Aplikasi Ini

1. **Gunakan Toasts untuk:**
   - Success messages setelah save
   - Simple notifications
   - Non-blocking feedback

2. **Gunakan Modals untuk:**
   - Delete confirmations (critical)
   - Submit confirmations (critical)
   - Loading states untuk long operations
   - Complex forms
   - Detailed information display

3. **Gunakan Alerts untuk:**
   - Page-level error messages
   - Important warnings
   - Static information

4. **Gunakan Spinners untuk:**
   - Loading states dalam buttons
   - Loading states dalam modals
   - Inline loading indicators

### Prioritas Implementasi
1. **High Priority:** Toast notifications (menggantikan simple alerts)
2. **High Priority:** Modal confirmations untuk critical actions
3. **Medium Priority:** Loading modals dengan spinners
4. **Low Priority:** Alert optimizations

---

**Catatan:** Dokumen ini berdasarkan pembelajaran dari dokumentasi resmi Bootstrap 5.3.
