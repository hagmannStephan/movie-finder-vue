<script setup lang="ts">
import './assets/styles.scss'
</script>

<template>
  <div class="main">
    <div class="mainLogo">
      <img src="./assets/MovieFinderLogo.svg">
    </div>
    <div class="mainButtons">
      <button class="mainButtonLogin">Login</button>
      <button class="mainButtonRegister">Register</button>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.main {
  width: 16rem;
}

.mainLogo {
  margin-top: 1.5rem;
}

.mainLogo img {
  box-shadow: 4px 4px 16px var(--vermilion-light);
}

.mainButtons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1em;
  margin-top: 14rem;
}

.mainButtons button {
  height: 3rem;
  font-size: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1; /* Important for vertical centering */
  padding: 0;     /* Remove any default padding */
}


.mainButtonLogin {
  background-color: var(--raspberry);
  box-shadow: 4px 4px 4px var(--raspberry-light);
}

.mainButtonRegister {
  background-color: var(--vermilion);
  box-shadow: 4px 4px 4px var(--vermilion-light);
}
</style>
