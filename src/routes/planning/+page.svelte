<script>
  import { goto } from "$app/navigation";

  const now = new Date();
  let currentMonth = now.getMonth();
  let currentYear = now.getFullYear();

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
        <div class={`cell ${item.current ? "" : "disabled"}`}>
          {item.day}
        </div>
      {/each}
    </div>
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
    justify-content: flex-start;
    padding: 8px;
    box-sizing: border-box;
    font-weight: 700;
  }

  .cell.disabled {
    color: #666a7a;
    background: #13131b;
    border-color: #1a1b26;
  }
</style>
