// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyD6O3gAyio0njhmr7Qz4aDf8Hz0qY2AC3U",
    authDomain: "ecolearn-4a23f.firebaseapp.com",
    projectId: "ecolearn-4a23f",
    storageBucket: "ecolearn-4a23f.firebasestorage.app",
    messagingSenderId: "626294301194",
    appId: "1:626294301194:web:dd8882b2e4e7c3da44f5f3",
    measurementId: "G-S3TNCFCN60"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Debug logging
console.log("Firebase initialized");

// Google Sign-In function
async function signInWithGoogle() {
    console.log("signInWithGoogle function called");

    // Add ID to Google button if it doesn't exist
    let googleBtn = document.getElementById("google-signin");

    if (!googleBtn) {
        const googleButtons = document.querySelectorAll('.google-btn');
        if (googleButtons.length > 0) {
            googleBtn = googleButtons[0];
            googleBtn.id = "google-signin";
        } else {
            console.error("Google button not found!");
            showMessage("Google sign-in button not found", "error");
            return;
        }
    }
    
    console.log("Google button found, proceeding with sign-in");
    
    // Save original button content
   
    
    // Show loading state - just the spinner without text
    googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    googleBtn.disabled = true;

    try {
        console.log("Attempting Google sign-in...");
        const result = await signInWithPopup(auth, googleProvider);
        
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        
        // The signed-in user info
        const user = result.user;
        console.log("Google user logged in:", user);
        
        // Show success message without mentioning Google
        showMessage("Login successful! Redirecting...", "success");

        setTimeout(() => {
            window.location.href = "dashboard.html"; // redirect after login
        }, 2000);
        
    } catch (error) {
        console.error("Google sign-in error:", error);
        
        // Handle specific errors - don't show any message for canceled sign-in
        if (error.code !== 'auth/popup-closed-by-user') {
            // Only show message for errors other than user closing the popup
            showMessage("Sign-in failed: " + error.message, "error");
        }
        
        // Restore button
        googleBtn.innerHTML = originalHtml;
        googleBtn.disabled = false;
    }
}

// Add Google sign-in button event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Add ID to Google button if it doesn't exist
    let googleSignInBtn = document.getElementById("google-signin");
    if (!googleSignInBtn) {
        const googleButtons = document.querySelectorAll('.google-btn');
        if (googleButtons.length > 0) {
            googleSignInBtn = googleButtons[0];
            googleSignInBtn.id = "google-signin";
        }
    }
    
    if (googleSignInBtn) {
        console.log("Google sign-in button found, adding event listener");
        googleSignInBtn.addEventListener("click", signInWithGoogle);
    } else {
        console.error("Google sign-in button NOT found!");
    }
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
});

// Handle login form
const loginForm = document.getElementById("login-form");
if (loginForm) {
    console.log("Login form found");
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const submitBtn = document.querySelector(".login-btn");

        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        submitBtn.disabled = true;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in:", userCredential.user);

            // Show success message
            showMessage("Login successful! Redirecting...", "success");

            setTimeout(() => {
                window.location.href = "dashboard.html"; // redirect after login
            }, 2000);
        } catch (error) {
            console.error(error);
            showMessage(error.message, "error");
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Toggle password visibility
const togglePassword = document.getElementById("toggle-password");
const passwordInput = document.getElementById("password");

if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);

        const icon = this.querySelector("i");
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
    });
}

// Show messages with enhanced styling
function showMessage(message, type) {
    const existing = document.querySelector(".login-message");
    if (existing) existing.remove();

    const msgEl = document.createElement("div");
    msgEl.className = `login-message ${type}`;
    
    // Add appropriate icon based on message type
    let iconClass = "fas fa-info-circle";
    if (type === "error") iconClass = "fas fa-exclamation-circle";
    if (type === "success") iconClass = "fas fa-check-circle";
    if (type === "warning") iconClass = "fas fa-exclamation-triangle";
    
    msgEl.innerHTML = `<i class="${iconClass}"></i> ${message}`;

    const loginHeader = document.querySelector(".login-header");
    if (loginHeader) {
        loginHeader.parentNode.insertBefore(msgEl, loginHeader.nextSibling);
    }

    setTimeout(() => {
        msgEl.classList.add("fade-out");
        setTimeout(() => {
            if (msgEl.parentNode) {
                msgEl.remove();
            }
        }, 500);
    }, 4500);
}