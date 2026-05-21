<template>
  <section style="max-width: 440px; margin: 10vh auto; padding: 1rem">
    <header style="text-align: center; margin-bottom: 1.5rem">
      <AppLogo :size="80"/>
      <h2 class="section-title">Admin Login</h2>
    </header>
    <section class="panel" style="padding: 1rem">
      <form style="display: grid; gap: 0.6rem; margin-top: 1rem" @submit.prevent="onSubmit">
        <input v-model="email" class="input" type="email" placeholder="Email" required />
        <input v-model="password" class="input" type="password" placeholder="Password" required />
        <button class="btn btn-primary" :disabled="auth.loading.value">
          {{ auth.loading.value ? 'Signing in...' : 'Sign in' }}
        </button>
        <small v-if="error" style="color: var(--danger)">{{ error }}</small>
      </form>
    </section>
  </section>
</template>

<script setup lang="ts">
import { z } from 'zod'

import { useAuth } from '~/composables/useAuth'
import AppLogo from '@/components/icons/AppLogo.vue'

const auth = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const onSubmit = async () => {
  error.value = ''

  const parsed = schema.safeParse(
    { 
      email: email.value, 
      password: password.value 
    }
  )
  if (!parsed.success) {
    error.value = 'Please enter valid credentials.'
    return
  }

  try {
    await auth.loginWithFirebase(email.value, password.value)
    await navigateTo('/admin/home')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Authentication failed.'
  }
}
</script>