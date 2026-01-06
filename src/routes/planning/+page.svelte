<script>
  import { goto } from "$app/navigation";

  export let data;
  const allPlayers = data?.players || [];
  const initialEvents = data?.events || [];
  const now = new Date();
  let currentMonth = now.getMonth();
  let currentYear = now.getFullYear();
  let selectedDate = null;
  let selectedType = "";
  let showModal = false;
  let selectedEventId = null;
  let selectedPlayers = [];
  let selectedStartTime = "";
  let selectedEndTime = "";
  let saving = false;
  let saveError = "";
  let events = initialEvents;
  let isSelectAll = false;

  $: monthDate = new Date(currentYear, currentMonth, 1);
  $: monthName = monthDate.toLocaleString("default", { month: "long" });
  $: firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)
  $: daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  $: days = (() => {
    const list = [];
    const leadingSlots = (firstDay + 6) % 7; // convert so Monday = 0
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = leadingSlots; i > 0; i--) {
      list.push({ day: prevMonthDays - i + 1, current: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      list.push({ day: d, current: true });
    }
    const trailingSlots = (7 - (list.length % 7)) % 7;
    for (let t = 1; t <= trailingSlots; t++) {
      list.push({ day: t, current: false });
    }
    return list;
  })();

  $: if (
    selectedDate &&
    (selectedDate.getMonth() !== currentMonth || selectedDate.getFullYear() !== currentYear)
  ) {
    selectedDate = null;
    selectedType = "";
    showModal = false;
  }

  function prevMonth() {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear -= 1;
    } else {
      currentMonth -= 1;
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear += 1;
    } else {
      currentMonth += 1;
    }
  }

  function selectDay(day) {
    selectedDate = new Date(currentYear, currentMonth, day);
    selectedType = "";
    selectedPlayers = [];
    selectedStartTime = "";
    selectedEndTime = "";
    showModal = true;
    selectedEventId = null;
    isSelectAll = false;
  }

  function openEvent(ev) {
    selectedEventId = ev._id;
    selectedDate = new Date(ev.date);
    selectedType = ev.type === "training" ? "Training" : "Game";
    selectedPlayers = ev.participants || [];
    selectedStartTime = ev.startTime || "";
    selectedEndTime = ev.endTime || "";
    isSelectAll = selectedPlayers.length === healthyPlayers.length && healthyPlayers.length > 0;
    showModal = true;
  }

  function isSelected(item) {
    return (
      selectedDate &&
      item.current &&
      selectedDate.getDate() === item.day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  }

  function chooseType(type) {
    if (!selectedDate) return;
    selectedType = type;
  }

  const timeSlots = (() => {
    const slots = [];
    let hour = 5;
    let minute = 0;
    while (hour < 22 || (hour === 22 && minute === 0)) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      slots.push(`${h}:${m}`);
      minute += 30;
      if (minute >= 60) {
        minute = 0;
        hour += 1;
      }
    }
    return slots;
  })();

  function toMinutes(t) {
    if (typeof t !== "string") return null;
    const [h, m] = t.split(":").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    return h * 60 + m;
  }

  $: dayEvents = selectedDate ? eventsForDay(selectedDate.getDate()) : [];

  function overlaps(start, end, ev) {
    if (!ev.startTime || !ev.endTime) return false;
    const evStart = toMinutes(ev.startTime);
    const evEnd = toMinutes(ev.endTime);
    if (evStart === null || evEnd === null) return false;
    return start < evEnd && end > evStart;
  }

  function startDisabled(slot) {
    const start = toMinutes(slot);
    if (start === null) return false;
    const end = start + 30;
    return dayEvents.some((ev) => ev._id !== selectedEventId && overlaps(start, end, ev));
  }

  function endOptions() {
    return timeSlots;
  }

  function endDisabled(opt) {
    if (!selectedStartTime) return true;
    const start = toMinutes(selectedStartTime);
    const end = toMinutes(opt);
    if (start === null || end === null) return true;
    if (end <= start) return true;
    if (startDisabled(opt)) return true;
    return dayEvents.some((ev) => ev._id !== selectedEventId && overlaps(start, end, ev));
  }

  function closeModal() {
    showModal = false;
    selectedDate = null;
    selectedType = "";
    selectedPlayers = [];
    selectedStartTime = "";
    selectedEndTime = "";
    saving = false;
    saveError = "";
    selectedEventId = null;
    isSelectAll = false;
  }

  $: healthyPlayers = allPlayers.filter((p) => !p.isInjured);
  $: selectedParticipantPlayers = (selectedPlayers || [])
    .map((id) => allPlayers.find((p) => p._id === id))
    .filter(Boolean);
  $: injuredSelected = selectedParticipantPlayers.filter((p) => p.isInjured);

  function togglePlayer(id) {
    if (selectedPlayers.includes(id)) {
      selectedPlayers = selectedPlayers.filter((pid) => pid !== id);
    } else {
      selectedPlayers = [...selectedPlayers, id];
    }
    isSelectAll = selectedPlayers.length === healthyPlayers.length && healthyPlayers.length > 0;
  }

  async function saveEvent() {
    if (!selectedDate || !selectedType) {
      saveError = "Select date and type";
      return;
    }
    if (!selectedStartTime || !selectedEndTime) {
      saveError = "Select start and end time";
      return;
    }
    if (toMinutes(selectedEndTime) <= toMinutes(selectedStartTime)) {
      saveError = "End time must be after start time";
      return;
    }
    saveError = "";
    saving = true;
    try {
      const payload = {
        date: selectedDate.toISOString(),
        type: selectedType.toLowerCase(),
        participants: selectedPlayers,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
      };
      const url = selectedEventId ? `/api/events/${selectedEventId}` : "/api/events";
      const method = selectedEventId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        saveError = err.error || "Could not save event";
        return;
      }
      await res.json().catch(() => ({}));
      window.location.reload();
    } catch (err) {
      saveError = "Unexpected error while saving";
    } finally {
      saving = false;
    }
  }

  function eventsForDay(day) {
    const dateKey = new Date(currentYear, currentMonth, day).toISOString().slice(0, 10);
    return events
      .filter((ev) => (ev.date || "").startsWith(dateKey))
      .sort((a, b) => {
        const aStart = toMinutes(a.startTime || "00:00") ?? 0;
        const bStart = toMinutes(b.startTime || "00:00") ?? 0;
        return aStart - bStart;
      });
  }

  async function loadEvents() {
    try {
      const res = await fetch("/api/events");
      if (!res.ok) return;
      const list = await res.json();
      events = Array.isArray(list) ? list : [];
    } catch (err) {
      // ignore refresh errors
    }
  }

  function toggleSelectAll(event) {
    isSelectAll = event.target.checked;
    if (isSelectAll) {
      selectedPlayers = healthyPlayers.map((p) => p._id);
    } else {
      selectedPlayers = [];
    }
  }

  async function deleteEvent() {
    if (!selectedEventId) return;
    saving = true;
    saveError = "";
    try {
      const res = await fetch(`/api/events/${selectedEventId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        saveError = err.error || "Could not delete event";
        return;
      }
      window.location.reload();
    } catch (err) {
      saveError = "Unexpected error while deleting";
    } finally {
      saving = false;
    }
  }
</script>

<div class="page">
  <div class="tabs">
    <button class="tab" on:click={() => goto("/")}>Team Roster</button>
    <button class="tab active">Trainings & Games Planning</button>
  </div>

  <div class="calendar-card">
    <div class="cal-header">
      <button class="nav-btn" on:click={prevMonth} aria-label="Previous Month">‹</button>
      <div class="month">{monthName} {currentYear}</div>
      <button class="nav-btn" on:click={nextMonth} aria-label="Next Month">›</button>
    </div>
    <div class="weekdays">
      <div>Mon</div>
      <div>Tue</div>
      <div>Wed</div>
      <div>Thu</div>
      <div>Fri</div>
      <div>Sat</div>
      <div>Sun</div>
    </div>
    <div class="grid">
      {#each days as item}
        <div
          class={`cell ${item.current ? "active" : "disabled"} ${isSelected(item) ? "selected" : ""}`}
          on:click={() => item.current && selectDay(item.day)}
        >
          <div class="day-number">{item.day}</div>
          {#if item.current}
            {#if eventsForDay(item.day).length > 0}
              <div class="event-badges">
                {#each eventsForDay(item.day) as ev}
                  <button class={`badge ${ev.type}`} on:click|stopPropagation={() => openEvent(ev)}>
                    {ev.type === "training" ? "Training" : "Game"}{ev.startTime && ev.endTime ? ` · ${ev.startTime}–${ev.endTime}` : ""}
                  </button>
                {/each}
              </div>
            {/if}
          {/if}
        </div>
      {/each}
    </div>

  </div>
</div>

{#if showModal && selectedDate}
  <div class="modal-backdrop" on:click={closeModal}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <div>Plan Event</div>
        <button class="close-btn" on:click={closeModal}>×</button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="label">Date</div>
          <div class="value">{selectedDate.toDateString()}</div>
        </div>
        <div class="row">
          <div class="label">Event Type</div>
          <div class="value buttons">
            <button class={`type-btn ${selectedType === "Training" ? "active" : ""}`} on:click={() => chooseType("Training")}>Training</button>
            <button class={`type-btn ${selectedType === "Game" ? "active" : ""}`} on:click={() => chooseType("Game")}>Game</button>
          </div>
        </div>
        <div class="row">
          <div class="label">Start Time</div>
          <div class="value">
            <select bind:value={selectedStartTime}>
              <option value="">Select start</option>
              {#each timeSlots as slot}
                <option value={slot} disabled={startDisabled(slot)}>{slot}</option>
              {/each}
            </select>
          </div>
        </div>
        <div class="row">
          <div class="label">End Time</div>
          <div class="value">
            <select bind:value={selectedEndTime} disabled={!selectedStartTime}>
  <option value="">Select end</option>
  {#each timeSlots as slot}
    <option
      value={slot}
      disabled={
        !selectedStartTime ||
        toMinutes(slot) <= toMinutes(selectedStartTime) ||
        startDisabled(slot)
      }
    >
      {slot}
    </option>
  {/each}
</select>
          </div>
        </div>
        <div class="row">
          <div class="label">Participants (Healthy Only)</div>
          <div class="participants">
            <label class="select-all">
              <input type="checkbox" checked={isSelectAll} on:change={toggleSelectAll} />
              <span>Select all healthy players</span>
            </label>
            {#if healthyPlayers.length === 0}
              <div class="no-players">No healthy players available</div>
            {:else}
              {#each healthyPlayers as player}
                <button
                  class={`participant ${selectedPlayers.includes(player._id) ? "active" : ""}`}
                  on:click={() => togglePlayer(player._id)}
                >
                  {player.name}
                </button>
              {/each}
            {/if}
          </div>
        </div>
        {#if injuredSelected.length > 0}
          <div class="row">
            <div class="label">Unavailable (Injured)</div>
            <div class="injured-list">
              {#each injuredSelected as player}
                <div class="injured-name">{player.name}</div>
              {/each}
            </div>
          </div>
        {/if}
        {#if saveError}
          <div class="error-text">{saveError}</div>
        {/if}
        <div class="modal-actions">
          {#if selectedEventId}
            <button class="delete" on:click={deleteEvent} disabled={saving}>Delete</button>
          {/if}
          <button class="confirm" on:click={saveEvent} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button class="cancel" on:click={closeModal}>Close</button>
        </div>
      </div>
    </div>
  </div>
{/if}

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

  .calendar-card {
    background: #12121a;
    border-radius: 14px;
    border: 1px solid #1f2030;
    min-height: 400px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .cal-header .month {
    color: #fff;
    font-weight: 800;
    font-size: 20px;
    text-align: center;
  }

  .cal-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
  }

  .nav-btn {
    background: #181824;
    color: #fff;
    border: 1px solid #1f2030;
    border-radius: 8px;
    padding: 8px 10px;
    cursor: pointer;
    font-weight: 800;
  }

  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    color: #a7a8b9;
    font-weight: 700;
    font-size: 13px;
    text-align: center;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
  }

  .cell {
    min-height: 64px;
    background: #181824;
    border: 1px solid #1f2030;
    border-radius: 10px;
    color: #fff;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 8px;
    box-sizing: border-box;
    font-weight: 700;
    flex-direction: column;
  }

  .cell.active {
    cursor: pointer;
  }

  .cell.selected {
    border-color: #3b5bff;
    box-shadow: 0 0 0 1px #3b5bff;
  }

  .cell.disabled {
    color: #666a7a;
    background: #13131b;
    border-color: #1a1b26;
  }

  .day-number {
    font-weight: 800;
  }

  .event-badges {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: auto;
    width: 100%;
  }

  .event-badges .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 6px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 800;
    width: fit-content;
  }

  .event-badges .badge.training {
    background: #4c234f;
    color: #ffc4f0;
  }

  .event-badges .badge.game {
    background: #1f3a2a;
    color: #9af0b5;
  }

  .selection {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 6px;
    color: #fff;
  }

  .selection-label {
    font-weight: 700;
  }

  .type-buttons {
    display: flex;
    gap: 10px;
  }

  .type-btn {
    background: #181824;
    color: #fff;
    border: 1px solid #1f2030;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    font-weight: 700;
  }

  .type-btn.active {
    border-color: #3b5bff;
    color: #3b5bff;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }

  .modal {
    background: #111119;
    border: 1px solid #1f2030;
    border-radius: 12px;
    width: 380px;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.5);
    color: #fff;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #1f2030;
    font-weight: 800;
  }

  .close-btn {
    background: transparent;
    color: #fff;
    border: none;
    font-size: 18px;
    cursor: pointer;
  }

  .modal-body {
    padding: 14px 16px 16px;
    display: grid;
    gap: 12px;
  }

  .row {
    display: grid;
    gap: 6px;
  }

  .label {
    color: #9ea0b3;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .value {
    font-weight: 700;
  }

  select {
    width: 100%;
    background: #181824;
    color: #fff;
    border: 1px solid #1f2030;
    border-radius: 8px;
    padding: 8px;
  }

  .value.buttons {
    display: flex;
    gap: 10px;
  }

  .participants {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .select-all {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .participant {
    background: #181824;
    color: #fff;
    border: 1px solid #1f2030;
    border-radius: 8px;
    padding: 6px 10px;
    cursor: pointer;
    font-weight: 700;
  }

  .participant.active {
    border-color: #3b5bff;
    color: #3b5bff;
  }

  .no-players {
    color: #8a8ea2;
    font-weight: 600;
  }

  .injured-list {
    display: grid;
    gap: 6px;
  }

  .injured-name {
    color: #ff8a8a;
    font-weight: 700;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .modal-actions .cancel,
  .modal-actions .confirm,
  .modal-actions .delete {
    background: #181824;
    color: #fff;
    border: 1px solid #1f2030;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    font-weight: 700;
  }

  .modal-actions .confirm {
    border-color: #3b5bff;
    color: #3b5bff;
  }

  .modal-actions .delete {
    border-color: #ff3a3a;
    color: #ff8080;
  }

  .error-text {
    color: #ff8080;
    font-weight: 700;
  }
</style>
