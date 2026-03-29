<script>
  import { onMount } from 'svelte';
  import Login from './Login.svelte';

  let isLoggedIn = false;
  let currentPage = 'login';
  let items = [];
  let loading = false;
  let error = '';
  let adminUser = null;

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  onMount(() => {
    checkAuth();
    window.addEventListener('hashchange', handleHashChange);
  });

  function checkAuth() {
    const token = localStorage.getItem('admin_token');
    if (token) {
      const userStr = localStorage.getItem('admin_user');
      adminUser = userStr ? JSON.parse(userStr) : null;
      isLoggedIn = true;
      currentPage = 'dashboard';
      loadShop();
    } else {
      isLoggedIn = false;
      currentPage = 'login';
    }
  }

  function handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (hash === 'logout') {
      logout();
    }
  }

  async function loadShop() {
    loading = true;
    error = '';
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/admin/shop`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await res.json();
      items = data.items || [];
    } catch (err) {
      error = 'Failed to load shop items';
      items = [];
    }
    loading = false;
  }

  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    isLoggedIn = false;
    currentPage = 'login';
    adminUser = null;
    items = [];
    window.location.hash = '#login';
  }
</script>

{#if currentPage === 'login'}
  <Login />
{:else if currentPage === 'dashboard' && isLoggedIn}
  <div class="dashboard">
    <header>
      <div class="header-content">
        <h1>Admin Panel - Shop Management</h1>
        <div class="header-right">
          {#if adminUser}
            <span class="user-info">{adminUser.username} ({adminUser.role})</span>
          {/if}
          <button class="logout-btn" on:click={logout}>Logout</button>
        </div>
      </div>
    </header>

    <main>
      {#if error}
        <div class="error">{error}</div>
      {/if}

      {#if loading}
        <div class="loading">
          <div class="loading-spinner"></div>
          <p>Loading shop items...</p>
        </div>
      {:else if items.length === 0}
        <div class="empty">Shop is empty</div>
      {:else}
        <div class="items-grid">
          {#each items as item (item.item_id)}
            <div class="item-card">
              <div class="emoji">{item.emoji || '📦'}</div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div class="footer">
                <div class="price">{item.price} coins</div>
                <div class="type">{item.type}</div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </main>
  </div>
{/if}

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, sans-serif;
    background: #f5f5f5;
  }

  .dashboard {
    min-height: 100vh;
    background: #f5f5f5;
  }

  header {
    background: #333;
    color: white;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  header h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-info {
    font-size: 0.9rem;
    color: #ccc;
  }

  .logout-btn {
    padding: 0.5rem 1rem;
    background: #d32f2f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.3s;
  }

  .logout-btn:hover {
    background: #b71c1c;
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .error {
    background: #ffebee;
    color: #d32f2f;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .loading,
  .empty {
    text-align: center;
    padding: 3rem;
    color: #999;
  }

  .loading-spinner {
    border: 3px solid #ddd;
    border-top: 3px solid #333;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .item-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .item-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .emoji {
    font-size: 3rem;
    text-align: center;
    margin-bottom: 1rem;
    line-height: 1;
  }

  .item-card h3 {
    margin: 0.5rem 0;
    color: #333;
    font-size: 1.1rem;
  }

  .item-card p {
    margin: 0.5rem 0;
    color: #666;
    font-size: 0.9rem;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }

  .price {
    font-weight: bold;
    color: #667eea;
    font-size: 1.1rem;
  }

  .type {
    display: inline-block;
    background: #e0e0e0;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    color: #666;
    font-weight: 500;
  }
</style>
