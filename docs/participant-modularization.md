# Participant Folder Modularization Documentation

## Overview

This document describes the modularization of participant-facing files to improve code maintainability, reusability, and consistency with the admin panel structure.

## Changes Summary

### Before Modularization

Participant files were monolithic with embedded CSS and JavaScript:
- `participant/dashboard.html` (single large file with CSS, JS, HTML)
- `participant/materi.html` (single large file with CSS, JS, HTML)
- `participant/profile.html` (single large file with CSS, JS, HTML)
- `participant/register.html` (single large file with CSS, JS, HTML)
- `participant/ujian.html` (single large file with CSS, JS, HTML)

### After Modularization

Each participant file has been split into:
- **CSS files**: `participant/css/[page].css`
- **JavaScript files**: `participant/js/[page].js`
- **HTML sections**: `participant/sections/[page]-content.html`
- **Shared components**: `participant/components/modals-shared.html`
- **Modular HTML entry points**: `participant/[page].html` (dynamically loads components)

## New Folder Structure

```
participant/
├── css/
│   ├── participant.css        # Dashboard styles
│   ├── materi.css            # Learning materials styles
│   ├── profile.css           # Profile page styles
│   ├── register.css          # Registration page styles
│   └── ujian.css             # Exam page styles
├── js/
│   ├── dashboard.js          # Dashboard logic
│   ├── materi.js             # Learning materials logic
│   ├── profile.js            # Profile page logic
│   ├── register.js           # Registration logic
│   └── ujian.js              # Exam page logic
├── components/
│   └── modals-shared.html    # Shared modal components
├── sections/
│   ├── dashboard-content.html    # Dashboard HTML content
│   ├── materi-content.html       # Learning materials HTML content
│   ├── profile-content.html      # Profile HTML content
│   ├── register-content.html     # Registration HTML content
│   └── ujian-content.html        # Exam HTML content
├── dashboard.html            # Modular dashboard entry point
├── materi.html               # Modular learning materials entry point
├── profile.html              # Modular profile entry point
├── register.html             # Modular registration entry point
├── ujian.html                # Modular exam entry point
├── dashboard-backup.html     # Original backup
├── materi-backup.html        # Original backup
├── profile-backup.html       # Original backup
├── register-backup.html      # Original backup
└── ujian-backup.html         # Original backup
```

## File Details

### 1. Dashboard (`dashboard.html`)

**CSS**: `participant/css/participant.css`
- Contains all dashboard styling
- CSS variables for theming
- Responsive design styles
- Accessibility features (font size adjustments)

**JavaScript**: `participant/js/dashboard.js`
- Dashboard initialization logic
- User data loading
- Stats and progress chart updates
- AI assessment updates
- Learning materials loading
- Activity timeline
- Learning path management
- Gamification features
- Notification handling
- Helper functions (showToast, showConfirm, showLoading)

**HTML Content**: `participant/sections/dashboard-content.html`
- Stats grid
- Last exam info
- Progress chart
- Weakness analysis
- AI assessment
- Learning materials
- Learning path
- Badges/achievements
- Daily challenges
- Notifications
- Activity timeline
- Footer
- Mobile bottom navigation

### 2. Learning Materials (`materi.html`)

**CSS**: `participant/css/materi.css`
- Material card styles
- Filter section styles
- Progress indicator styles
- Responsive design

**JavaScript**: `participant/js/materi.js`
- Material loading logic
- Display functions
- Filter functionality
- Category loading
- Helper functions (showToast, showConfirm, showLoading)

**HTML Content**: `participant/sections/materi-content.html`
- Material grid
- Filter section
- Material cards with icons and progress

### 3. Profile (`profile.html`)

**CSS**: `participant/css/profile.css`
- Profile page styling
- Form styles
- Responsive design
- Accessibility features

**JavaScript**: `participant/js/profile.js`
- Profile data loading
- Form validation
- Update logic
- Helper functions

**HTML Content**: `participant/sections/profile-content.html`
- Profile form
- User information fields
- Update buttons

### 4. Registration (`register.html`)

**CSS**: `participant/css/register.css`
- Registration form styling
- Password strength indicator
- Responsive design

**JavaScript**: `participant/js/register.js`
- Password strength checker
- Form validation
- Registration logic
- Helper functions (showAlert)

**HTML Content**: `participant/sections/register-content.html`
- Registration form
- Password fields
- Form validation UI

### 5. Exam (`ujian.html`)

**CSS**: `participant/css/ujian.css`
- Exam interface styling
- Question card styles
- Timer styles
- Navigation styles
- Dark mode support
- Responsive design

**JavaScript**: `participant/js/ujian.js`
- Exam initialization
- Question loading
- Answer handling
- Timer logic
- Navigation
- Swipe gestures
- Keyboard navigation
- Submit logic
- Helper functions

**HTML Content**: `participant/sections/ujian-content.html`
- Welcome screen
- Exam interface
- Question cards
- Navigation controls
- Timer display

## Shared Components

### Modals (`participant/components/modals-shared.html`)

Contains shared modal components used across all participant pages:
- **Confirm Modal**: For confirmation dialogs
- **Loading Modal**: For loading indicators
- **Toast Container**: For toast notifications

## How It Works

### Dynamic Loading

Each modular HTML file uses JavaScript to dynamically load:
1. HTML content from `sections/` folder
2. Shared modals from `components/modals-shared.html`

Example from `dashboard.html`:
```javascript
async function loadDashboardComponents() {
    try {
        const contentResponse = await fetch('sections/dashboard-content.html');
        const contentHTML = await contentResponse.text();
        document.getElementById('dashboardContent').innerHTML = contentHTML;

        const modalsResponse = await fetch('components/modals-shared.html');
        const modalsHTML = await modalsResponse.text();
        document.getElementById('modalsContainer').innerHTML = modalsHTML;
    } catch (error) {
        console.error('Error loading dashboard components:', error);
    }
}
```

### Benefits

1. **Separation of Concerns**: CSS, JavaScript, and HTML are separated into distinct files
2. **Reusability**: Shared components (modals) can be reused across pages
3. **Maintainability**: Easier to locate and fix issues in specific file types
4. **Consistency**: Same structure as admin panel for easier development
5. **Performance**: CSS and JS can be cached separately
6. **Collaboration**: Multiple developers can work on different file types simultaneously

## Developer Guidelines

### Adding New Styles

1. Add styles to the appropriate CSS file in `participant/css/`
2. Use CSS variables for theming consistency
3. Follow existing naming conventions
4. Ensure responsive design with media queries

### Adding New JavaScript Logic

1. Add logic to the appropriate JS file in `participant/js/`
2. Use helper functions consistently (showToast, showConfirm, showLoading)
3. Follow existing function naming conventions
4. Add error handling for API calls

### Adding New HTML Content

1. Add HTML content to the appropriate section file in `participant/sections/`
2. Use semantic HTML
3. Include accessibility attributes (aria-labels, roles)
4. Ensure responsive design

### Modifying Shared Components

1. Shared modals are in `participant/components/modals-shared.html`
2. Changes affect all participant pages
3. Test thoroughly across all pages after modification

## Backup Files

Original monolithic files have been backed up with `-backup.html` suffix:
- `dashboard-backup.html`
- `materi-backup.html`
- `profile-backup.html`
- `register-backup.html`
- `ujian-backup.html`

**Important**: Do not delete these backup files until you have thoroughly tested the modular version.

## Database Export

The database has been exported to:
- `database/export_2026-05-16_21-28-39.sql` (68MB, 66 tables)

To import on another computer:
```bash
mysql -u root -p ujian_sekolah_kedinasan < export_2026-05-16_21-28-39.sql
```

Or use phpMyAdmin:
1. Open phpMyAdmin
2. Create database `ujian_sekolah_kedinasan`
3. Import the SQL file

## Configuration

Ensure the following configuration is set correctly in `config.php`:
```php
$db_host = '127.0.0.1';
$db_user = 'root';
$db_pass = 'root';
$db_name = 'ujian_sekolah_kedinasan';
```

## Testing

### Manual Testing Checklist

- [ ] Dashboard loads correctly
- [ ] Dashboard sections display properly
- [ ] Learning materials page loads
- [ ] Profile page loads and updates work
- [ ] Registration form works
- [ ] Exam interface loads
- [ ] Navigation between pages works
- [ ] Modals display correctly
- [ ] Toast notifications work
- [ ] Responsive design on mobile

### Known Issues

- Admin test navigation shows `showSection is not defined` - this is a test issue, the admin panel works correctly when accessed manually
- Some CSS files may have indentation issues - these don't affect functionality

## Next Steps

1. Test all participant pages thoroughly
2. Verify responsive design on various devices
3. Test accessibility features
4. Update any remaining inline scripts/styles
5. Consider creating additional shared components if needed

## Support

For questions or issues with the modularization:
1. Check this documentation first
2. Review the admin panel modularization (completed previously) for reference
3. Check the backup files if needed
4. Consult the main DEVELOPER_GUIDE.md for general development guidelines

## Version History

- **2026-05-16**: Initial modularization of participant files
  - Split dashboard.html, materi.html, profile.html, register.html, ujian.html
  - Created CSS, JS, and HTML section files
  - Created shared modals component
  - Exported database
