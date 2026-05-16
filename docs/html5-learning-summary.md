# HTML5 Learning Summary

## Overview
HTML5 is the latest version of the HTML standard, providing semantic elements, form validation, multimedia support, and APIs for building modern web applications. It is the most basic building block of the Web, defining the meaning and structure of web content.

## Key Concepts

### 1. Semantic HTML Elements
Semantic elements clearly describe their meaning to both the browser and the developer.

**Document Structure:**
- `<html>` - Root element
- `<head>` - Metadata, title, styles, scripts
- `<body>` - Visible content

**Semantic Sectioning:**
- `<header>` - Header or introductory content
- `<nav>` - Navigation links
- `<main>` - Main content area
- `<article>` - Self-contained content
- `<section>` - Thematic grouping of content
- `<aside>` - Content tangentially related to main content
- `<footer>` - Footer information

**Text Content:**
- `<h1>` to `<h6>` - Headings (h1 is most important)
- `<p>` - Paragraph
- `<span>` - Inline container
- `<div>` - Generic container
- `<strong>` - Important text (bold)
- `<em>` - Emphasized text (italic)
- `<blockquote>` - Quoted text
- `<code>` - Code snippet
- `<pre>` - Preformatted text

**Lists:**
- `<ul>` - Unordered list
- `<ol>` - Ordered list
- `<li>` - List item
- `<dl>` - Description list
- `<dt>` - Description term
- `<dd>` - Description definition

**Tables:**
- `<table>` - Table container
- `<thead>` - Table header
- `<tbody>` - Table body
- `<tfoot>` - Table footer
- `<tr>` - Table row
- `<th>` - Table header cell
- `<td>` - Table data cell

**Forms:**
- `<form>` - Form container
- `<input>` - Input field
- `<textarea>` - Multiline text input
- `<select>` - Dropdown list
- `<option>` - Dropdown option
- `<button>` - Button
- `<label>` - Form label
- `<fieldset>` - Group related form elements
- `<legend>` - Fieldset caption

**Multimedia:**
- `<img>` - Image
- `<audio>` - Audio content
- `<video>` - Video content
- `<canvas>` - Drawing canvas
- `<svg>` - Scalable Vector Graphics

**Interactive Elements:**
- `<a>` - Hyperlink
- `<details>` - Collapsible content
- `<summary>` - Summary/details heading
- `<dialog>` - Dialog box
- `<progress>` - Progress bar
- `<meter>` - Gauge/meter

### 2. HTML5 Attributes

**Global Attributes:**
- `id` - Unique identifier
- `class` - CSS class
- `style` - Inline CSS
- `title` - Tooltip text
- `lang` - Language code
- `dir` - Text direction (ltr, rtl)
- `data-*` - Custom data attributes
- `aria-*` - ARIA accessibility attributes
- `hidden` - Hidden element
- `tabindex` - Tab navigation order
- `role` - ARIA role

**Form Attributes:**
- `type` - Input type (text, email, password, number, date, etc.)
- `name` - Form field name
- `value` - Field value
- `placeholder` - Placeholder text
- `required` - Required field
- `pattern` - Validation pattern (regex)
- `min`, `max` - Minimum/maximum values
- `step` - Step value
- `disabled` - Disabled field
- `readonly` - Read-only field
- `autofocus` - Auto-focus on load
- `autocomplete` - Autocomplete behavior
- `multiple` - Allow multiple values

**Link Attributes:**
- `href` - URL destination
- `target` - Where to open link (_blank, _self, _parent, _top)
- `rel` - Relationship to target
- `download` - Download file

**Image Attributes:**
- `src` - Image source URL
- `alt` - Alternative text (required for accessibility)
- `width`, `height` - Dimensions
- `loading` - Lazy loading (lazy, eager)
- `srcset` - Responsive image sources

**Script Attributes:**
- `src` - Script source URL
- `type` - Script type (module, text/javascript)
- `async` - Load asynchronously
- `defer` - Defer execution
- `integrity` - Subresource integrity (SRI)

### 3. HTML5 Form Validation

HTML5 provides built-in form validation features:

**Input Types:**
- `text` - Plain text
- `password` - Password field
- `email` - Email address
- `tel` - Telephone number
- `url` - URL
- `number` - Numeric input
- `range` - Range slider
- `date` - Date picker
- `time` - Time picker
- `datetime-local` - Date and time
- `month` - Month picker
- `week` - Week picker
- `color` - Color picker
- `file` - File upload
- `checkbox` - Checkbox
- `radio` - Radio button
- `search` - Search field

**Validation Attributes:**
- `required` - Field must be filled
- `pattern` - Regex pattern validation
- `min`, `max` - Value range
- `minlength`, `maxlength` - Character count
- `step` - Numeric step value

**Constraint Validation API:**
```javascript
// Check validity
input.checkValidity()
input.reportValidity()

// Get validation message
input.validationMessage

// Custom validation
input.setCustomValidity(message)
```

### 4. HTML5 Accessibility (ARIA)

**ARIA Roles:**
- `role="button"` - Button behavior
- `role="navigation"` - Navigation
- `role="main"` - Main content
- `role="complementary"` - Aside content
- `role="search"` - Search
- `role="alert"` - Alert message
- `role="dialog"` - Dialog
- `role="progressbar"` - Progress bar

**ARIA States and Properties:**
- `aria-label` - Accessible label
- `aria-labelledby` - Labelled by another element
- `aria-describedby` - Described by another element
- `aria-expanded` - Expanded state (true/false)
- `aria-hidden` - Hidden from screen readers
- `aria-live` - Live region updates (polite, assertive, off)
- `aria-disabled` - Disabled state
- `aria-checked` - Checked state
- `aria-selected` - Selected state
- `aria-pressed` - Pressed state

**Best Practices:**
- Use semantic HTML elements first
- Add ARIA attributes only when needed
- Provide alt text for images
- Use proper heading hierarchy (h1-h6)
- Ensure keyboard navigation
- Provide focus indicators
- Test with screen readers

### 5. HTML5 Meta Tags

**Viewport Meta Tag:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**SEO Meta Tags:**
```html
<meta name="description" content="Page description">
<meta name="keywords" content="keywords">
<meta name="author" content="Author name">
```

**Open Graph (Social Media):**
```html
<meta property="og:title" content="Title">
<meta property="og:description" content="Description">
<meta property="og:image" content="image.jpg">
<meta property="og:url" content="https://example.com">
```

**Twitter Card:**
```html
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="Title">
<meta name="twitter:description" content="Description">
<meta name="twitter:image" content="image.jpg">
```

**PWA Meta Tags:**
```html
<meta name="theme-color" content="#1e40af">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="App Name">
```

**Canonical URL:**
```html
<link rel="canonical" href="https://example.com/page">
```

### 6. HTML5 APIs

**Local Storage:**
```javascript
localStorage.setItem('key', 'value');
localStorage.getItem('key');
localStorage.removeItem('key');
localStorage.clear();
```

**Session Storage:**
```javascript
sessionStorage.setItem('key', 'value');
sessionStorage.getItem('key');
sessionStorage.removeItem('key');
sessionStorage.clear();
```

**Geolocation API:**
```javascript
navigator.geolocation.getCurrentPosition(success, error);
```

**Drag and Drop API:**
```html
<div draggable="true" ondragstart="drag(event)">Drag me</div>
<div ondrop="drop(event)" ondragover="allowDrop(event)">Drop here</div>
```

**Web Storage Events:**
```javascript
window.addEventListener('storage', function(e) {
    console.log('Storage changed', e);
});
```

### 7. HTML5 Best Practices

**Document Structure:**
```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
    <meta name="description" content="Page description">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>Navigation</nav>
    </header>
    <main>
        <h1>Main Heading</h1>
        <article>
            <h2>Article Heading</h2>
            <p>Content</p>
        </article>
    </main>
    <footer>
        <p>Footer content</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>
```

**Accessibility Best Practices:**
1. Use semantic HTML elements
2. Provide alt text for all images
3. Use proper heading hierarchy
4. Ensure keyboard navigation
5. Provide focus indicators
6. Use ARIA attributes when needed
7. Test with screen readers
8. Ensure sufficient color contrast
9. Provide skip navigation links
10. Use form labels properly

**Performance Best Practices:**
1. Minify HTML, CSS, and JavaScript
2. Use lazy loading for images
3. Optimize image sizes
4. Use async/defer for scripts
5. Minimize HTTP requests
6. Use CDN for libraries
7. Implement caching
8. Use proper DOCTYPE
9. Validate HTML
10. Use semantic markup

**Security Best Practices:**
1. Validate all user input
2. Escape user-generated content
3. Use HTTPS
4. Implement CSP (Content Security Policy)
5. Use secure cookies
6. Sanitize HTML
7. Use proper HTTP headers
8. Implement CSRF protection
9. Keep dependencies updated
10. Use secure authentication

### 8. HTML5 in Aplikasi Ujian Sekolah Kedinasan

**Current Usage:**
- Semantic HTML5 elements (header, nav, main, section, article, footer)
- Form validation with HTML5 attributes
- Accessibility features (ARIA labels, semantic tags)
- Meta tags for PWA and SEO
- Local Storage for client-side data
- Responsive viewport meta tag

**Implementation Examples:**
- `admin/admin.html` - Uses semantic structure for admin panel
- `participant/ujian.html` - Form validation for exam interface
- `login.html` - Accessible login form
- All pages - Responsive viewport configuration

## Resources

**Official Documentation:**
- [MDN Web Docs - HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [W3C HTML Specification](https://html.spec.whatwg.org/)
- [WHATWG HTML Living Standard](https://html.spec.whatwg.org/)

**Learning Resources:**
- [HTML5 Tutorial - W3Schools](https://www.w3schools.com/html/)
- [HTML5 Crash Course - YouTube](https://www.youtube.com/results?search_query=html5+crash+course)
- [HTML5 Best Practices - MDN](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto)

**Tools:**
- [HTML Validator - W3C](https://validator.w3.org/)
- [Lighthouse - Chrome DevTools](https://developers.google.com/web/tools/lighthouse)
- [ axe DevTools - Accessibility Testing](https://www.deque.com/axe/devtools/)
