# MDCAT Expert Design System

## Overview

This design system provides a comprehensive visual framework for the MDCAT Expert quiz preparation website. It ensures consistency across all pages and components while maintaining a professional, educational aesthetic that appeals to students.

## Color Palette

### Primary Brand Colors
- **Primary Blue**: `#007bff` - Used for CTAs, links, and primary actions
- **Secondary Teal**: `#17a2b8` - Used for accents and secondary elements

### Status Colors
- **Success Green**: `#28a745` - Correct answers, completed tasks
- **Warning Yellow**: `#ffc107` - Alerts, pending items
- **Error Red**: `#dc3545` - Incorrect answers, failed attempts
- **Info Teal**: `#17a2b8` - Informational messages

### Neutral Colors
- **Text Primary**: `#212121` - Main headings and body text
- **Text Secondary**: `#757575` - Secondary text and labels
- **Background**: `#ffffff` - Main background
- **Surface**: `#ffffff` - Card backgrounds
- **Border**: `#e0e0e0` - Borders and dividers

## Typography

### Font Family
- **Primary**: Inter (sans-serif) - Modern, clean, and readable
- **Fallback**: System fonts for optimal performance

### Font Sizes
- **Display 1**: 60px (3.75rem) - Hero titles
- **Display 2**: 48px (3rem) - Large section titles
- **Heading 1**: 36px (2.25rem) - Page titles
- **Heading 2**: 30px (1.875rem) - Section titles
- **Heading 3**: 24px (1.5rem) - Subsection titles
- **Body Large**: 18px (1.125rem) - Large body text
- **Body**: 16px (1rem) - Standard body text
- **Body Small**: 14px (0.875rem) - Small body text
- **Caption**: 12px (0.75rem) - Captions and labels

### Font Weights
- **Light**: 300
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## Spacing Scale

Based on 8px units for consistency:
- **4px** (0.25rem) - Tight spacing
- **8px** (0.5rem) - Small spacing
- **16px** (1rem) - Base spacing
- **24px** (1.5rem) - Medium spacing
- **32px** (2rem) - Large spacing
- **48px** (3rem) - Extra large spacing
- **64px** (4rem) - Section spacing

## Component Guidelines

### Buttons

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, #007bff 0%, #17a2b8 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
}
```

#### Secondary Button
```css
.btn-secondary {
  background: #f5f5f5;
  color: #212121;
  border: 1px solid #e0e0e0;
  padding: 12px 24px;
  border-radius: 8px;
}
```

#### Usage Examples
- **Primary**: Start quiz, Submit answers, Sign up
- **Secondary**: Cancel, Back, View details
- **Success**: Continue, Next question
- **Warning**: Review answers
- **Error**: Try again

### Cards

#### Standard Card
```css
.card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
```

#### Quiz Card
```css
.quiz-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 300ms ease;
}

.quiz-card:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
```

### Form Elements

#### Input Field
```css
.form-control {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  transition: all 300ms ease;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}
```

#### Label
```css
.form-label {
  color: #212121;
  font-weight: 500;
  margin-bottom: 8px;
}
```

## Page-Specific Guidelines

### Homepage
- **Hero Section**: Gradient background (#007bff to #17a2b8), white text
- **Feature Cards**: White background, subtle shadows, hover effects
- **CTA Buttons**: Primary gradient, bounce animation
- **Stats**: Large numbers in primary color

### Quiz Page
- **Question Cards**: White background, gradient header, rounded corners
- **Options**: Hover states with primary color border
- **Progress Bar**: Primary gradient fill
- **Timer**: Warning gradient background

### Results Page
- **Score Circle**: Primary gradient background, white center
- **Performance Cards**: Color-coded based on score ranges
- **Action Buttons**: Primary and secondary variants

### Dashboard
- **Stats Cards**: Gradient backgrounds, centered content
- **Charts**: Primary color for data visualization
- **Recent Activity**: Card-based layout with hover effects

### Leaderboard
- **Table**: Rounded corners, alternating row colors
- **Rank Badges**: Gold/silver/bronze gradients for top 3
- **User Highlighting**: Primary color for current user

## Animations & Effects

### Transitions
- **Fast**: 150ms - Button hover states
- **Normal**: 300ms - Card hover, form focus
- **Slow**: 500ms - Progress bars, page transitions

### Keyframe Animations
- **fadeIn**: Page load elements
- **slideUp**: Cards appearing on scroll
- **bounce**: CTA buttons
- **pulse**: Important notifications
- **float**: Hero illustrations

## Responsive Breakpoints

- **Mobile**: < 576px
- **Tablet**: 576px - 992px
- **Desktop**: > 992px

All components scale appropriately across breakpoints while maintaining visual hierarchy.

## Accessibility

### Color Contrast
- All text meets WCAG AA standards (4.5:1 ratio)
- Interactive elements have clear focus states
- Color is never the only way information is conveyed

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Logical tab order maintained
- Focus indicators are visible and consistent

### Reduced Motion
- Respects `prefers-reduced-motion` setting
- Animations can be disabled for users who prefer less motion

## Implementation

### CSS Variables
All design tokens are defined as CSS custom properties, allowing for easy theme customization and maintenance.

### Utility Classes
Common patterns are available as utility classes for rapid development.

### Component Library
Reusable components ensure consistency across the application.

## Usage Examples

### HTML Structure
```html
<!-- Card Component -->
<div class="card">
  <div class="card-header">
    <h3 class="text-heading-3">Card Title</h3>
  </div>
  <div class="card-body">
    <p class="text-body">Card content goes here.</p>
    <button class="btn btn-primary">Action</button>
  </div>
</div>

<!-- Form Example -->
<div class="form-group">
  <label class="form-label" for="email">Email Address</label>
  <input type="email" class="form-control" id="email" placeholder="Enter your email">
</div>
```

### CSS Customization
```css
/* Override primary color for special sections */
.special-section {
  --color-primary: #ff6b35;
}
```

This design system provides a solid foundation for consistent, accessible, and visually appealing user interfaces across the MDCAT Expert platform.