// Basic interactive functions
document.addEventListener('DOMContentLoaded', function() {
    // Simple counter
    let count = 0;
    const counterDisplay = document.getElementById('counter');
    
    function updateCounter() {
        count++;
        if (counterDisplay) {
            counterDisplay.textContent = `Count: ${count}`;
        }
    }

    // Example of class manipulation
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
    }

    // Simple form validation
    function validateForm(event) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        
        if (nameInput && nameInput.value.trim() === '') {
            alert('Please enter your name');
            event.preventDefault();
            return false;
        }
        
        if (emailInput && !emailInput.value.includes('@')) {
            alert('Please enter a valid email');
            event.preventDefault();
            return false;
        }
        
        return true;
    }

    // Event listeners
    const button = document.getElementById('countButton');
    if (button) {
        button.addEventListener('click', updateCounter);
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleDarkMode);
    }

    const form = document.getElementById('myForm');
    if (form) {
        form.addEventListener('submit', validateForm);
    }
});
