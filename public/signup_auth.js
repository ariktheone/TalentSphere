document.getElementById('signup-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email-address').value;
  const password = document.getElementById('password').value;
  const terms = document.getElementById('terms').checked;

  if (!name || !email || !password) {
    alert('Please fill out all fields.');
    return;
  }

  if (!terms) {
    alert('Please agree to the Terms of Service.');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const msg = await res.text();
    if (res.ok) {
      alert('Signup successful!');
      window.location.href = 'dashboard.html';  // Redirect to the dashboard
    } else {
      alert('Error: ' + msg);
    }
  } catch (err) {
    alert('Failed to sign up. Try again later.');
  }
});
