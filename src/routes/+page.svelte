<script>
  export let data;
  const players = data.players || [];

  function formatHw(player) {
    return `${player.height} cm / ${player.weight} kg`;
  }

  function displayName(player) {
    if (!player) return "Unnamed Player";
    const name = typeof player.name === "string" ? player.name.trim() : "";
    return name || "Unnamed Player";
  }
</script>

<div class="page">
  <div class="header">
    <h1>TEAM ROSTER</h1>
    <div class="underline"></div>
  </div>

  <div class="table">
    <div class="table-head">
      <div>PLAYER</div>
      <div>POSITION</div>
      <div>AGE</div>
      <div>HEIGHT / WEIGHT</div>
      <div>MEMBER SINCE</div>
      <div>STATUS</div>
    </div>

    {#if players.length === 0}
      <div class="empty-row">No players available</div>
    {:else}
      {#each players as player, index}
        <div class="table-row" class:injured={player.isInjured}>
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

  .header h1 {
    margin: 0;
    color: #fff;
    font-size: 28px;
    letter-spacing: 0.6px;
  }

  .underline {
    width: 160px;
    height: 3px;
    background: #3b5bff;
    margin-top: 8px;
    border-radius: 4px;
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

  .table-row {
    background: #17171b;
    border-top: 1px solid #1f2030;
    color: #e1e1e6;
    font-size: 14px;
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
    .table-head div:nth-child(n+5),
    .table-row .cell:nth-child(n+5) {
      display: none;
    }
  }
</style>
