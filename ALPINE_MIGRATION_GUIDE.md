# Alpine.js Migration Guide

This guide shows how to replace jQuery code with modern Alpine.js components.

## Table of Contents

- [AJAX Requests](#ajax-requests)
- [DOM Manipulation](#dom-manipulation)
- [Event Handlers](#event-handlers)
- [Select Dropdowns](#select-dropdowns)
- [Forms](#forms)
- [Alerts & Notifications](#alerts--notifications)
- [Auto-reload](#auto-reload)
- [Filters](#filters)
- [Countdown Timers](#countdown-timers)

---

## AJAX Requests

### jQuery (Old Way)

```javascript
$.ajax({
    url: '/api/endpoint',
    type: 'GET',
    success: function(data) {
        console.log(data);
    },
    error: function(error) {
        console.error(error);
    }
});

$.get('/api/data', function(data) {
    $('#container').html(data);
});

$.post('/api/submit', { name: 'John' }, function(response) {
    alert(response.message);
});
```

### Alpine.js + Fetch API (New Way)

```javascript
// GET request
const data = await fetchAPI.get('/api/endpoint');
console.log(data);

// POST request
const response = await fetchAPI.post('/api/submit', {
    name: 'John'
});
alert(response.message);

// POST form data
const formData = new FormData(form);
const result = await fetchAPI.postForm('/api/upload', formData);
```

---

## DOM Manipulation

### jQuery (Old Way)

```javascript
$('#element').html('<p>New content</p>');
$('#element').text('New text');
$('#element').show();
$('#element').hide();
$('#element').toggle();
$('#element').addClass('active');
$('#element').removeClass('active');
$('#element').toggleClass('active');
```

### Alpine.js (New Way)

```html
<div x-data="{ content: '<p>New content</p>', visible: true }">
    <!-- Dynamic HTML -->
    <div x-html="content"></div>

    <!-- Dynamic text -->
    <div x-text="content"></div>

    <!-- Show/hide -->
    <div x-show="visible">Content</div>

    <!-- Toggle -->
    <button @click="visible = !visible">Toggle</button>

    <!-- Classes -->
    <div :class="{ 'active': isActive }">Element</div>
    <div :class="isActive ? 'active' : 'inactive'">Element</div>
</div>
```

---

## Event Handlers

### jQuery (Old Way)

```javascript
$('#button').click(function() {
    alert('Clicked!');
});

$('#input').on('input', function() {
    console.log($(this).val());
});

$(document).ready(function() {
    // Initialize
});
```

### Alpine.js (New Way)

```html
<div x-data="{ value: '' }">
    <!-- Click handler -->
    <button @click="alert('Clicked!')">Click me</button>

    <!-- Input handler -->
    <input @input="console.log(value)" x-model="value">

    <!-- Initialization (runs automatically) -->
    <div x-data="{
        init() {
            // Initialize here
        }
    }">
    </div>
</div>
```

---

## Select Dropdowns

### Select2 (Old Way)

```javascript
$('#myselect').select2({
    placeholder: 'Select an option',
    ajax: {
        url: '/api/search',
        delay: 300,
        data: function(params) {
            return { q: params.term };
        }
    }
});

$('#myselect').on('change', function() {
    console.log($(this).val());
});
```

### Alpine.js Modern Select (New Way)

**Template:**

```html
{% import "components/select.html" as select %}

{{ select.modern_select(
    name='organization',
    placeholder='Select organization',
    ajax_url='/api/organizations',
    searchable=True,
    multiple=False
) }}
```

**Or with Alpine.js directly:**

```html
<div x-data="modernSelect({
    placeholder: 'Select an option',
    ajax: {
        url: '/api/search',
        delay: 300
    }
})" @select-change="handleChange($event.detail.value)">
    <!-- Select component HTML -->
</div>
```

---

## Forms

### jQuery (Old Way)

```javascript
$('#myform').submit(function(e) {
    e.preventDefault();

    var formData = $(this).serialize();

    $.ajax({
        url: $(this).attr('action'),
        type: 'POST',
        data: formData,
        success: function(response) {
            if (response.success) {
                window.location = response.redirect;
            } else {
                displayErrors(response.errors);
            }
        }
    });
});
```

### Alpine.js (New Way)

```html
<form
    x-data="form({
        onSuccess: (response) => {
            window.location = response.redirect;
        }
    })"
    @submit="submit($event)"
    action="/submit"
    method="post"
>
    {% csrf_token %}

    <div>
        <input
            type="text"
            name="username"
            :class="{ 'border-error-500': hasError('username') }"
        >
        <p x-show="hasError('username')" x-text="getError('username')" class="text-error-600"></p>
    </div>

    <button type="submit" :disabled="submitting">
        <span x-show="!submitting">Submit</span>
        <span x-show="submitting">Submitting...</span>
    </button>
</form>
```

---

## Alerts & Notifications

### jQuery (Old Way)

```javascript
$('#alert').click(function() {
    $(this).parent().hide();
    localStorage.setItem('alert-dismissed', 'true');
});

if (localStorage.getItem('alert-dismissed') === 'true') {
    $('#alert').parent().hide();
}
```

### Alpine.js (New Way)

```html
<div x-data="alert({ storageKey: 'my-alert' })" x-show="visible">
    <div class="card bg-warning-50">
        <p>This is an alert message.</p>
        <button @click="dismiss()">×</button>
    </div>
</div>
```

---

## Auto-reload

### jQuery (Old Way)

```javascript
var timer;

function updateContent() {
    $.ajax({
        url: window.location.href + '?raw'
    }).done(function(data) {
        $('#content').html(data);
    });
}

timer = setInterval(updateContent, 10000);

$(window).on('dmoj:window-visible', function() {
    updateContent();
});
```

### Alpine.js (New Way)

```html
<div
    x-data="autoReload({
        interval: 10000,
        selector: '#content',
        url: window.location.href
    })"
    @reloaded="console.log('Content reloaded')"
>
    <div id="content">
        <!-- Content that will auto-reload -->
    </div>
</div>
```

---

## Filters

### jQuery (Old Way)

```javascript
$('#apply-filter').click(function() {
    var params = new URLSearchParams();

    var status = $('#status').val();
    if (status && status.length > 0) {
        params.set('status', status.join(','));
    }

    var language = $('#language').val();
    if (language) {
        params.set('language', language);
    }

    window.location.href = '?' + params.toString();
});
```

### Alpine.js (New Way)

```html
<div x-data="filter({
    initial: {
        status: {{ selected_statuses|tojson }},
        language: '{{ selected_language }}'
    }
})">
    <!-- Status filter -->
    <select x-model="filters.status" multiple>
        <option value="AC">Accepted</option>
        <option value="WA">Wrong Answer</option>
    </select>

    <!-- Language filter -->
    <select x-model="filters.language">
        <option value="">All</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
    </select>

    <!-- Apply button -->
    <button @click="apply()">Apply Filters</button>
    <button @click="clear()">Clear Filters</button>
</div>
```

---

## Countdown Timers

### jQuery (Old Way)

```javascript
$('.countdown').each(function() {
    var elem = $(this);
    var endTime = parseInt(elem.data('end-time'));

    setInterval(function() {
        var now = Math.floor(Date.now() / 1000);
        var remaining = Math.max(0, endTime - now);

        var hours = Math.floor(remaining / 3600);
        var minutes = Math.floor((remaining % 3600) / 60);
        var seconds = remaining % 60;

        elem.text(hours + 'h ' + minutes + 'm ' + seconds + 's');
    }, 1000);
});
```

### Alpine.js (New Way)

```html
<div x-data="countdown({{ end_time }})">
    <span x-text="formatted"></span>

    <!-- Conditional display -->
    <div x-show="!isExpired">
        Time remaining: <span x-text="formatted"></span>
    </div>
    <div x-show="isExpired">
        Contest has ended.
    </div>
</div>
```

---

## Complete Example: Submission List

### jQuery (Old Way)

```javascript
$(function() {
    // Filter form
    $('#filter-form').on('submit', function(e) {
        e.preventDefault();
        var url = $(this).attr('action') + '?';
        url += 'status=' + $('#status').val().join(',') + '&';
        url += 'language=' + $('#language').val().join(',');
        window.location.href = url;
    });

    // Show/hide personal info
    $('#show-personal-info').click(function() {
        $('.personal-info').toggle();
        localStorage.setItem('show-info', $('.personal-info').is(':visible'));
    });

    if (localStorage.getItem('show-info') === 'true') {
        $('.personal-info').show();
        $('#show-personal-info').prop('checked', true);
    }

    // Auto-reload
    setInterval(function() {
        $.ajax({
            url: '?raw'
        }).done(function(data) {
            $('#ranking-table').html(data);
        });
    }, 10000);
});
```

### Alpine.js (New Way)

```html
<div
    x-data="{
        filters: {
            status: {{ selected_statuses|tojson }},
            language: {{ selected_languages|tojson }}
        },
        showInfo: $persist(false)
    }"
>
    <!-- Filters -->
    <form @submit.prevent="
        const params = new URLSearchParams();
        if (filters.status.length) params.set('status', filters.status.join(','));
        if (filters.language.length) params.set('language', filters.language.join(','));
        window.location.href = '?' + params.toString();
    ">
        <select x-model="filters.status" multiple>...</select>
        <select x-model="filters.language" multiple>...</select>
        <button type="submit">Apply</button>
    </form>

    <!-- Show/hide toggle -->
    <label>
        <input type="checkbox" x-model="showInfo">
        Show personal info
    </label>

    <!-- Personal info (conditionally shown) -->
    <div x-show="showInfo" class="personal-info">...</div>

    <!-- Auto-reload -->
    <div
        x-data="autoReload({ interval: 10000, selector: '#ranking-table' })"
        id="ranking-table"
    >
        <!-- Content -->
    </div>
</div>
```

---

## Best Practices

1. **Use x-data for component state**: Keep related data and methods together
2. **Use x-show instead of jQuery show/hide**: Better for accessibility
3. **Use x-model for two-way binding**: Simpler than jQuery .val()
4. **Use @click instead of .click()**: More declarative
5. **Use fetchAPI wrapper**: Handles CSRF tokens automatically
6. **Use localStorage with $persist magic**: Automatic persistence
7. **Use Alpine.data() for reusable components**: Better code organization
8. **Avoid direct DOM manipulation**: Let Alpine handle it reactively

---

## Migration Checklist

- [ ] Replace all $.ajax with fetchAPI
- [ ] Replace all $.get/$.post with fetchAPI.get/post
- [ ] Convert event handlers to Alpine @directives
- [ ] Replace Select2 with modernSelect component
- [ ] Convert show/hide to x-show
- [ ] Convert HTML manipulation to x-html
- [ ] Convert class toggles to :class
- [ ] Convert localStorage to $persist
- [ ] Remove jQuery $(function() {}) wrappers
- [ ] Test all functionality

---

## Need Help?

- Alpine.js Docs: https://alpinejs.dev/
- LCOJ Alpine Utils: `/resources/js/alpine-utils.js`
- Modern Select Component: `/resources/js/components/select.js`
