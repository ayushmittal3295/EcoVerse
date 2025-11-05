// Simple navigation toggle for mobile
document.querySelector('.hamburger').addEventListener('click', function() {
    document.querySelector('.nav-menu').classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.nav-menu').classList.remove('active');
    });
});

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    // In a real application, this would clear the user session
    alert('Logout functionality would be implemented here');
    // Example: Redirect to login page after logout
    // window.location.href = 'login.html';
});

// Simulate loading user points (in a real app, this would come from an API)
document.addEventListener('DOMContentLoaded', function() {
    // Simulate fetching user points
    setTimeout(() => {
        document.getElementById('nav-points').textContent = '350';
    }, 1000);
});