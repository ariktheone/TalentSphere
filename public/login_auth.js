document.querySelector('form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email-address').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert('Please fill out all fields.');
    return;
  }

  try {
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Sending login request...');

    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Login successful!');
      window.location.href = 'dashboard.html';  // Change to your actual dashboard path
    } else {
      alert('Login failed: ' + data.message || 'Invalid credentials');
    }
  } catch (err) {
    console.error('Error during login:', err);
    alert('Login failed. Please try again later.');
  }
});
