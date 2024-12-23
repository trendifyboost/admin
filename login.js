// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5JTd88XMPaw8ThV8i4wh8r37uhSuuKiQ",
  authDomain: "trendify-30126.firebaseapp.com",
  databaseURL: "https://trendify-30126-default-rtdb.firebaseio.com",
  projectId: "trendify-30126",
  storageBucket: "trendify-30126.firebasestorage.app",
  messagingSenderId: "816600328899",
  appId: "1:816600328899:web:4b01799c1e82e932451076",
  measurementId: "G-9QV2QDB3CG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Login Button Event Listener
document.getElementById("login-button").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  console.log("Entered Username:", username);
  console.log("Entered Password:", password);

  // Corrected Reference Path
  const usersRef = ref(db, `users/${username}`);
  console.log("Firebase Reference Path:", `users/${username}`);

  get(usersRef)
    .then(snapshot => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log("Retrieved User Data:", userData);

        // Check if passwords match
        if (userData.password === password) {
          console.log("Password Match: Login successful!");
          document.getElementById("login-section").style.display = "none";
          document.getElementById("admin-panel").style.display = "block";
        } else {
          console.log("Password Mismatch: Invalid password!");
          alert("Invalid password!");
        }
      } else {
        console.log("No user found with this username.");
        alert("Username not found in database!");
      }
    })
    .catch(error => {
      console.error("Database Error:", error);
    });
});
