document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const userRef = database.ref('users/' + username);
    const snapshot = await userRef.once('value');
    const userData = snapshot.val();

    if (userData && userData.password === password) {
      console.log('Login successful');
      localStorage.setItem('username', username);
      window.location.href = 'admin.html'; // Redirect to admin panel
    } else {
      document.getElementById('error-message').textContent = 'Invalid Username or Password';
    }
  } catch (error) {
    document.getElementById('error-message').textContent = 'Something went wrong. Try again.';
    console.error('Error:', error);
  }
});
