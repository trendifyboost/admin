// Import the shared Firebase instance
import { db } from './firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

document.getElementById("login-button").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  console.log("Entered Username:", username);
  console.log("Entered Password:", password);

  const usersRef = ref(db, `users/${username}`);

  get(usersRef)
    .then(snapshot => {
      if (snapshot.exists()) {
        const userData = snapshot.val();

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
    .catch(error => console.error("Database Error:", error));
});
