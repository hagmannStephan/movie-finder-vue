<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()

const submitLogin = async () => {
  // hier deinen API-Call
  const res = await fetch('https://api.moviefinder.stephanhagmann.ch/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.value, password: password.value })
  })
  const data = await res.json()
  console.log(data) // Token speichern etc.
  router.push('/')   // nach Login z.B. Home
}
</script>

<template>
  <div class="auth-screen">
    <h1>Login</h1>
    <input v-model="email" type="email" placeholder="Email" class="input" />
    <input v-model="password" type="password" placeholder="Passwort" class="input" />
    <button @click="submitLogin" class="btn">Einloggen</button>
    <p>
      Noch keinen Account?
      <router-link to="/register">Registrieren</router-link>
    </p>
  </div>
</template>
