<script>
  import { goto } from "$app/navigation";

  export let data;
  const players = data.players || [];
  let sortKey = "player";
  let sortDirection = "asc";
  let showHealthy = true;
  let showInjured = true;

  function formatHw(player) {
    return `${player.height} cm / ${player.weight} kg`;
  }

  function displayName(player) {
    if (!player) return "Unnamed Player";
    const name = typeof player.name === "string" ? player.name.trim() : "";
    return name || "Unnamed Player";
  }

  function openPlayer(id) {
    goto(`/players/${id}`);
  }

  function toggleSort(key) {
    if (sortKey === key) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDirection = "asc";
    }
  }

  $: filteredPlayers = players.filter((p) => {
    if (showHealthy && showInjured) return true;
    if (showHealthy && !showInjured) return !p.isInjured;
    if (!showHealthy && showInjured) return p.isInjured;
    return false;
  });

  $: filteredPlayers = players.filter((p) => {
    if (showHealthy && showInjured) return true;
    if (showHealthy && !showInjured) return !p.isInjured;
    if (!showHealthy && showInjured) return p.isInjured;
    return false;
  });

  $: sortedPlayers = (() => {
    if (sortKey === "player") {
      return [...filteredPlayers].sort((a, b) => {
        const aName = displayName(a);
        const bName = displayName(b);
        const cmp = aName.localeCompare(bName);
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }
    if (sortKey === "position") {
      return [...filteredPlayers].sort((a, b) => {
        const aPos = a.position || "";
        const bPos = b.position || "";
        const cmp = aPos.localeCompare(bPos);
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }
    if (sortKey === "age") {
      return [...filteredPlayers].sort((a, b) => {
        const aVal = Number(a.age) || 0;
        const bVal = Number(b.age) || 0;
        const cmp = aVal - bVal;
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }
    if (sortKey === "hw") {
      return [...filteredPlayers].sort((a, b) => {
        const aVal = Number(a.height) || 0;
        const bVal = Number(b.height) || 0;
        const cmp = aVal - bVal;
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }
    if (sortKey === "joinedYear") {
      return [...filteredPlayers].sort((a, b) => {
        const aVal = Number(a.joinedYear) || 0;
        const bVal = Number(b.joinedYear) || 0;
        const cmp = aVal - bVal;
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }
    return filteredPlayers;
  })();
</script>

<div class="page">
  <div class="tabs">
    <button class="tab active">Team Roster</button>
    <button class="tab" on:click={() => goto("/planning")}
      >Trainings & Games Planning</button
    >
  </div>

  <div class="table">
    <div class="table-head">
      <button class="head-cell" on:click={() => toggleSort("player")}>
        PLAYER
        <span class="sort-arrow {sortKey === 'player' ? 'active' : 'inactive'}">
          {sortKey === "player" ? (sortDirection === "asc" ? "▲" : "▼") : "▲"}
        </span>
      </button>

      <button class="head-cell" on:click={() => toggleSort("position")}>
        POSITION
        <span
          class="sort-arrow {sortKey === 'position' ? 'active' : 'inactive'}"
        >
          {sortKey === "position" ? (sortDirection === "asc" ? "▲" : "▼") : "▲"}
        </span>
      </button>

      <button class="head-cell" on:click={() => toggleSort("age")}>
        AGE

        <span class="sort-arrow {sortKey === 'age' ? 'active' : 'inactive'}">
          {sortKey === "age" ? (sortDirection === "asc" ? "▲" : "▼") : "▲"}
        </span>
      </button>

      <button class="head-cell" on:click={() => toggleSort("hw")}>
        HEIGHT / WEIGHT
        <span class="sort-arrow {sortKey === 'hw' ? 'active' : 'inactive'}">
          {sortKey === "hw" ? (sortDirection === "asc" ? "▲" : "▼") : "▲"}
        </span>
      </button>

      <button class="head-cell" on:click={() => toggleSort("joinedYear")}>
        MEMBER SINCE
        <span
          class="sort-arrow {sortKey === 'joinedYear' ? 'active' : 'inactive'}"
        >
          {sortKey === "joinedYear"
            ? sortDirection === "asc"
              ? "▲"
              : "▼"
            : "▲"}
        </span>
      </button>

      <div class="head-cell">
          STATUS
        <div
          style="display:flex; gap:8px; margin-top:4px; font-size:12px;"
          on:click|stopPropagation>
          <label>
            <input
              type="checkbox"
              checked={showHealthy}
              on:change={() => (showHealthy = !showHealthy)}
            />
            Healthy
          </label>

          <label>
            <input
              type="checkbox"
              checked={showInjured}
              on:change={() => (showInjured = !showInjured)}
            />
            Injured
          </label>
        </div>
      </div>
    </div>

    {#if sortedPlayers.length === 0}
      <div class="empty-row">No players available</div>
    {:else}
      {#each sortedPlayers as player, index}
        <div
          class="table-row"
          class:injured={player.isInjured}
          role="link"
          tabindex="0"
          on:click={() => openPlayer(player._id)}
          on:keydown={(e) =>
            (e.key === "Enter" || e.key === " ") && openPlayer(player._id)}
        >
          <div class="cell player-cell">
            <div class="name">{displayName(player)}</div>
            <div class="number">#{index + 1}</div>
          </div>
          <div class="cell">{player.position}</div>
          <div class="cell">{player.age}</div>
          <div class="cell">{formatHw(player)}</div>
          <div class="cell">{player.joinedYear}</div>
          <div class="cell status-cell">
            <span
              class="dot"
              style={`background:${player.isInjured ? "#ff3a3a" : "#00ff62"}`}
            ></span>
            <span>{player.isInjured ? "Injured" : "Active"}</span>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .tabs {
    display: flex;
    gap: 18px;
  }

  .tab {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 22px;
    font-weight: 800;
    padding: 0;
    cursor: pointer;
    position: relative;
  }

  .tab::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -8px;
    height: 3px;
    background: transparent;
    border-radius: 4px;
  }

  .tab.active::after {
    background: #3b5bff;
  }

  .table {
    background: #12121a;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid #1f2030;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
  }

  .table-head,
  .table-row {
    display: grid;
    grid-template-columns: 2.2fr 1fr 0.8fr 1.4fr 1fr 1fr;
    align-items: center;
    padding: 14px 18px;
    gap: 10px;
  }

  .table-head {
    background: #181824;
    color: #a7a8b9;
    font-size: 12px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .head-cell {
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    padding: 0;
  }

  .status-header-title {
  font-weight: inherit;
  text-transform: uppercase;
}

.status-filters {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.9;
}

.status-filters label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

  .table-row {
    background: #17171b;
    border-top: 1px solid #1f2030;
    color: #e1e1e6;
    font-size: 14px;
    cursor: pointer;
  }

  .table-row.injured {
    background: #2a1c1c;
  }

  .table-row:hover {
    background: #1d1d24;
  }

  .cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .player-cell {
    flex-direction: column;
    align-items: flex-start;
  }

  .name {
    font-weight: 700;
  }

  .number {
    color: #9da0b3;
    font-size: 12px;
  }

  .status-cell {
    gap: 10px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(59, 91, 255, 0.08);
  }

  .empty-row {
    padding: 20px;
    text-align: center;
    color: #80839a;
    background: #15151c;
  }

  @media (max-width: 1000px) {
    .table-head,
    .table-row {
      grid-template-columns: 2fr 0.8fr 0.8fr 1.2fr 0.9fr 0.9fr;
      font-size: 13px;
    }
  }

  @media (max-width: 760px) {
    .table-head,
    .table-row {
      grid-template-columns: 1.8fr 0.9fr 0.9fr 1.3fr;
    }
    .table-head div:nth-child(n + 5),
    .table-row .cell:nth-child(n + 5) {
      display: none;
    }
  }
</style>
