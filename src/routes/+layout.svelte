<script>
  import { page } from "$app/stores";
  import { goto, invalidateAll } from "$app/navigation";

  export let data;

  let players = data.players || [];
  let showAddModal = false;
  let addError = "";
  let isSubmitting = false;
  let form = {
    name: "",
    position: "PG",
    age: "",
    height: "",
    weight: "",
    joinedYear: ""
  };
  let photoFile = null;

  $: players = data.players || players;
  $: currentPath = $page.url.pathname;
  $: activePlayerId = $page.params.id;

  const positions = ["PG", "SG", "SF", "PF", "C"];

  function displayName(player) {
    if (!player) return "Unnamed Player";
    const name = typeof player.name === "string" ? player.name.trim() : "";
    return name || "Unnamed Player";
  }

  function resetForm() {
    form = {
      name: "",
      position: "PG",
      age: "",
      height: "",
      weight: "",
      joinedYear: ""
    };
    addError = "";
    photoFile = null;
  }

  function navigateToPlayer(id) {
    goto(`/players/${id}`);
  }

  function openAddModal() {
    resetForm();
    showAddModal = true;
  }

  function closeAddModal() {
    showAddModal = false;
    addError = "";
  }

  function handlePhotoChange(event) {
    const [file] = event.target.files || [];
    photoFile = file || null;
  }

  async function submitAddPlayer(event) {
    event.preventDefault();
    addError = "";
    isSubmitting = true;
    try {
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("position", form.position);
      payload.append("age", form.age);
      payload.append("height", form.height);
      if (form.weight !== "") payload.append("weight", form.weight);
      payload.append("joinedYear", form.joinedYear);
      if (photoFile) {
        payload.append("photo", photoFile, photoFile.name);
      }

      const res = await fetch("/api/players", { method: "POST", body: payload });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        addError = err.error || "Could not add player";
        return;
      }

      await invalidateAll();
      closeAddModal();
      if (currentPath !== "/") {
        await goto("/");
      }
    } catch (err) {
      addError = "Unexpected error while creating player";
    } finally {
      isSubmitting = false;
    }
  }

  function statusColor(isInjured) {
    return isInjured ? "#ff3a3a" : "#00ff62";
  }

  function isActivePlayer(playerId) {
    return currentPath.startsWith("/players/") && activePlayerId === playerId;
  }
</script>

<svelte:head>
  <style>
    :global(body) {
      margin: 0;
      background: #0b0b0f;
      color: #e1e1e6;
      font-family: "Space Grotesk", "Segoe UI", sans-serif;
    }
    :global(a) {
      color: inherit;
      text-decoration: none;
    }
  </style>
</svelte:head>

<div class="app-shell">
  <aside class="sidebar">
    <div class="branding">
      <div class="title">ROSTER</div>
      <div class="subtitle">Player Management</div>
    </div>

    <button
      class="overview-btn"
      class:active={currentPath === "/"}
      on:click={() => goto("/")}
    >
      <span class="left-bar"></span>
      TEAM OVERVIEW
    </button>

    <div class="player-list">
      {#if players.length === 0}
        <div class="empty">No players yet</div>
      {:else}
        {#each players as player, index}
          <div
            class="player-row"
            class:active={isActivePlayer(player._id)}
            role="link"
            tabindex="0"
            on:click={() => navigateToPlayer(player._id)}
            on:keydown={(e) => (e.key === "Enter" || e.key === " ") && navigateToPlayer(player._id)}
          >
            <span class="status" style={`background:${statusColor(player.isInjured)}`}></span>
            <div class="player-main">
              <div class="player-name">{displayName(player)}</div>
              <div class="player-meta">
                <span class="position">{player.position}</span>
                <span class="number">#{index + 1}</span>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <button class="add-btn" on:click={openAddModal}>+ Add Player</button>
  </aside>

  <main class="content">
    <slot />
  </main>
</div>

{#if showAddModal}
  <div class="modal-backdrop" on:click={closeAddModal}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Add New Player</h2>
      </div>
      <form class="modal-body" on:submit={submitAddPlayer}>
        <label>
          <span>Player Name</span>
          <input required placeholder="Name" bind:value={form.name} />
        </label>
        <label>
          <span>Position</span>
          <select bind:value={form.position}>
            {#each positions as pos}
              <option value={pos}>{pos}</option>
            {/each}
          </select>
        </label>
        <label>
          <span>Age</span>
          <input required type="number" min="1" placeholder="Age" bind:value={form.age} />
        </label>
        <label>
          <span>Height (185–216)</span>
          <input required type="number" min="185" max="216" placeholder="cm" bind:value={form.height} />
        </label>
        <label>
          <span>Weight (optional)</span>
          <input type="number" step="0.1" placeholder="kg" bind:value={form.weight} />
        </label>
        <label>
          <span>Member Since</span>
          <input required type="number" placeholder="Year" bind:value={form.joinedYear} />
        </label>
        <label>
          <span>Player Photo (optional)</span>
          <input type="file" accept="image/*" on:change={handlePhotoChange} />
        </label>

        {#if addError}
          <div class="error">{addError}</div>
        {/if}

        <div class="actions">
          <button class="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Player"}
          </button>
          <button class="secondary" type="button" on:click={closeAddModal}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .app-shell {
    display: grid;
    grid-template-columns: 260px 1fr;
    min-height: 100vh;
    background: radial-gradient(circle at 20% 20%, #12121a, #0b0b0f 55%);
  }

  .sidebar {
    background: #0e0e11;
    padding: 20px 18px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.45);
  }

  .branding .title {
    color: #b5b5be;
    letter-spacing: 1.8px;
    font-weight: 700;
    font-size: 14px;
  }

  .branding .subtitle {
    color: #6f7381;
    font-size: 12px;
    margin-top: 4px;
  }

  .overview-btn {
    position: relative;
    background: #161621;
    color: #c9c9d3;
    border: none;
    padding: 12px 14px 12px 18px;
    font-weight: 700;
    letter-spacing: 0.3px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: inset 0 0 0 1px #24253a;
  }

  .overview-btn .left-bar {
    width: 4px;
    height: 24px;
    background: #3b5bff;
    border-radius: 8px;
  }

  .overview-btn.active {
    background: linear-gradient(90deg, #1c2b70, #273a9b);
    color: #fff;
  }

  .player-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .player-row {
    display: grid;
    grid-template-columns: 12px 1fr;
    align-items: center;
    gap: 12px;
    padding: 12px 12px;
    background: #15151c;
    border-radius: 12px;
    transition: background 0.2s ease, transform 0.2s ease;
    border: 1px solid transparent;
  }

  .player-row:hover {
    background: #1b1b25;
    transform: translateX(3px);
  }

  .player-row.active {
    background: #3b5bff;
    color: #fff;
    border-color: #4a66ff;
  }

  .status {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    box-shadow: 0 0 0 3px rgba(59, 91, 255, 0.08);
  }

  .player-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .player-name {
    font-weight: 700;
    font-size: 14px;
    color: #fff;
  }

  .player-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #8e91a3;
    font-size: 12px;
  }

  .position {
    font-weight: 600;
  }

  .number {
    color: #cfd1e4;
  }

  .empty {
    color: #787b8d;
    font-size: 13px;
    padding: 12px;
    background: #12121a;
    border-radius: 10px;
    text-align: center;
  }

  .add-btn {
    width: 100%;
    background: #3b5bff;
    color: #fff;
    border: none;
    padding: 12px;
    border-radius: 12px;
    font-weight: 700;
    letter-spacing: 0.3px;
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(59, 91, 255, 0.3);
  }

  .add-btn:hover {
    background: #4a66ff;
  }

  .content {
    padding: 28px 32px;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(5, 5, 9, 0.65);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 20;
    backdrop-filter: blur(4px);
  }

  .modal {
    width: 520px;
    background: #12121a;
    border-radius: 16px;
    border: 1px solid #26263a;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
  }

  .modal-header {
    padding: 18px 22px;
    border-bottom: 1px solid #1f2030;
  }

  .modal-header h2 {
    margin: 0;
    color: #fff;
    letter-spacing: 0.2px;
  }

  .modal-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 16px;
    padding: 18px 22px 24px;
  }

  .modal-body label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
    color: #9ba0b5;
  }

  .modal-body input,
  .modal-body select {
    background: #181824;
    border: 1px solid #2c2d3f;
    color: #e1e1e6;
    padding: 10px;
    border-radius: 10px;
    font-size: 14px;
  }

  .modal-body input:focus,
  .modal-body select:focus {
    outline: 1px solid #3b5bff;
  }

  .modal-body label:nth-child(7) {
    grid-column: span 2;
  }

  .error {
    grid-column: span 2;
    color: #ff3a3a;
    font-size: 13px;
  }

  .actions {
    grid-column: span 2;
    display: flex;
    gap: 12px;
    margin-top: 4px;
  }

  .actions button {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-weight: 700;
  }

  .actions .primary {
    background: #3b5bff;
    color: #fff;
  }

  .actions .secondary {
    background: #fff;
    color: #0e0e11;
  }

  @media (max-width: 900px) {
    .app-shell {
      grid-template-columns: 1fr;
    }
    .sidebar {
      flex-direction: row;
      overflow-x: auto;
      gap: 12px;
    }
    .player-list {
      max-height: 180px;
      min-width: 240px;
    }
    .content {
      padding: 18px;
    }
    .modal {
      width: 92%;
    }
    .modal-body {
      grid-template-columns: 1fr;
    }
    .actions {
      flex-direction: column;
    }
  }
</style>
