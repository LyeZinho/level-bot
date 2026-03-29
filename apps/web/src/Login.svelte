<script>
  import { onMount } from 'svelte';

  let username = '';
  let password = '';
  let error = '';
  let loading = false;

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  onMount(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      window.location.hash = '#dashboard';
    }
  });

  async function handleLogin(e) {
    e.preventDefault();
    error = '';
    loading = true;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        error = 'Invalid credentials';
        loading = false;
        return;
      }

      const data = await res.json();
      localStorage.setItem('admin_token', data.access_token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      window.location.hash = '#dashboard';
    } catch (err) {
      error = 'Connection error. Check API server.';
      loading = false;
    }
  }
</script>

<div class="login-container">
  <div class="login-box">
    <h1>Admin Panel</h1>
    <form on:submit={handleLogin}>
      <input
        type="text"
        placeholder="Username"
        bind:value={username}
        disabled={loading}
        required
      />
      <input
        type="password"
        placeholder="Password"
        bind:value={password}
        disabled={loading}
        required
      />
      {#if error}
        <div class="error">{error}</div>
      {/if}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: system-ui, -apple-system, sans-serif;
  }

  .login-box {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 400px;
  }

  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  button {
    padding: 0.75rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s;
  }

  button:hover:not(:disabled) {
    background: #764ba2;
  }

  button:disabled {
    background: #999;
    cursor: not-allowed;
  }

  .error {
    color: #d32f2f;
    font-size: 0.9rem;
    padding: 0.5rem;
    background: #ffebee;
    border-radius: 4px;
  }
</style>
