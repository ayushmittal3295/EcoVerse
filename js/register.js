// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Your Firebase config (fixed storageBucket)
const firebaseConfig = {
  apiKey: "AIzaSyD6O3gAyio0njhmr7Qz4aDf8Hz0qY2AC3U",
  authDomain: "ecolearn-4a23f.firebaseapp.com",
  projectId: "ecolearn-4a23f",
  storageBucket: "ecolearn-4a23f.appspot.com", // ✅ fixed
  messagingSenderId: "626294301194",
  appId: "1:626294301194:web:dd8882b2e4e7c3da44f5f3",
  measurementId: "G-S3TNCFCN60"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get form reference
const registerForm = document.getElementById('register-form');

// Show feedback
function showMessage(msg, type) {
  alert(msg); // you can replace with custom popup later
}

// Register user
async function registerUser(firstName, lastName, email, password, userType) {
  const submitBtn = document.querySelector('.btn-primary');
  const originalText = submitBtn.textContent;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
  submitBtn.disabled = true;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showMessage("🎉 Account created successfully! Redirecting...", "success");

    setTimeout(() => {
      window.location.href = "dashboard.html"; // redirect after signup
    }, 2000);

  } catch (error) {
    showMessage("❌ " + error.message, "error");
  }

  submitBtn.textContent = originalText;
  submitBtn.disabled = false;
}

// Form submit handler
if (registerForm) {
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const userType = document.getElementById('userType').value;
    const terms = document.getElementById('terms').checked;

    if (password !== confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }
    if (!terms) {
      showMessage('You must agree to the Terms', 'error');
      return;
    }

    // Call Firebase register
    registerUser(firstName, lastName, email, password, userType);
  });
}
