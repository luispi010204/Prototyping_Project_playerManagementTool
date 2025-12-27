<script>
  import { goto, invalidateAll } from "$app/navigation";

  export let data;

  let player = data.player;
  const players = data.players || [];
  let injuryFormOpen = false;
  let actionError = "";
  let loadingAction = false;
  let overridePlayer = null;
  let lastPlayerId = player ? player._id : null;
  let injuryForm = { date: "", description: "", expectedRecovery: "" };
  let editMode = false;
  let editError = "";
  let editLoading = false;
  let editPhotoFile = null;
  let editForm = {
    name: player.name || "",
    position: player.position || "PG",
    age: player.age || "",
    height: player.height || "",
    weight: player.weight || "",
    joinedYear: player.joinedYear || ""
  };

  $: if (data && data.player && overridePlayer && data.player._id !== overridePlayer._id) {
    overridePlayer = null;
  }

  $: player = overridePlayer || data.player;
  $: status = player && player.isInjured ? "out - injured" : "active";

  $: if (player && player._id !== lastPlayerId) {
    lastPlayerId = player._id;
    editMode = false;
    editPhotoFile = null;
    editError = "";
    editForm = {
      name: player.name || "",
      position: player.position || "PG",
      age: player.age || "",
      height: player.height || "",
      weight: player.weight || "",
      joinedYear: player.joinedYear || ""
    };
  }

  $: injuryCount = (player.injuries || []).length;
  $: playerNumber = players.findIndex((p) => p._id === player._id) + 1;

  function displayName(p) {
    if (!p) return "Unnamed Player";
    const name = typeof p.name === "string" ? p.name.trim() : "";
    return name || "Unnamed Player";
  }

  function badgeText() {
    return status;
  }

  function badgeClass() {
    return player && player.isInjured ? "badge injured" : "badge active";
  }

  function initials(name) {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  async function submitInjury(event) {
    event.preventDefault();
    actionError = "";
    loadingAction = true;
    try {
      const payload = {
        date: injuryForm.date,
        description: injuryForm.description.trim(),
        expectedRecovery: injuryForm.expectedRecovery.trim()
      };
      const res = await fetch(`/api/players/${player._id}/injuries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        actionError = err.error || "Could not add injury";
        return;
      }
      const updatedPlayer = await res.json();
      overridePlayer = updatedPlayer;
      player = updatedPlayer;
      injuryFormOpen = false;
      injuryForm = { date: "", description: "", expectedRecovery: "" };
      await invalidateAll();
      window.location.reload();
    } catch (err) {
      actionError = "Unexpected error while reporting injury";
    } finally {
      loadingAction = false;
    }
  }

  async function markRecovered() {
    actionError = "";
    loadingAction = true;
    try {
      const res = await fetch(`/api/players/${player._id}/heal`, {
        method: "POST"
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        actionError = err.error || "Could not mark recovered";
        return;
      }
      const updatedPlayer = await res.json();
      overridePlayer = updatedPlayer;
      player = updatedPlayer;
      await invalidateAll();
      window.location.reload();
    } catch (err) {
      actionError = "Unexpected error while updating status";
    } finally {
      loadingAction = false;
    }
  }

  async function deletePlayer() {
    const confirmDelete = window.confirm("Delete this player?");
    if (!confirmDelete) return;
    actionError = "";
    loadingAction = true;
    try {
      const res = await fetch(`/api/players/${player._id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        actionError = err.error || "Could not delete player";
        return;
      }
      await invalidateAll();
      await goto("/");
    } catch (err) {
      actionError = "Unexpected error while deleting player";
    } finally {
      loadingAction = false;
    }
  }

  function beginEdit() {
    editForm = {
      name: player.name || "",
      position: player.position || "PG",
      age: player.age || "",
      height: player.height || "",
      weight: player.weight || "",
      joinedYear: player.joinedYear || ""
    };
    editError = "";
    editMode = true;
  }

  function cancelEdit() {
    editMode = false;
    editError = "";
    editPhotoFile = null;
  }

  function handleEditPhotoChange(event) {
    const [file] = event.target.files || [];
    editPhotoFile = file || null;
  }

  async function saveEdit() {
    editError = "";
    editLoading = true;
    try {
      const payload = new FormData();
      payload.append("name", editForm.name.trim());
      payload.append("position", editForm.position);
      payload.append("age", editForm.age);
      payload.append("height", editForm.height);
      if (editForm.weight !== "") payload.append("weight", editForm.weight);
      payload.append("joinedYear", editForm.joinedYear);
      if (editPhotoFile) {
        payload.append("photo", editPhotoFile, editPhotoFile.name);
      }

      const res = await fetch(`/api/players/${player._id}`, {
        method: "PATCH",
        body: payload
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        editError = err.error || "Could not update player";
        return;
      }

      player = await res.json();
      editMode = false;
      await invalidateAll();
    } catch (err) {
      editError = "Unexpected error while updating player";
    } finally {
      editLoading = false;
    }
  }
</script>

<div class="profile-grid">
  <div class="card profile-card">
    <div class="photo-block">
      {#if player.photoUrl}
        <img src={player.photoUrl} alt={player.name} />
      {:else}
        <div class="placeholder">{initials(player.name)}</div>
      {/if}
    </div>
    <div class="info">
      <div class="top">
        <div>
          <h2>{displayName(player)}</h2>
          <div class="position">{player.position}</div>
        </div>
        <span class={badgeClass()}>{badgeText()}</span>
      </div>

      {#if editMode}
        <div class="edit-form">
          <div class="form-grid">
            <label>
              <span>Player Name</span>
              <input bind:value={editForm.name} required />
            </label>
            <label>
              <span>Position</span>
              <select bind:value={editForm.position}>
                <option value="PG">PG</option>
                <option value="SG">SG</option>
                <option value="SF">SF</option>
                <option value="PF">PF</option>
                <option value="C">C</option>
              </select>
            </label>
            <label>
              <span>Age</span>
              <input type="number" min="1" bind:value={editForm.age} required />
            </label>
            <label>
              <span>Member Since</span>
              <input type="number" bind:value={editForm.joinedYear} required />
            </label>
            <label>
              <span>Height (cm)</span>
              <input type="number" min="170" max="240" bind:value={editForm.height} required />
            </label>
            <label>
              <span>Weight (kg)</span>
              <input type="number" step="0.1" bind:value={editForm.weight} />
            </label>
            <label>
              <span>Player Photo</span>
              <input type="file" accept="image/*" on:change={handleEditPhotoChange} />
            </label>
          </div>
          {#if editError}
            <div class="error">{editError}</div>
          {/if}
          <div class="edit-actions">
            <button class="save" on:click|preventDefault={saveEdit} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save"}
            </button>
            <button class="cancel" on:click={cancelEdit} type="button" disabled={editLoading}>
              Cancel
            </button>
          </div>
        </div>
      {:else}
        <div class="meta">
          <div class="row">
            <span class="label">AGE</span>
            <span class="value">{player.age}</span>
          </div>
          <div class="row">
            <span class="label">MEMBER SINCE</span>
            <span class="value">{player.joinedYear}</span>
          </div>
          <div class="row">
            <span class="label">HEIGHT</span>
            <span class="value">{player.height} cm</span>
          </div>
          <div class="row">
            <span class="label">WEIGHT</span>
            <span class="value">{player.weight} kg</span>
          </div>
        </div>
      {/if}

      <div class="profile-actions">
        <button class="ghost edit" on:click={beginEdit} disabled={editMode}>
          <svg class="edit-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11ZM20.71 7.04c.19-.19.29-.44.29-.71 0-.27-.1-.52-.29-.71l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.82Z"
              fill="currentColor"
            />
          </svg>
          Edit
        </button>
        <button class="ghost danger" on:click={deletePlayer} disabled={loadingAction}>
          Delete Player
        </button>
      </div>
    </div>
    <div class="jersey-number">#{playerNumber > 0 ? playerNumber : "00"}</div>
  </div>

  <div class="card injury-card">
    {#if injuryCount === 0}
      <button class="report-btn top-right" on:click={() => (injuryFormOpen = true)}>
        Report New Injury
      </button>
      <div class="injury-empty">
        <div class="green-icon">OK</div>
        <h3>No injury records</h3>
        <p>Player is in good health</p>
      </div>
    {:else}
      <div class="injury-header">
        <span class="badge red">{injuryCount} INJURIES</span>
        <button class="report-btn" on:click={() => (injuryFormOpen = true)}>
          Report New Injury
        </button>
      </div>
      <div class="injury-list">
        {#each player.injuries as injury}
          <div class="injury-row">
            <div class="injury-col date">{injury.date}</div>
            <div class="injury-col desc">{injury.description}</div>
            <div class="injury-col recovery">{injury.expectedRecovery}</div>
          </div>
        {/each}
      </div>
      <div class="injury-actions">
        <button
          class="recover-btn"
          class:disabled={!player.isInjured}
          on:click={markRecovered}
          disabled={!player.isInjured || loadingAction}
        >
          Mark as Recovered
        </button>
        <button class="report-btn" on:click={() => (injuryFormOpen = true)}>
          Report New Injury
        </button>
      </div>
    {/if}

    {#if actionError}
      <div class="error">{actionError}</div>
    {/if}
  </div>
</div>

{#if injuryFormOpen}
  <div class="modal-backdrop" on:click={() => (injuryFormOpen = false)}>
    <div class="injury-modal" on:click|stopPropagation>
      <div class="modal-head">
        <div>
          <div class="modal-title">INJURY REPORT</div>
          <div class="modal-sub">
            #{playerNumber > 0 ? playerNumber : "X"} {displayName(player)} – {player.position}
          </div>
        </div>
      </div>
      <form class="modal-body" on:submit={submitInjury}>
        <label>
          <span>Injury Date</span>
          <input required type="date" bind:value={injuryForm.date} />
        </label>
        <label class="wide">
          <span>Injury Description</span>
          <textarea
            required
            rows="3"
            placeholder="Describe the injury"
            bind:value={injuryForm.description}
          ></textarea>
        </label>
        <label class="wide">
          <span>Expected Recovery Time</span>
          <input
            required
            placeholder="e.g., 3 weeks"
            bind:value={injuryForm.expectedRecovery}
          />
        </label>
        <div class="modal-actions">
          <button class="submit" type="submit" disabled={loadingAction}>
            Submit Report
          </button>
          <button class="cancel" type="button" on:click={() => (injuryFormOpen = false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .profile-grid {
    display: grid;
    grid-template-columns: 1.1fr 1.2fr;
    gap: 20px;
  }

  .card {
    background: #17171b;
    border: 1px solid #242538;
    border-radius: 16px;
    padding: 20px;
    position: relative;
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35);
  }

  .profile-card {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 18px;
    overflow: hidden;
  }

  .photo-block {
    width: 140px;
    height: 140px;
    border-radius: 14px;
    background: linear-gradient(135deg, #212437, #1b1d2c);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid #2c2f45;
  }

  .photo-block img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ea2c1;
    font-weight: 800;
    font-size: 28px;
    background: #0e0e11;
  }

  .info h2 {
    margin: 0;
    color: #fff;
    font-size: 22px;
  }

  .position {
    color: #98a0c7;
    font-weight: 700;
    margin-top: 4px;
  }

  .badge {
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
  }

  .badge.active {
    background: rgba(0, 255, 98, 0.15);
    color: #00ff62;
    border: 1px solid rgba(0, 255, 98, 0.4);
  }

  .badge.injured {
    background: rgba(255, 58, 58, 0.12);
    color: #ff6b6b;
    border: 1px solid rgba(255, 58, 58, 0.5);
  }

  .badge.red {
    background: rgba(255, 58, 58, 0.2);
    color: #ff3a3a;
    border: 1px solid rgba(255, 58, 58, 0.6);
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }


  .meta {
    margin-top: 14px;
    display: grid;
    gap: 10px;
  }

  .row {
    display: flex;
    justify-content: space-between;
    background: #1d1e2b;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #25273a;
  }

  .label {
    color: #8a8fb0;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .label::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #3b5bff;
  }

  .value {
    color: #e7e7f0;
    font-weight: 700;
  }

  .jersey-number {
    position: absolute;
    bottom: 12px;
    right: 16px;
    font-size: 48px;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.06);
    letter-spacing: 2px;
  }

  .profile-actions {
    margin-top: 16px;
    display: flex;
    gap: 10px;
  }

  .ghost.edit {
    border-color: #3b5bff;
    color: #cfd2e9;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .edit-icon {
    width: 16px;
    height: 16px;
  }

  .edit-form {
    margin-top: 12px;
    background: #1c1d2a;
    border: 1px solid #2c2f45;
    border-radius: 12px;
    padding: 14px;
    display: grid;
    gap: 12px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 14px;
  }

  .form-grid label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: #9ba0b5;
    font-size: 12px;
  }

  .form-grid input,
  .form-grid select {
    background: #181824;
    border: 1px solid #2c2d3f;
    color: #e1e1e6;
    padding: 10px;
    border-radius: 10px;
    font-size: 14px;
  }

  .form-grid input:focus,
  .form-grid select:focus {
    outline: 1px solid #3b5bff;
  }

  .edit-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .edit-actions button {
    padding: 10px 14px;
    border-radius: 10px;
    border: none;
    font-weight: 800;
    cursor: pointer;
  }

  .edit-actions .save {
    background: #3b5bff;
    color: #fff;
  }

  .edit-actions .cancel {
    background: #2a2b3d;
    color: #d9daeb;
  }

  .ghost {
    background: transparent;
    border: 1px solid #3b5bff;
    color: #fff;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
  }

  .ghost.danger {
    border-color: #ff3a3a;
    color: #ff8080;
  }

  .injury-card {
    min-height: 200px;
    position: relative;
  }

  .injury-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .injury-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .injury-row {
    display: grid;
    grid-template-columns: 0.9fr 2fr 1fr;
    background: #1b1c29;
    border-left: 4px solid #ff3a3a;
    padding: 12px;
    border-radius: 12px;
    gap: 12px;
  }

  .injury-col {
    display: flex;
    align-items: center;
    color: #e1e1e6;
    font-weight: 700;
  }

  .injury-col.desc {
    color: #d4d5e4;
  }

  .injury-col.recovery {
    color: #aab0c8;
    justify-content: flex-end;
  }

  .injury-actions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
  }

  .recover-btn {
    flex: 1;
    background: #00b454;
    color: #fff;
    border: none;
    padding: 12px;
    border-radius: 12px;
    font-weight: 800;
    cursor: pointer;
  }

  .recover-btn.disabled,
  .recover-btn:disabled {
    background: #2d2e3b;
    color: #8f93ac;
    cursor: not-allowed;
    box-shadow: none;
  }

  .report-btn {
    background: #ff3a3a;
    color: #fff;
    border: none;
    padding: 12px 16px;
    border-radius: 12px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 12px 30px rgba(255, 58, 58, 0.25);
  }

  .report-btn.top-right {
    position: absolute;
    right: 20px;
    top: 20px;
    padding: 10px 14px;
  }

  .injury-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px;
    text-align: center;
  }

  .injury-empty h3,
  .injury-empty p {
    color: #ffffff;
  }

  .green-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(0, 255, 98, 0.14);
    color: #00ff62;
    display: grid;
    place-items: center;
    font-size: 24px;
  }

  .error {
    margin-top: 14px;
    color: #ff6b6b;
    font-weight: 700;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(5, 5, 10, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 30;
    backdrop-filter: blur(4px);
  }

  .injury-modal {
    width: 560px;
    background: #12121a;
    border-radius: 16px;
    border: 1px solid #26273a;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
  }

  .modal-head {
    padding: 18px 20px;
    border-bottom: 1px solid #1f2030;
  }

  .modal-title {
    color: #fff;
    font-weight: 800;
    letter-spacing: 0.4px;
  }

  .modal-sub {
    color: #9ba0b5;
    margin-top: 6px;
    font-size: 14px;
  }

  .modal-body {
    display: grid;
    gap: 12px;
    padding: 16px 20px 20px;
  }

  .modal-body label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: #9ba0b5;
    font-size: 13px;
  }

  .modal-body input,
  .modal-body textarea {
    background: #181824;
    border: 1px solid #2c2d3f;
    color: #e1e1e6;
    padding: 10px;
    border-radius: 10px;
    font-size: 14px;
  }

  .modal-body textarea {
    resize: vertical;
  }

  .modal-body input:focus,
  .modal-body textarea:focus {
    outline: 1px solid #ff3a3a;
  }

  .modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 8px;
  }

  .modal-actions button {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    border: none;
    font-weight: 800;
    cursor: pointer;
  }

  .modal-actions .submit {
    background: #ff3a3a;
    color: #fff;
  }

  .modal-actions .cancel {
    background: #fff;
    color: #0e0e11;
  }

  .wide {
    width: 100%;
  }

  @media (max-width: 1000px) {
    .profile-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .profile-card {
      grid-template-columns: 1fr;
      text-align: center;
    }
    .top {
      flex-direction: column;
    }
    .row {
      text-align: left;
    }
    .jersey-number {
      right: 10px;
    }
    .injury-row {
      grid-template-columns: 1fr;
    }
    .injury-col.recovery {
      justify-content: flex-start;
    }
    .injury-actions {
      flex-direction: column;
    }
    .modal-actions {
      flex-direction: column;
    }
  }
</style>
