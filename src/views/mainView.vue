<script setup lang="ts">
import { ref } from 'vue';
import '../assets/styles.scss';
import '../css/main.css';

const loginRef = ref<Boolean>(false);
const registerRef = ref<Boolean>(false);

const email = ref('');
const password = ref('');
const username = ref('');
const confirmPassword = ref('');

const login = () => {
  if (loginRef.value) {
    submitLogin();
    loginRef.value = false;
    return;
  };
  loginRef.value = true;
};

const register = () => {
  if (registerRef.value) {
    submitRegister();
    registerRef.value = false;
    return;
  };
  registerRef.value = true;
};

const back = () => {
  loginRef.value = false;
  registerRef.value = false;
};

const submitLogin = async () => {
  const res = await fetch('https://api.moviefinder.stephanhagmann.ch/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: JSON.stringify({ email: email.value, password: password.value })
  });
  const data = await res.json();
  console.log(data); // handle token
};

const submitRegister = async () => {
  if (password.value !== confirmPassword.value) return;

  const res = await fetch('https://api.moviefinder.stephanhagmann.ch/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: JSON.stringify({ username: username.value, email: email.value, password: password.value })
  });
  const data = await res.json();
  console.log(data); // handle response
};
</script>

<template>
  <div class="main">
    <div class="mainLogo">
      <img src="../assets/MovieFinderLogo.svg">
    </div>
    <div class="screenPlaceholder">
      <div v-if="loginRef === true" class="loginScreen">
        <input class="input" type="email" placeholder="Email" />
        <input class="input" type="password" placeholder="Password" />
      </div>
      <div v-if="registerRef === true" class="registerScreen">
        <input class="input" type="text" placeholder="Username" />
        <input class="input" type="email" placeholder="Email" />
        <input class="input" type="password" placeholder="Password" />
        <input class="input" type="password" placeholder="Confirm Password" />
      </div>
    </div>
    <div class="mainButtons">
      <div class="buttonWrapper">
        <button v-if="!registerRef" @click="login" class="mainButtonLogin">Login</button>
      </div>
      <div class="buttonWrapper">
        <button v-if="!loginRef" @click="register" class="mainButtonRegister">Register</button>
      </div>
    </div>
    <div v-if="loginRef || registerRef" class="backDiv">
      <a @click="back"><- Back</a>
    </div>
  </div>
</template>

<style scoped></style>
