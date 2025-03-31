// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle functionality
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Form validation helpers
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
      const requiredFields = this.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.classList.add('border-red-500');
          isValid = false;
        } else {
          field.classList.remove('border-red-500');
        }
      });

      if (!isValid) {
        e.preventDefault();
        showToast('Please fill in all required fields', 'error');
      }
    });
  });

  // Initialize tooltips if Tippy is loaded
  if (typeof tippy === 'function') {
    tippy('[data-tippy-content]', {
      arrow: true,
      animation: 'scale'
    });
  }

  // Vendor card hover effects
  document.querySelectorAll('.vendor-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('shadow-lg');
    });
    card.addEventListener('mouseleave', function() {
      this.classList.remove('shadow-lg');
    });
  });

  // Booking date picker initialization
  const datePickers = document.querySelectorAll('.date-picker');
  if (datePickers.length && typeof flatpickr === 'function') {
    flatpickr('.date-picker', {
      minDate: 'today',
      dateFormat: 'Y-m-d'
    });
  }
});

// Utility functions
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-md text-white ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } flex items-center`;
  
  const icon = document.createElement('i');
  icon.className = type === 'success' ? 'fas fa-check-circle mr-2' : 'fas fa-exclamation-circle mr-2';
  
  const text = document.createElement('span');
  text.textContent = message;
  
  toast.appendChild(icon);
  toast.appendChild(text);
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Image lazy loading
if ('IntersectionObserver' in window) {
  const lazyImages = document.querySelectorAll('img.lazy');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imageObserver.observe(img));
}

// Form submission handling
async function handleFormSubmit(form, successMessage) {
  try {
    const formData = new FormData(form);
    const response = await fetch(form.action, {
      method: form.method,
      body: formData
    });
    
    if (response.ok) {
      showToast(successMessage || 'Form submitted successfully!');
      form.reset();
    } else {
      throw new Error('Form submission failed');
    }
  } catch (error) {
    showToast('An error occurred. Please try again.', 'error');
    console.error('Form submission error:', error);
  }
}