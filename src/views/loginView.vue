<script setup lang="ts">
import { ref } from 'vue';
import '../assets/styles.scss';
import '../css/main.css';
import router from '../router';

const loginRef = ref<Boolean>(false);
const registerRef = ref<Boolean>(false);

const email = ref('');
const password = ref('');
const name = ref('');
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
  console.log(email.value, password.value);
  const formData = new URLSearchParams();
  formData.append('email', email.value);
  formData.append('password', password.value);

  const res = await fetch('https://api.moviefinder.stephanhagmann.ch/auth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData
  });

  const data = await res.json();
  console.log(data);
  if (data.access_token) {
    localStorage.setItem('authToken', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    router.push('/swipe');
  } else {
    console.error('Login failed:', data);
  }
};

const submitRegister = async () => {
  if (password.value !== confirmPassword.value) return;

  const res = await fetch('https://api.moviefinder.stephanhagmann.ch/users/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      name: name.value, 
      email: email.value, 
      password: password.value 
    })
  });
  console.log(res);
  const data = await res.json();
  console.log(data); 
};
</script>

<template>
  <div class="login-view">
    <div class="login-container">
      <div class="mainLogo">
        <img src="../assets/MovieFinderLogo.svg">
      </div>
      <div class="mainTitle">
        <h1>MovieFinder</h1>
      </div>
      <div class="screenPlaceholder">
        <div v-if="loginRef === true" class="loginScreen">
          <input class="input" v-model="email" type="email" placeholder="Email" />
          <input class="input" v-model="password" type="password" placeholder="Password" />
        </div>
        <div v-if="registerRef === true" class="registerScreen">
          <input class="input" v-model="name" type="text" placeholder="Username" />
          <input class="input" v-model="email" type="email" placeholder="Email" />
          <input class="input" v-model="password" type="password" placeholder="Password" />
          <input class="input" v-model="confirmPassword" type="password" placeholder="Confirm Password" />
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
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff 0%, #2d2d2d 100%);
}

.login-container {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 350px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.mainLogo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
}

.mainTitle {
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
}

.mainLogo img {
  width: 12rem;
  height: auto;
  display: block;
  margin: 0 auto;
}
</style>
