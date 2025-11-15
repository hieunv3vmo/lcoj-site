# LCOJ Component Library

**Phase 3: Core Component Library**

Reusable Jinja2 macros for building consistent UI across LCOJ templates.

---

## Quick Start

### Import Components

```jinja2
{# Import specific component modules #}
{% import "components/buttons.html" as btn %}
{% import "components/badges.html" as badge %}
{% import "components/cards.html" as card %}
{% import "components/forms.html" as form %}
{% import "components/alerts.html" as alert %}
{% import "components/navigation.html" as nav %}
{% import "components/tables.html" as table %}
{% import "components/modals.html" as modal %}
{% import "components/loading.html" as loading %}
```

---

## Components

### 1. Buttons (`components/buttons.html`)

#### Variants

```jinja2
{{ btn.primary('Submit Solution') }}
{{ btn.accent('Highlight') }}
{{ btn.success('Accept') }}
{{ btn.warning('Caution') }}
{{ btn.error('Delete') }}
{{ btn.outline('Cancel') }}
{{ btn.ghost('Subtle') }}
{{ btn.link('Learn More', href='/docs') }}
```

#### Sizes

```jinja2
{{ btn.primary('Extra Small', size='xs') }}
{{ btn.primary('Small', size='sm') }}
{{ btn.primary('Default') }}
{{ btn.primary('Large', size='lg') }}
{{ btn.primary('Extra Large', size='xl') }}
```

#### States

```jinja2
{{ btn.primary('Disabled', disabled=true) }}
{{ btn.primary('Loading', loading=true) }}
```

#### With Icons

```jinja2
{{ btn.primary('Save', icon='<svg>...</svg>') }}
{{ btn.icon_button('<svg>...</svg>', aria_label='Close') }}
```

#### Button Groups

```jinja2
{% call btn.group() %}
  {{ btn.primary('Save') }}
  {{ btn.outline('Cancel') }}
{% endcall %}
```

---

### 2. Badges (`components/badges.html`)

#### Semantic Badges

```jinja2
{{ badge.success('Accepted') }}
{{ badge.warning('Time Limit') }}
{{ badge.error('Wrong Answer') }}
{{ badge.info('Running') }}
{{ badge.primary('New') }}
```

#### Difficulty Badges

```jinja2
{{ badge.difficulty('easy') }}
{{ badge.difficulty('medium') }}
{{ badge.difficulty('hard') }}
```

#### Submission Status

```jinja2
{{ badge.status('AC') }}
{{ badge.status('WA') }}
{{ badge.status('TLE') }}
{{ badge.status('MLE') }}
{{ badge.status('RE') }}
{{ badge.status('CE') }}
{{ badge.status('PENDING') }}
```

#### User Ranks

```jinja2
{{ badge.rank('newbie') }}
{{ badge.rank('pupil') }}
{{ badge.rank('specialist') }}
{{ badge.rank('expert') }}
{{ badge.rank('master') }}
{{ badge.rank('grandmaster') }}
{{ badge.rank('legendary') }}
```

#### Tags (Removable)

```jinja2
{{ badge.tag('Python', on_remove='removeTag(this)') }}
{{ badge.tag('Algorithm', removable=false) }}
```

#### With Icons/Dots

```jinja2
{{ badge.with_icon('Verified', '<svg>...</svg>', variant='success') }}
{{ badge.with_dot('Online', variant='success') }}
{{ badge.count(42, max=99, variant='error') }}
```

---

### 3. Cards (`components/cards.html`)

#### Base Card

```jinja2
{% call card.base() %}
  Card content here
{% endcall %}

{% call card.base(variant='bordered') %}
  Bordered card
{% endcall %}

{% call card.base(variant='interactive') %}
  Interactive card with hover effect
{% endcall %}
```

#### Card with Header

```jinja2
{% call card.with_header('Card Title', subtitle='Subtitle here') %}
  Card body content
{% endcall %}
```

#### Problem Card

```jinja2
{{ card.problem(
  'Two Sum',
  difficulty='easy',
  points=1000,
  tags=['array', 'hash-table'],
  solved=true,
  href='/problem/two-sum'
) }}
```

#### Contest Card

```jinja2
{{ card.contest(
  'Weekly Contest 123',
  start_time='Jan 15, 2025 10:00 AM',
  duration='2 hours',
  participants=1234,
  status='running',
  href='/contest/123'
) }}
```

#### User Card

```jinja2
{{ card.user(
  'johndoe',
  avatar='/avatars/john.jpg',
  rank='expert',
  rating=1850,
  solved=250,
  href='/user/johndoe'
) }}
```

#### Blog Card

```jinja2
{{ card.blog(
  'How to Solve Dynamic Programming',
  excerpt='Learn the fundamentals...',
  author='Jane Smith',
  date='Jan 10, 2025',
  thumbnail='/images/blog1.jpg',
  href='/blog/dp-guide'
) }}
```

#### Stats Card

```jinja2
{{ card.stat(
  'Total Users',
  '10,543',
  change='+12%',
  trend='up',
  icon='<svg>...</svg>'
) }}
```

---

### 4. Forms (`components/forms.html`)

#### Text Input

```jinja2
{{ form.input(
  'email',
  label='Email Address',
  type='email',
  placeholder='you@example.com',
  help_text='We\'ll never share your email',
  required=true
) }}

{{ form.input('username', error='Username is required') }}
```

#### Textarea

```jinja2
{{ form.textarea(
  'description',
  label='Description',
  rows=5,
  placeholder='Enter description...'
) }}
```

#### Select

```jinja2
{{ form.select(
  'country',
  label='Country',
  options=[('us', 'United States'), ('vn', 'Vietnam')],
  selected='us',
  placeholder='Choose a country...'
) }}
```

#### Checkbox & Radio

```jinja2
{{ form.checkbox('terms', 'I agree to the terms', checked=true) }}

{{ form.radio('plan', 'free', 'Free Plan', checked=true) }}
{{ form.radio('plan', 'pro', 'Pro Plan') }}

{{ form.radio_group(
  'notifications',
  label='Notifications',
  options=[('all', 'All'), ('important', 'Important only'), ('none', 'None')],
  selected='all',
  inline=true
) }}
```

#### File Upload

```jinja2
{{ form.file(
  'solution',
  label='Upload Solution',
  accept='.cpp,.py,.java',
  help_text='Max file size: 10MB'
) }}
```

#### Search

```jinja2
{{ form.search('query', placeholder='Search problems...') }}
```

#### Form Group

```jinja2
{% call form.group(legend='Account Information') %}
  {{ form.input('name', 'Full Name') }}
  {{ form.input('email', 'Email', type='email') }}
{% endcall %}
```

---

### 5. Alerts (`components/alerts.html`)

#### Basic Alerts

```jinja2
{{ alert.success('Success!', 'Your solution was accepted.') }}
{{ alert.warning('Warning', 'You have only 1 submission left.') }}
{{ alert.error('Error', 'Failed to compile your code.') }}
{{ alert.info('Info', 'Contest starts in 30 minutes.') }}
```

#### Dismissible

```jinja2
{{ alert.success('Saved!', 'Your changes have been saved.', dismissible=true) }}
```

#### Toast Notification (requires Alpine.js)

```jinja2
{{ alert.toast('Profile updated successfully!', variant='success', duration=5000) }}
```

#### Banner Alert

```jinja2
{{ alert.banner(
  'New feature available! Check out our improved code editor.',
  variant='info',
  action_text='Learn More',
  action_href='/features'
) }}
```

---

### 6. Navigation (`components/navigation.html`)

#### Breadcrumbs

```jinja2
{{ nav.breadcrumbs([
  ('Home', '/'),
  ('Problems', '/problems'),
  ('Two Sum', '/problem/two-sum')
]) }}

{{ nav.breadcrumbs([('Home', '/'), ('Problems', '/problems')], separator='>') }}
```

#### Pagination

```jinja2
{{ nav.pagination(
  current_page=5,
  total_pages=20,
  base_url='/problems'
) }}
```

#### Page Info

```jinja2
{{ nav.page_info(start=1, end=20, total=500) }}
```

#### Tabs

```jinja2
{{ nav.tabs([
  ('Description', '/problem/1', true),
  ('Submissions', '/problem/1/submissions', false),
  ('Editorial', '/problem/1/editorial', false)
]) }}
```

#### Steps Navigation

```jinja2
{{ nav.steps(['Account', 'Profile', 'Settings'], current=1) }}
```

---

### 7. Tables (`components/tables.html`)

#### Basic Table

```jinja2
{% call table.base(headers=['Problem', 'Difficulty', 'Status']) %}
  <tr>
    <td>Two Sum</td>
    <td>{{ badge.difficulty('easy') }}</td>
    <td>{{ badge.status('AC') }}</td>
  </tr>
{% endcall %}
```

#### Striped & Compact

```jinja2
{% call table.base(headers=['Name', 'Score'], variant='striped') %}
  ...
{% endcall %}

{% call table.base(headers=['Name', 'Score'], variant='compact') %}
  ...
{% endcall %}
```

#### Pre-formatted Rows

```jinja2
{{ table.submission_row(
  'Two Sum',
  status='AC',
  language='Python',
  time='120ms',
  memory='14.2MB',
  href='/submission/12345'
) }}

{{ table.problem_row(
  'Add Two Numbers',
  difficulty='medium',
  acceptance=45.2,
  solved_count=15432,
  href='/problem/2'
) }}

{{ table.leaderboard_row(
  rank=1,
  username='johndoe',
  score=2500,
  solved=150,
  avatar='/avatars/john.jpg',
  href='/user/johndoe'
) }}
```

#### Sortable Headers

```jinja2
<thead>
  <tr>
    {{ table.sortable_header('Name', 'name', current_sort='name', current_order='asc') }}
    {{ table.sortable_header('Score', 'score', current_sort='name', current_order='asc') }}
  </tr>
</thead>
```

---

### 8. Modals (`components/modals.html`)

Requires Alpine.js

#### Basic Modal

```jinja2
<div x-data="{ open: false }">
  <button @click="open = true" class="btn btn-primary">Open Modal</button>

  {% call modal.base('Modal Title', 'open', size='md') %}
    <p>Modal content goes here...</p>
  {% endcall %}
</div>
```

#### Confirmation Dialog

```jinja2
<div x-data="{ confirmOpen: false }">
  <button @click="confirmOpen = true" class="btn btn-error">Delete</button>

  {{ modal.confirm(
    'Confirm Deletion',
    'Are you sure you want to delete this item? This action cannot be undone.',
    x_show='confirmOpen',
    confirm_text='Delete',
    confirm_action='deleteItem()',
    variant='error'
  ) }}
</div>
```

#### Form Modal

```jinja2
<div x-data="{ formOpen: false }">
  <button @click="formOpen = true" class="btn btn-primary">Add Item</button>

  {% call modal.form_modal('Add New Item', 'formOpen', '/items', 'post') %}
    {{ form.input('name', 'Item Name', required=true) }}
    {{ form.textarea('description', 'Description') }}
  {% endcall %}
</div>
```

---

### 9. Loading States (`components/loading.html`)

#### Spinners

```jinja2
{{ loading.spinner() }}
{{ loading.spinner(size='sm', variant='primary') }}
{{ loading.spinner(size='lg', variant='success') }}

{{ loading.spinner_with_text('Loading data...') }}
{{ loading.dots(variant='primary') }}
```

#### Skeleton Loaders

```jinja2
{{ loading.skeleton_text(lines=3) }}
{{ loading.skeleton_text(lines=5, last_line_width='1/2') }}

{{ loading.skeleton_card(show_avatar=true, text_lines=4) }}

{{ loading.skeleton_table(rows=5, columns=4) }}
```

#### Progress Bars

```jinja2
{{ loading.progress(75, variant='primary', show_label=true) }}
{{ loading.progress(100, variant='success') }}

{{ loading.progress_circle(65, size=120, variant='primary') }}
```

#### Loading Overlay

```jinja2
<div x-data="{ loading: false }">
  {{ loading.overlay('Processing...', 'loading') }}
</div>
```

---

## Best Practices

### 1. Consistent Usage

Always use component macros instead of raw HTML for consistency:

```jinja2
{# Good #}
{{ btn.primary('Submit') }}

{# Avoid #}
<button class="btn btn-primary">Submit</button>
```

### 2. Semantic Naming

Use semantic variants that match the intent:

```jinja2
{# Good - semantic meaning #}
{{ badge.status('AC') }}
{{ alert.error('Error', 'Failed to save') }}

{# Avoid - generic styling #}
{{ badge.success('AC') }}  {# Use badge.status instead #}
```

### 3. Accessibility

Always provide proper labels and attributes:

```jinja2
{# Good #}
{{ btn.icon_button('<svg>...</svg>', aria_label='Close modal') }}
{{ form.input('email', label='Email Address', required=true) }}

{# Avoid #}
<button><svg>...</svg></button>  {# No aria-label #}
```

### 4. Component Composition

Build complex UIs by composing simple components:

```jinja2
{% call card.base(variant='interactive') %}
  <div class="flex items-center justify-between mb-4">
    <h3 class="card-title">{{ problem.title }}</h3>
    {{ badge.difficulty(problem.difficulty) }}
  </div>

  <p class="text-gray-600 mb-4">{{ problem.description }}</p>

  <div class="flex gap-2">
    {{ btn.primary('Solve', href='/problem/' + problem.id) }}
    {{ btn.outline('Editorial', href='/problem/' + problem.id + '/editorial') }}
  </div>
{% endcall %}
```

---

## Component Reference

| Component | File | Key Features |
|-----------|------|--------------|
| Buttons | `buttons.html` | 8 variants, 4 sizes, loading states, icons |
| Badges | `badges.html` | Semantic, difficulty, status, ranks, tags |
| Cards | `cards.html` | Problem, contest, user, blog, stats cards |
| Forms | `forms.html` | All input types, validation, search |
| Alerts | `alerts.html` | 4 variants, dismissible, toasts, banners |
| Navigation | `navigation.html` | Breadcrumbs, pagination, tabs, steps |
| Tables | `tables.html` | Sortable, striped, pre-formatted rows |
| Modals | `modals.html` | Base, confirmation, form modals |
| Loading | `loading.html` | Spinners, skeletons, progress bars |

---

## Next Steps

- **Phase 4**: Use these components to redesign all templates
- **Phase 5**: Replace jQuery with Alpine.js integration
- **Phase 6**: Polish interactions and animations
- **Phase 7**: Comprehensive testing

---

**Version**: 3.0
**Last Updated**: Phase 3 - Core Component Library
**Maintained by**: Claude AI
