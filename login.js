document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const userRef = database.ref('users/' + username);
    const snapshot = await userRef.once('value');
    const userData = snapshot.val();

    if (userData && userData.password === password) {
      console.log('Login successful');
      localStorage.setItem('username', username);
      window.location.href = 'admin.html';
    } else {
      console.error('Invalid Username or Password');
      document.getElementById('error-message').textContent = 'Invalid Username or Password';
    }
  } catch (err) {
    console.error('Database Error:', err);
    document.getElementById('error-message').textContent = 'Something went wrong';
  }
});
