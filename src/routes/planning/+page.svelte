<script>
  import { goto } from "$app/navigation";
</script>

<div class="page">
  <div class="tabs">
    <button class="tab" on:click={() => goto("/")}>Team Roster</button>
    <button class="tab active">Trainings & Games Planning</button>
  </div>

  <div class="empty-main"></div>
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

  .empty-main {
    background: #12121a;
    border-radius: 14px;
    border: 1px solid #1f2030;
    min-height: 400px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
  }
</style>
