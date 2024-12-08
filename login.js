document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    // Get reference to user data
    const userRef = database.ref('users/' + username);
    const snapshot = await userRef.once('value');
    const userData = snapshot.val();

    if (userData && userData.password === password) {
      // Successful login
      console.log('Login successful');
      localStorage.setItem('username', username);
      window.location.href = 'admin.html'; // Redirect to admin.html
    } else {
      // Invalid credentials
      console.error('Invalid Username or Password');
      document.getElementById('error-message').textContent = 'Invalid Username or Password';
    }
  } catch (err) {
    // Handle database errors
    console.error('Database Error:', err);
    document.getElementById('error-message').textContent = 'Something went wrong';
  }
});
