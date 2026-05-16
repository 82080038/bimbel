# JavaScript ES6+ Learning Summary

## Overview
JavaScript ES6 (ECMAScript 2015) and later versions introduced significant features that modernized JavaScript development. This document covers ES6+ features relevant to the Aplikasi Ujian Sekolah Kedinasan application.

## Key ES6+ Features

### 1. Let and Const
Block-scoped variable declarations replacing `var`.

```javascript
// var - function scoped (avoid)
var x = 10;

// let - block scoped, can be reassigned
let y = 20;
y = 30;

// const - block scoped, cannot be reassigned
const z = 40;
// z = 50; // Error: Assignment to constant variable
```

### 2. Arrow Functions
Concise function syntax with lexical `this` binding.

```javascript
// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// Single parameter (no parentheses needed)
const square = x => x * x;

// No parameters
const sayHello = () => console.log('Hello');

// Multi-line (needs return statement)
const calculate = (a, b) => {
    const result = a + b;
    return result * 2;
};

// Arrow functions don't have their own 'this'
const obj = {
    value: 10,
    getValue: function() {
        // Traditional function: 'this' refers to obj
        setTimeout(function() {
            console.log(this.value); // undefined
        }, 100);
        
        // Arrow function: 'this' is inherited from outer scope
        setTimeout(() => {
            console.log(this.value); // 10
        }, 100);
    }
};
```

### 3. Template Literals
String interpolation using backticks.

```javascript
const name = 'John';
const age = 30;

// Traditional string concatenation
const message = 'Hello, ' + name + '. You are ' + age + ' years old.';

// Template literal
const message = `Hello, ${name}. You are ${age} years old.`;

// Multi-line strings
const html = `
    <div>
        <h1>Title</h1>
        <p>Content</p>
    </div>
`;

// Expressions
const price = 100;
const tax = 0.1;
const total = `Total: $${price * (1 + tax)}`;
```

### 4. Destructuring
Extract values from arrays or objects.

```javascript
// Array destructuring
const numbers = [1, 2, 3, 4, 5];
const [first, second, ...rest] = numbers;
console.log(first); // 1
console.log(second); // 2
console.log(rest); // [3, 4, 5]

// Object destructuring
const user = {
    name: 'John',
    age: 30,
    email: 'john@example.com'
};
const { name, age, email } = user;
console.log(name); // John

// Renaming
const { name: userName, age: userAge } = user;

// Default values
const { name, role = 'user' } = user;

// Nested destructuring
const user = {
    address: {
        city: 'Jakarta',
        country: 'Indonesia'
    }
};
const { address: { city, country } } = user;

// Function parameter destructuring
function greet({ name, age }) {
    console.log(`Hello ${name}, you are ${age}`);
}
greet({ name: 'John', age: 30 });
```

### 5. Spread and Rest Operators
Spread (`...`) expands arrays/objects, rest (`...`) collects elements.

```javascript
// Spread operator - array
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]

// Spread operator - object
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const combined = { ...obj1, ...obj2 }; // { a: 1, b: 2, c: 3, d: 4 }

// Spread operator - function arguments
const numbers = [1, 2, 3];
const sum = (a, b, c) => a + b + c;
sum(...numbers); // 6

// Rest operator - collects remaining elements
const [first, ...rest] = [1, 2, 3, 4, 5];
console.log(first); // 1
console.log(rest); // [2, 3, 4, 5]

// Rest operator - function parameters
const sumAll = (...numbers) => numbers.reduce((sum, num) => sum + num, 0);
sumAll(1, 2, 3, 4, 5); // 15
```

### 6. Default Parameters
Set default values for function parameters.

```javascript
// Traditional approach
function greet(name) {
    name = name || 'Guest';
    console.log(`Hello ${name}`);
}

// ES6 default parameters
function greet(name = 'Guest', age = 0) {
    console.log(`Hello ${name}, you are ${age}`);
}
greet(); // Hello Guest, you are 0
greet('John'); // Hello John, you are 0
greet('John', 30); // Hello John, you are 30

// Default parameters with destructuring
function createUser({ name = 'Guest', age = 0, role = 'user' } = {}) {
    return { name, age, role };
}
```

### 7. Enhanced Object Literals
Concise syntax for object properties and methods.

```javascript
const name = 'John';
const age = 30;

// Property shorthand
const user = {
    name, // equivalent to name: name
    age,  // equivalent to age: age
    greet() { // method shorthand
        console.log(`Hello ${this.name}`);
    }
};

// Computed property names
const key = 'dynamic';
const obj = {
    [key]: 'value',
    ['computed_' + key]: 'computed value'
};

// Method shorthand
const calculator = {
    add(a, b) {
        return a + b;
    },
    subtract(a, b) {
        return a - b;
    }
};
```

### 8. Classes
Syntactic sugar for prototype-based inheritance.

```javascript
// Class declaration
class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }
    
    greet() {
        console.log(`Hello, ${this.name}`);
    }
    
    static createGuest() {
        return new User('Guest', 'guest@example.com');
    }
}

const user = new User('John', 'john@example.com');
user.greet(); // Hello, John
const guest = User.createGuest();

// Inheritance
class AdminUser extends User {
    constructor(name, email, permissions) {
        super(name, email);
        this.permissions = permissions;
    }
    
    hasPermission(permission) {
        return this.permissions.includes(permission);
    }
    
    greet() {
        super.greet();
        console.log('You are an admin');
    }
}

const admin = new AdminUser('Admin', 'admin@example.com', ['read', 'write']);
admin.greet();
console.log(admin.hasPermission('read')); // true
```

### 9. Modules
Import and export for code organization.

```javascript
// Exporting (user.js)
export const name = 'John';
export function greet(name) {
    console.log(`Hello ${name}`);
}
export default class User {
    // ...
}

// Importing
import User from './user.js';
import { name, greet } from './user.js';
import * as userModule from './user.js';

// Re-exporting
export { User } from './user.js';
export { default as AdminUser } from './admin.js';
```

### 10. Promises and Async/Await
Handle asynchronous operations.

```javascript
// Promise
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('Data loaded');
        }, 1000);
    });
};

fetchData()
    .then(data => console.log(data))
    .catch(error => console.error(error))
    .finally(() => console.log('Completed'));

// Async/Await
async function loadData() {
    try {
        const data = await fetchData();
        console.log(data);
    } catch (error) {
        console.error(error);
    } finally {
        console.log('Completed');
    }
}

// Parallel async operations
async function loadMultiple() {
    const [data1, data2, data3] = await Promise.all([
        fetchData(),
        fetchData(),
        fetchData()
    ]);
    return [data1, data2, data3];
}

// Race - first to complete wins
const result = await Promise.race([
    fetchData(),
    fetchData()
]);
```

### 11. Array Methods

```javascript
// map - transform array
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2); // [2, 4, 6, 8, 10]

// filter - filter array
const evens = numbers.filter(n => n % 2 === 0); // [2, 4]

// reduce - reduce to single value
const sum = numbers.reduce((acc, n) => acc + n, 0); // 15

// find - find first match
const found = numbers.find(n => n === 3); // 3

// findIndex - find index of first match
const index = numbers.findIndex(n => n === 3); // 2

// some - check if any match
const hasEven = numbers.some(n => n % 2 === 0); // true

// every - check if all match
const allPositive = numbers.every(n => n > 0); // true

// includes - check if value exists
const includesThree = numbers.includes(3); // true

// forEach - iterate
numbers.forEach(n => console.log(n));

// sort - sort array
const sorted = [...numbers].sort((a, b) => a - b);

// flat - flatten nested arrays
const nested = [1, [2, [3, [4]]]];
const flattened = nested.flat(2); // [1, 2, 3, [4]]

// flatMap - map then flatten
const doubledFlat = numbers.flatMap(n => [n, n * 2]); // [1, 2, 2, 4, 3, 6, 4, 8, 5, 10]
```

### 12. Object Methods

```javascript
const user = {
    name: 'John',
    age: 30,
    email: 'john@example.com'
};

// Object.keys - get keys
const keys = Object.keys(user); // ['name', 'age', 'email']

// Object.values - get values
const values = Object.values(user); // ['John', 30, 'john@example.com']

// Object.entries - get key-value pairs
const entries = Object.entries(user); // [['name', 'John'], ['age', 30], ['email', 'john@example.com']]

// Object.assign - merge objects
const merged = Object.assign({}, user, { role: 'admin' });

// Spread operator for merging (preferred)
const merged2 = { ...user, role: 'admin' };

// Object.fromEntries - convert entries to object
const fromEntries = Object.fromEntries(entries); // { name: 'John', age: 30, email: 'john@example.com' }
```

### 13. String Methods

```javascript
const text = 'Hello World';

// includes - check if string contains substring
const hasHello = text.includes('Hello'); // true

// startsWith - check if starts with
const startsHello = text.startsWith('Hello'); // true

// endsWith - check if ends with
const endsWorld = text.endsWith('World'); // true

// repeat - repeat string
const repeated = 'abc'.repeat(3); // 'abcabcabc'

// trim - remove whitespace
const trimmed = '  hello  '.trim(); // 'hello'
const trimStart = '  hello  '.trimStart(); // 'hello  '
const trimEnd = '  hello  '.trimEnd(); // '  hello'

// padStart/padEnd - pad string
const padded = '5'.padStart(2, '0'); // '05'
const paddedEnd = '5'.padEnd(3, '0'); // '500'

// split - split string
const parts = 'a,b,c'.split(','); // ['a', 'b', 'c']

// join - join array
const joined = ['a', 'b', 'c'].join(','); // 'a,b,c'

// replace - replace substring
const replaced = 'hello world'.replace('world', 'earth'); // 'hello earth'

// replaceAll - replace all occurrences (ES2021)
const replacedAll = 'aaa'.replaceAll('a', 'b'); // 'bbb'
```

### 14. Number Methods

```javascript
// isNaN - check if not a number
const notANumber = isNaN('hello'); // true

// isFinite - check if finite number
const finite = isFinite(100); // true

// parseInt - parse integer
const parsedInt = parseInt('42'); // 42

// parseFloat - parse float
const parsedFloat = parseFloat('3.14'); // 3.14

// toFixed - fixed decimal places
const fixed = (3.14159).toFixed(2); // '3.14'

// toPrecision - significant digits
const precision = (3.14159).toPrecision(3); // '3.14'

// Math methods
const max = Math.max(1, 2, 3); // 3
const min = Math.min(1, 2, 3); // 1
const random = Math.random(); // 0-1
const floor = Math.floor(3.9); // 3
const ceil = Math.ceil(3.1); // 4
const round = Math.round(3.5); // 4
const abs = Math.abs(-5); // 5
const pow = Math.pow(2, 3); // 8
const sqrt = Math.sqrt(16); // 4
```

### 15. Date Methods

```javascript
// Create date
const now = new Date();
const specific = new Date('2024-01-01');
const fromTimestamp = new Date(1609459200000);

// Get date parts
const year = now.getFullYear();
const month = now.getMonth(); // 0-11
const day = now.getDate();
const hours = now.getHours();
const minutes = now.getMinutes();
const seconds = now.getSeconds();

// Set date parts
now.setFullYear(2025);
now.setMonth(0); // January
now.setDate(1);

// Format date
const iso = now.toISOString(); // ISO string
const locale = now.toLocaleDateString('id-ID'); // Local format

// Date arithmetic
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
```

### 16. LocalStorage API

```javascript
// Set item
localStorage.setItem('key', 'value');
localStorage.setItem('user', JSON.stringify({ name: 'John', age: 30 }));

// Get item
const value = localStorage.getItem('key');
const user = JSON.parse(localStorage.getItem('user'));

// Remove item
localStorage.removeItem('key');

// Clear all
localStorage.clear();

// Get all keys
const keys = Object.keys(localStorage);

// Check if item exists
const exists = localStorage.getItem('key') !== null;

// SessionStorage (cleared when browser closes)
sessionStorage.setItem('key', 'value');
sessionStorage.getItem('key');
```

### 17. Fetch API

```javascript
// GET request
fetch('https://api.example.com/data')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

// POST request
fetch('https://api.example.com/data', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
    },
    body: JSON.stringify({ name: 'John', age: 30 })
})
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

// Async/await version
async function fetchData() {
    try {
        const response = await fetch('https://api.example.com/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
```

### 18. Error Handling

```javascript
// Try-catch
try {
    riskyOperation();
} catch (error) {
    console.error('Error:', error.message);
} finally {
    console.log('Cleanup');
}

// Throw custom error
function validateUser(user) {
    if (!user.name) {
        throw new Error('Name is required');
    }
    if (!user.email) {
        throw new Error('Email is required');
    }
}

// Custom error class
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

throw new ValidationError('Invalid email', 'email');
```

### 19. DOM Manipulation

```javascript
// Select elements
const element = document.getElementById('myId');
const elements = document.getElementsByClassName('myClass');
const element = document.querySelector('.myClass');
const elements = document.querySelectorAll('.myClass');

// Create element
const div = document.createElement('div');
div.textContent = 'Hello';
div.className = 'my-class';
div.id = 'my-id';

// Append element
document.body.appendChild(div);
parent.appendChild(div);

// Insert before
parent.insertBefore(newElement, referenceElement);

// Remove element
parent.removeChild(element);
element.remove();

// Replace element
parent.replaceChild(newElement, oldElement);

// Get/set attributes
element.setAttribute('src', 'image.jpg');
const src = element.getAttribute('src');

// Get/set properties
element.textContent = 'Text';
const text = element.textContent;

element.innerHTML = '<strong>Bold</strong>';
const html = element.innerHTML;

// Add/remove classes
element.classList.add('my-class');
element.classList.remove('my-class');
element.classList.toggle('my-class');
element.classList.contains('my-class');

// Event listeners
element.addEventListener('click', function(event) {
    console.log('Clicked');
    event.preventDefault();
    event.stopPropagation();
});

element.addEventListener('click', (event) => {
    console.log('Clicked');
}, { once: true }); // Remove after first click

// Remove event listener
function handleClick(event) {
    console.log('Clicked');
}
element.addEventListener('click', handleClick);
element.removeEventListener('click', handleClick);
```

### 20. Event Delegation

```javascript
// Instead of adding listener to each element
document.querySelectorAll('.button').forEach(btn => {
    btn.addEventListener('click', handleClick);
});

// Use event delegation on parent
document.addEventListener('click', function(event) {
    if (event.target.matches('.button')) {
        handleClick(event);
    }
});
```

## JavaScript in Aplikasi Ujian Sekolah Kedinasan

### Current Usage:
- ES6+ features (arrow functions, destructuring, template literals, async/await)
- LocalStorage for client-side data persistence
- Fetch API for HTTP requests
- DOM manipulation for UI updates
- Event handling for user interactions
- Promise-based async operations
- Array methods for data manipulation

### Implementation Examples:
- `admin/admin.html` - Uses ES6+ for admin panel logic
- `participant/ujian.html` - Uses async/await for exam operations
- `participant/dashboard.html` - Uses array methods for data processing
- `participant/expert_assistant.js` - Uses ES6+ for AI assistant
- All pages - Uses LocalStorage for auth tokens

## Resources

**Official Documentation:**
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [ECMAScript Specification](https://tc39.es/ecma262/)

**Learning Resources:**
- [JavaScript.info](https://javascript.info/)
- [ES6 Features - Babel](https://babeljs.io/docs/en/learn)
- [JavaScript Tutorial - W3Schools](https://www.w3schools.com/js/)

**Tools:**
- [ESLint - Linter](https://eslint.org/)
- [Prettier - Code Formatter](https://prettier.io/)
- [Babel - JavaScript Compiler](https://babeljs.io/)
