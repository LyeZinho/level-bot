<script>
  import { onMount } from 'svelte';

  let items = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      loading = true;
      error = '';
      
      const response = await fetch('/api/admin/shop', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status}`);
      }
      
      const data = await response.json();
      items = data.items || [];
    } catch (err) {
      console.error('Error loading shop:', err);
      error = err.message;
      items = [];
    } finally {
      loading = false;
    }
  });
</script>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    background: #0a0a0a;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    line-height: 1.6;
  }

  :global(html) {
    font-size: 16px;
  }

  header {
    background: #1a1a1a;
    border-bottom: 2px solid #8b5cf6;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  h1 {
    color: #8b5cf6;
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
    letter-spacing: 1px;
  }

  p.subtitle {
    color: #999999;
    margin: 0.5rem 0 0 0;
    font-size: 0.9rem;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .shop-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .card {
    background: #1a1a1a;
    border: 2px solid #333333;
    border-radius: 8px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
  }

  .card:hover {
    border-color: #8b5cf6;
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
    transform: translateY(-4px);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .emoji {
    font-size: 2.5rem;
    line-height: 1;
  }

  .type-badge {
    background: #8b5cf6;
    color: #fff;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  h2 {
    color: #ffffff;
    font-size: 1.2rem;
    margin: 0 0 0.5rem 0;
    word-break: break-word;
  }

  p.description {
    color: #aaaaaa;
    font-size: 0.9rem;
    margin: 0 0 1rem 0;
    flex-grow: 1;
    word-break: break-word;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #333333;
    padding-top: 1rem;
    margin-top: 1rem;
  }

  .price {
    color: #8b5cf6;
    font-size: 1.3rem;
    font-weight: bold;
  }

  .buy-button {
    background: #8b5cf6;
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .buy-button:hover {
    background: #a78bfa;
    transform: scale(1.05);
  }

  .buy-button:active {
    transform: scale(0.95);
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #666666;
  }

  .empty-state p {
    font-size: 1.1rem;
    margin: 0;
  }

  .error {
    background: #7c2d12;
    border: 2px solid #c7682a;
    border-radius: 8px;
    padding: 1rem;
    margin: 2rem;
    color: #fed7aa;
  }

  .loading {
    text-align: center;
    padding: 4rem 2rem;
    color: #666666;
  }

  .loading-spinner {
    border: 3px solid #333333;
    border-top: 3px solid #8b5cf6;
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
</style>

<header>
  <div class="container">
    <h1>🛍️ Level Bot Shop</h1>
    <p class="subtitle">Compre itens especiais com suas PityCoins</p>
  </div>
</header>

<div class="container">
  {#if error}
    <div class="error">
      <strong>Erro ao carregar loja:</strong> {error}
    </div>
  {/if}

  {#if loading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Carregando loja...</p>
    </div>
  {:else if items.length === 0}
    <div class="empty-state">
      <p>A loja está vazia no momento. 😢</p>
      <p style="font-size: 0.9rem; margin-top: 1rem;">Volte mais tarde!</p>
    </div>
  {:else}
    <div class="shop-grid">
      {#each items as item (item.itemId)}
        <div class="card">
          <div class="card-header">
            <div class="emoji" role="img" aria-label={item.name}>{item.emoji || '📦'}</div>
            <span class="type-badge">{item.type}</span>
          </div>
          <h2>{item.name}</h2>
          <p class="description">{item.description || 'Sem descrição'}</p>
          <div class="card-footer">
            <span class="price">💰 {item.price}</span>
            <button class="buy-button">Comprar</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
