// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Your Firebase config (only once!)
const firebaseConfig = {
  apiKey: "AIzaSyD6O3gAyio0njhmr7Qz4aDf8Hz0qY2AC3U",
  authDomain: "ecolearn-4a23f.firebaseapp.com",
  projectId: "ecolearn-4a23f",
  storageBucket: "ecolearn-4a23f.appspot.com", // ✅ fixed
  messagingSenderId: "626294301194",
  appId: "1:626294301194:web:dd8882b2e4e7c3da44f5f3",
  measurementId: "G-S3TNCFCN60"
};

// Init Firebase only once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ---------- REGISTER ----------
// ---------- REGISTER ----------
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;

    if (password !== confirmPassword) {
      showMessage('❌ Passwords do not match', 'error');
      return;
    }
    if (!terms) {
      showMessage('❌ You must agree to the Terms', 'error');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      
      // ✅ Show success message but stay on the same page
      showMessage("🎉 Account created successfully!", "success");

      // (Optional) Clear the form
      registerForm.reset();

    } catch (error) {
      showMessage("❌ " + error.message, "error");
    }
  });
}


// ---------- LOGIN ----------
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage("✅ Login successful! Redirecting...", "success");
      setTimeout(() => window.location.href = "dashboard.html", 2000);
    } catch (error) {
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        showMessage("❌ Incorrect email or password", "error");
      } else if (error.code === "auth/user-not-found") {
        showMessage("❌ No account found with this email", "error");
      } else {
        showMessage("❌ " + error.message, "error");
      }
    }
  });
}

// ---------- Helper ----------
function showMessage(message, type) {
  alert(message); // replace with custom popup if needed
}
