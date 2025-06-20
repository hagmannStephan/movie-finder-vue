<script setup lang="ts">
import { ref } from 'vue';
import './assets/styles.scss'
import './css/main.css';

const loginRef = ref<Boolean>(false);
const registerRef = ref<Boolean>(false);

const login = () => {
  loginRef.value = true;
};

const register = () => {
  registerRef.value = true;
};
</script>

<template>
  <div class="main">
    <div class="mainLogo">
      <img src="./assets/MovieFinderLogo.svg">
    </div>
    <div class="screenPlaceholder">
      <div v-if="loginRef === true" class="loginScreen">
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
      </div>
    </div>
    <div class="mainButtons">
      <button @click="login" class="mainButtonLogin">Login</button>
      <button @click="register" class="mainButtonRegister">Register</button>
    </div>
  </div>
</template>

<style scoped></style>
