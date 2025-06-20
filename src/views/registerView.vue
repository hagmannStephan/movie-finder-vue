<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const router = useRouter()

const submitRegister = async () => {
  if (password.value !== confirmPassword.value) {
    alert('Passwörter stimmen nicht überein')
    return
  }
  const res = await fetch('https://api.moviefinder.stephanhagmann.ch/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username.value,
      email: email.value,
      password: password.value
    })
  })
  const data = await res.json()
  console.log(data)
  router.push('/login')
}
</script>

<template>
  <div class="auth-screen">
    <h1>Registrieren</h1>
    <input v-model="username" type="text" placeholder="Username" class="input" />
    <input v-model="email" type="email" placeholder="Email" class="input" />
    <input v-model="password" type="password" placeholder="Passwort" class="input" />
    <input v-model="confirmPassword" type="password" placeholder="Passwort wiederholen" class="input" />
    <button @click="submitRegister" class="btn">Registrieren</button>
    <p>
      Schon einen Account?
      <router-link to="/login">Einloggen</router-link>
    </p>
  </div>
</template>
