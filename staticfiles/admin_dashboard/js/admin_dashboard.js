/*
Admin Dashboard JavaScript
Handles interactive functionality for the admin interface
*/

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeSidebar();
    initializeTooltips();
    initializeAlerts();
    initializeForms();
});

/**
 * Sidebar functionality
 */
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mainContent = document.querySelector('.main-content');

    if (!sidebar || !sidebarToggle || !mainContent) return;

    // Toggle sidebar on mobile
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('show');
        mainContent.classList.toggle('expanded');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
                sidebar.classList.remove('show');
                mainContent.classList.remove('expanded');
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024) {
            sidebar.classList.remove('show');
            mainContent.classList.remove('expanded');
        }
    });
}

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Auto-dismiss alerts after 5 seconds
 */
function initializeAlerts() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function(alert) {
        if (!alert.querySelector('.btn-close')) return;

        setTimeout(function() {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
}

/**
 * Form enhancements
 */
function initializeForms() {
    // Confirm delete actions
    const deleteButtons = document.querySelectorAll('[data-confirm-delete]');
    deleteButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm-delete') || 'Are you sure you want to delete this item?';
            if (!confirm(message)) {
                e.preventDefault();
                return false;
            }
        });
    });

    // Form validation
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            if (!validateForm(form)) {
                e.preventDefault();
                return false;
            }
        });
    });

    // Auto-submit search forms
    const searchInputs = document.querySelectorAll('input[data-auto-submit]');
    searchInputs.forEach(function(input) {
        let timeout;
        input.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const form = input.closest('form');
                if (form) form.submit();
            }, 500);
        });
    });
}

/**
 * Form validation
 */
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(function(field) {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;

            // Add error message if not exists
            let errorMsg = field.parentNode.querySelector('.invalid-feedback');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'invalid-feedback';
                errorMsg.textContent = 'This field is required.';
                field.parentNode.appendChild(errorMsg);
            }
        } else {
            field.classList.remove('is-invalid');
            const errorMsg = field.parentNode.querySelector('.invalid-feedback');
            if (errorMsg) errorMsg.remove();
        }
    });

    return isValid;
}

/**
 * Table utilities
 */
function initializeTables() {
    // Sortable table headers
    const sortableHeaders = document.querySelectorAll('th[data-sort]');
    sortableHeaders.forEach(function(header) {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            const sortBy = this.getAttribute('data-sort');
            const currentSort = getUrlParameter('sort');
            const newSort = (currentSort === sortBy) ? '-' + sortBy : sortBy;

            const url = new URL(window.location);
            url.searchParams.set('sort', newSort);
            window.location.href = url.toString();
        });
    });
}

/**
 * Utility functions
 */
function getUrlParameter(name) {
    const url = new URL(window.location);
    return url.searchParams.get(name);
}

function setUrlParameter(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url.toString());
}

/**
 * AJAX utilities
 */
function makeRequest(url, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
        },
    };

    return fetch(url, { ...defaultOptions, ...options })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Request failed:', error);
            showNotification('An error occurred. Please try again.', 'error');
        });
}

function getCsrfToken() {
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    return token ? token.value : '';
}

/**
 * Notification system
 */
function showNotification(message, type = 'info', duration = 5000) {
    const alertClass = `alert-${type === 'error' ? 'danger' : type}`;
    const alertHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    const container = document.querySelector('.page-content');
    if (container) {
        container.insertAdjacentHTML('afterbegin', alertHtml);

        // Auto dismiss
        setTimeout(() => {
            const alert = container.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, duration);
    }
}

/**
 * Loading states
 */
function setLoading(element, loading = true) {
    if (loading) {
        element.classList.add('loading');
        element.innerHTML = '<div class="spinner-border spinner-border-sm me-2" role="status"></div>' + element.innerHTML;
    } else {
        element.classList.remove('loading');
        const spinner = element.querySelector('.spinner-border');
        if (spinner) spinner.remove();
    }
}

/**
 * Modal utilities
 */
function showModal(modalId) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

function hideModal(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) modal.hide();
}

/**
 * Bulk actions helper
 */
function initializeBulkActions(formId, selectAllId, checkboxesClass) {
    const form = document.getElementById(formId);
    const selectAll = document.getElementById(selectAllId);
    const checkboxes = document.querySelectorAll(checkboxesClass);

    if (!form || !selectAll || !checkboxes.length) return;

    selectAll.addEventListener('change', function() {
        checkboxes.forEach(cb => cb.checked = this.checked);
        updateBulkActionState();
    });

    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateBulkActionState);
    });

    function updateBulkActionState() {
        const checkedBoxes = document.querySelectorAll(`${checkboxesClass}:checked`);
        const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);

        // Update hidden input
        const hiddenInput = form.querySelector('input[name="selected_items"]');
        if (hiddenInput) hiddenInput.value = selectedIds.join(',');

        // Update select all state
        selectAll.checked = checkedBoxes.length === checkboxes.length && checkboxes.length > 0;
        selectAll.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length;
    }
}

/**
 * Chart utilities
 */
function createChart(canvasId, type, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const defaultOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return new Chart(ctx, {
        type: type,
        data: data,
        options: { ...defaultOptions, ...options }
    });
}

/**
 * Export utilities
 */
function exportToCSV(data, filename) {
    const csvContent = "data:text/csv;charset=utf-8,"
        + data.map(row => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportToJSON(data, filename) {
    const jsonContent = "data:text/json;charset=utf-8,"
        + JSON.stringify(data, null, 2);

    const encodedUri = encodeURI(jsonContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Initialize table sorting and filtering
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeTables();
});