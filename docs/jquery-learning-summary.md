# jQuery Learning Summary

## Overview
jQuery is a fast, small, and feature-rich JavaScript library that simplifies HTML document traversing, event handling, animating, and Ajax interactions. While modern JavaScript has reduced the need for jQuery, it's still used in the Aplikasi Ujian Sekolah Kedinasan application.

## jQuery Basics

### 1. Including jQuery

```html
<!-- CDN -->
<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>

<!-- Local -->
<script src="js/jquery.min.js"></script>
```

### 2. Document Ready

```javascript
// Traditional
$(document).ready(function() {
    // Code here
});

// Shorthand
$(function() {
    // Code here
});

// Modern alternative (DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function() {
    // Code here
});
```

### 3. Selectors

```javascript
// ID selector
$('#myId')

// Class selector
$('.myClass')

// Element selector
$('div')

// Attribute selector
$('[data-id="123"]')
$('[type="text"]')

// Multiple selectors
$('.class1, .class2')

// Descendant selector
$('parent child')

// Direct child selector
$('parent > child')

// Next sibling
$('.class + .next')

// All siblings
$('.class ~ .sibling')

// First/last
$('li:first')
$('li:last')

// Even/odd
$('tr:even')
$('tr:odd')

// Contains text
$('div:contains("Hello")')

// Has element
$('div:has(p)')

// Hidden/visible
$('div:hidden')
$('div:visible')
```

### 4. DOM Manipulation

```javascript
// Get/Set text
$('#element').text('Hello');
const text = $('#element').text();

// Get/Set HTML
$('#element').html('<strong>Bold</strong>');
const html = $('#element').html();

// Get/Set value
$('#input').val('Hello');
const value = $('#input').val();

// Get/Set attribute
$('#image').attr('src', 'image.jpg');
const src = $('#image').attr('src');

// Get/Set data attribute
$('#element').data('id', 123);
const id = $('#element').data('id');

// Get/Set property (for boolean attributes)
$('#checkbox').prop('checked', true);
const checked = $('#checkbox').prop('checked');

// Add class
$('#element').addClass('my-class');

// Remove class
$('#element').removeClass('my-class');

// Toggle class
$('#element').toggleClass('my-class');

// Check if has class
if ($('#element').hasClass('my-class')) {
    // ...
}

// Append
$('#parent').append('<div>Child</div>');

// Prepend
$('#parent').prepend('<div>Child</div>');

// Append to
$('<div>Child</div>').appendTo('#parent');

// Before
$('#element').before('<div>Before</div>');

// After
$('#element').after('<div>After</div>');

// Remove
$('#element').remove();

// Empty
$('#parent').empty();

// Clone
$('#element').clone();

// Replace with
$('#element').replaceWith('<div>New</div>');

// Wrap
$('#element').wrap('<div class="wrapper"></div>');

// Unwrap
$('#element').unwrap();
```

### 5. Event Handling

```javascript
// Click event
$('#button').click(function() {
    console.log('Clicked');
});

// Alternative on method
$('#button').on('click', function() {
    console.log('Clicked');
});

// Event with data
$('#button').on('click', { name: 'John' }, function(event) {
    console.log(event.data.name); // John
});

// Multiple events
$('#element').on('click mouseenter', function() {
    // ...
});

// Event delegation
$(document).on('click', '.dynamic-button', function() {
    // ...
});

// Off (remove event)
$('#button').off('click');

// One (execute once)
$('#button').one('click', function() {
    console.log('Clicked once');
});

// Common events
$('#element').hover(
    function() { console.log('Mouse enter'); },
    function() { console.log('Mouse leave'); }
);

$('#input').focus(function() {
    console.log('Focused');
});

$('#input').blur(function() {
    console.log('Blurred');
});

$('#form').submit(function(event) {
    event.preventDefault();
    console.log('Submitted');
});

$(window).scroll(function() {
    console.log('Scrolled');
});

$(document).ready(function() {
    console.log('DOM ready');
});

// Prevent default
$('#link').click(function(event) {
    event.preventDefault();
});

// Stop propagation
$('#child').click(function(event) {
    event.stopPropagation();
});
```

### 6. Effects and Animations

```javascript
// Show/Hide
$('#element').show();
$('#element').hide();
$('#element').toggle();

// With speed and callback
$('#element').show(1000, function() {
    console.log('Shown');
});

// Fade
$('#element').fadeIn();
$('#element').fadeOut();
$('#element').fadeToggle();
$('#element').fadeTo('slow', 0.5); // Opacity 0.5

// Slide
$('#element').slideDown();
$('#element').slideUp();
$('#element').slideToggle();

// Custom animation
$('#element').animate({
    width: '500px',
    height: '300px',
    opacity: 0.5
}, 1000, function() {
    console.log('Animation complete');
});

// Stop animation
$('#element').stop();

// Delay
$('#element').delay(1000).fadeOut();

// Finish
$('#element').finish();
```

### 7. AJAX

```javascript
// GET request
$.ajax({
    url: 'https://api.example.com/data',
    method: 'GET',
    dataType: 'json',
    success: function(data) {
        console.log(data);
    },
    error: function(xhr, status, error) {
        console.error(error);
    }
});

// Shorthand GET
$.get('https://api.example.com/data', function(data) {
    console.log(data);
}, 'json');

// POST request
$.ajax({
    url: 'https://api.example.com/data',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ name: 'John', age: 30 }),
    dataType: 'json',
    success: function(data) {
        console.log(data);
    },
    error: function(xhr, status, error) {
        console.error(error);
    }
});

// Shorthand POST
$.post('https://api.example.com/data', { name: 'John', age: 30 }, function(data) {
    console.log(data);
}, 'json');

// With headers
$.ajax({
    url: 'https://api.example.com/data',
    method: 'GET',
    headers: {
        'Authorization': 'Bearer token',
        'X-Custom-Header': 'value'
    },
    success: function(data) {
        console.log(data);
    }
});

// Promise interface
$.ajax({
    url: 'https://api.example.com/data',
    method: 'GET'
})
    .done(function(data) {
        console.log(data);
    })
    .fail(function(xhr, status, error) {
        console.error(error);
    })
    .always(function() {
        console.log('Complete');
    });

// Load HTML
$('#container').load('content.html');

// Get JSON
$.getJSON('https://api.example.com/data', function(data) {
    console.log(data);
});

// Get script
$.getScript('script.js', function() {
    console.log('Script loaded');
});
```

### 8. Traversing

```javascript
// Find descendants
$('#parent').find('.child');

// Direct children
$('#parent').children();

// Parent
$('#child').parent();

// All parents
$('#child').parents();

// Specific parent
$('#child').parents('.parent-class');

// Closest ancestor
$('#child').closest('.ancestor');

// Next sibling
$('#element').next();

// Next all siblings
$('#element').nextAll();

// Previous sibling
$('#element').prev();

// Previous all siblings
$('#element').prevAll();

// Siblings
$('#element').siblings();

// First element
$('.item').first();

// Last element
$('.item').last();

// Element at index
$('.item').eq(2);

// Filter
$('.item').filter('.active');

// Not
$('.item').not('.active');

// Has
$('div').has('p');

// Add to selection
$('.item').add('.another');

// End (return to previous selection)
$('.item').find('.child').end();
```

### 9. Iteration

```javascript
// Each
$('.item').each(function(index, element) {
    console.log(index, $(element).text());
});

// Map
const texts = $('.item').map(function(index, element) {
    return $(element).text();
}).get(); // Convert to array

// Filter
const activeItems = $('.item').filter(function() {
    return $(this).hasClass('active');
});

// Length
const count = $('.item').length;
```

### 10. CSS Manipulation

```javascript
// Get CSS property
const color = $('#element').css('color');

// Set CSS property
$('#element').css('color', 'red');

// Set multiple properties
$('#element').css({
    'color': 'red',
    'background': 'blue',
    'font-size': '16px'
});

// Add style
$('#element').css('font-weight', 'bold');

// Remove style
$('#element').css('font-weight', '');

// Get/set width/height
const width = $('#element').width();
const height = $('#element').height();

$('#element').width(500);
$('#element').height(300);

// Include padding
const innerWidth = $('#element').innerWidth();
const innerHeight = $('#element').innerHeight();

// Include padding and border
const outerWidth = $('#element').outerWidth();
const outerHeight = $('#element').outerHeight();

// Include padding, border, and margin
const outerWidthTrue = $('#element').outerWidth(true);
const outerHeightTrue = $('#element').outerHeight(true);

// Get/set position
const position = $('#element').position();
const offset = $('#element').offset();

$('#element').offset({ top: 100, left: 100 });

// Scroll
$('#element').scrollTop(100);
$('#element').scrollLeft(100);

const scrollTop = $('#element').scrollTop();
const scrollLeft = $('#element').scrollLeft();
```

### 11. Form Handling

```javascript
// Serialize form
const formData = $('#myForm').serialize();
// name=John&age=30

// Serialize array
const formDataArray = $('#myForm').serializeArray();
// [{name: 'name', value: 'John'}, {name: 'age', value: '30'}]

// Get form values as object
const formDataObject = {};
$('#myForm').serializeArray().forEach(function(item) {
    formDataObject[item.name] = item.value;
});

// Reset form
$('#myForm')[0].reset();
// or
$('#myForm').trigger('reset');

// Validate
if ($('#myForm')[0].checkValidity()) {
    // Form is valid
}

// Focus
$('#input').focus();
$('#input').blur();

// Select
$('#select').val('option2');

// Checkbox
$('#checkbox').prop('checked', true);
const isChecked = $('#checkbox').prop('checked');

// Radio
$('input[name="gender"][value="male"]').prop('checked', true);
const gender = $('input[name="gender"]:checked').val();
```

### 12. Chaining

```javascript
// Chain multiple methods
$('#element')
    .addClass('active')
    .css('color', 'red')
    .fadeIn(500)
    .click(function() {
        $(this).fadeOut(500);
    });
```

### 13. Utilities

```javascript
// Each
$.each([1, 2, 3], function(index, value) {
    console.log(index, value);
});

$.each({ name: 'John', age: 30 }, function(key, value) {
    console.log(key, value);
});

// Map
const doubled = $.map([1, 2, 3], function(value, index) {
    return value * 2;
});

// Grep (filter)
const filtered = $.grep([1, 2, 3, 4, 5], function(value) {
    return value > 2;
});

// Extend (merge objects)
const merged = $.extend({}, obj1, obj2, obj3);

// Make array
const arr = $.makeArray($('div'));

// In array
if ($.inArray(value, array) !== -1) {
    // Found
}

// Is array
if ($.isArray(array)) {
    // Is array
}

// Is function
if ($.isFunction(func)) {
    // Is function
}

// Is empty
if ($.isEmptyObject(obj)) {
    // Is empty
}

// Is numeric
if ($.isNumeric(value)) {
    // Is numeric
}

// Is plain object
if ($.isPlainObject(obj)) {
    // Is plain object
}

// Trim
const trimmed = $.trim('  hello  ');

// Type
const type = $.type(value);

// Unique
const unique = $.unique(array);

// Parse JSON
const obj = $.parseJSON('{"name":"John"}');

// Stringify JSON
const json = $.stringify({ name: 'John' });

// No conflict mode
const jq = $.noConflict();
jq('#element').text('Hello');
```

### 14. Plugins

```javascript
// Using a plugin
$('#element').pluginName({
    option1: 'value1',
    option2: 'value2'
});

// Creating a simple plugin
(function($) {
    $.fn.highlight = function(options) {
        const settings = $.extend({
            color: 'yellow',
            background: 'black'
        }, options);
        
        return this.each(function() {
            $(this).css({
                color: settings.color,
                background: settings.background
            });
        });
    };
})(jQuery);

// Usage
$('#element').highlight({
    color: 'red',
    background: 'blue'
});
```

## jQuery vs Modern JavaScript

### When to Use jQuery:
- Legacy codebase that already uses jQuery
- Need for cross-browser compatibility (older browsers)
- Complex DOM manipulation
- AJAX requests with simple syntax

### When to Use Modern JavaScript:
- New projects
- Better performance
- Smaller bundle size
- Modern browser support only

### Migration Examples:

```javascript
// jQuery
$('#element').text('Hello');

// Modern JavaScript
document.getElementById('element').textContent = 'Hello';
// or
document.querySelector('#element').textContent = 'Hello';

// jQuery
$('.element').addClass('active');

// Modern JavaScript
document.querySelectorAll('.element').forEach(el => el.classList.add('active'));

// jQuery
$('#element').on('click', function() {
    console.log('Clicked');
});

// Modern JavaScript
document.getElementById('element').addEventListener('click', function() {
    console.log('Clicked');
});

// jQuery
$.ajax({
    url: '/api/data',
    method: 'GET',
    success: function(data) {
        console.log(data);
    }
});

// Modern JavaScript
fetch('/api/data')
    .then(response => response.json())
    .then(data => console.log(data));

// jQuery
$('#element').fadeIn(500);

// Modern JavaScript
document.getElementById('element').style.transition = 'opacity 0.5s';
document.getElementById('element').style.opacity = '1';
```

## jQuery in Aplikasi Ujian Sekolah Kedinasan

### Current Usage:
- Limited usage in the application
- Mostly replaced by modern JavaScript (ES6+)
- Some legacy code may still use jQuery for compatibility

### Migration Strategy:
1. Gradually replace jQuery with modern JavaScript
2. Use modern alternatives (querySelector, fetch API, etc.)
3. Keep jQuery for specific plugins if needed
4. Test thoroughly after migration

## Resources

**Official Documentation:**
- [jQuery Documentation](https://api.jquery.com/)
- [jQuery Learning Center](https://learn.jquery.com/)

**Learning Resources:**
- [jQuery Tutorial - W3Schools](https://www.w3schools.com/jquery/)
- [jQuery Basics - MDN](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/jQuery)

**Tools:**
- [jQuery CDN](https://code.jquery.com/)
- [jQuery Migrate](https://github.com/jquery/jquery-migrate/)
