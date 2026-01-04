<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let username = "";
  let password = "";
  const validUser = "testuser";
  const validPass = "12345678";

  onMount(() => {
    const authed = sessionStorage.getItem("authUser");
    if (authed) {
      goto("/");
    }
  });

  function handleSubmit(event) {
    event.preventDefault();
    if (username === validUser && password === validPass) {
      sessionStorage.setItem("authUser", validUser);
      goto("/");
    } else {
      alert("Username or password is incorrect");
    }
  }
</script>

<div class="login-page">
  <div class="login-card">
    <h1>Player Management Tool</h1>
    <form on:submit={handleSubmit}>
      <label>
        <div>Username</div>
        <input name="username" bind:value={username} autocomplete="username" />
      </label>
      <label>
        <div>Password</div>
        <input
          name="password"
          type="password"
          bind:value={password}
          autocomplete="current-password"
        />
      </label>
      <button type="submit">Login</button>
    </form>
  </div>
</div>

<style>
  :global(html, body) {
    margin: 0;
    background: #000;
    color: #fff;
  }

  .login-page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #000;
    color: #fff;
  }

  .login-card {
    width: 320px;
    padding: 24px;
    background: #111;
    color: #fff;
    border: 1px solid #333;
    border-radius: 12px;
    box-sizing: border-box;
  }

  .login-card h1 {
    margin: 0 0 16px;
    font-size: 24px;
    text-align: center;
  }

  form {
    display: grid;
    gap: 12px;
  }

  label {
    display: grid;
    gap: 6px;
  }

  input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    background: #000;
    color: #fff;
    border: 1px solid #555;
  }

  button {
    width: 100%;
    padding: 10px;
    background: #3b5bff;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(59, 91, 255, 0.3);
  }
</style>
