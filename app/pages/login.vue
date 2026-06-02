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
        <small v-if="info" style="color: var(--success, green)">{{ info }}</small>

        <button
          v-if="needsVerification"
          type="button"
          class="btn"
          :disabled="busy"
          @click="onResendVerification"
        >
          Resend verification email
        </button>

        <button
          type="button"
          class="btn btn-link"
          style="background: none; border: none; padding: 0; text-align: center; cursor: pointer"
          :disabled="busy"
          @click="onForgotPassword"
        >
          Forgot password?
        </button>
      </form>
    </section>
  </section>
</template>

<script setup lang="ts">
import { z } from 'zod'

import { EmailNotVerifiedError, useAuth } from '~/composables/useAuth'
import AppLogo from '@/components/icons/AppLogo.vue'

const auth = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const info = ref('')
const needsVerification = ref(false)
const busy = ref(false)

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const backendDetail = (err: unknown): string | undefined => {
  const e = err as { data?: { detail?: string }; response?: { _data?: { detail?: string } } }
  return e?.data?.detail ?? e?.response?._data?.detail
}

const mapError = (err: unknown): string => {
  // Backend response detail (spec §6) takes priority for protected-call failures.
  const detail = backendDetail(err)
  if (detail === 'User authenticated with Firebase but not provisioned in backend') {
    return 'This account is not provisioned for admin access. Contact support.'
  }
  if (detail === 'Email not verified') {
    return 'Please verify your email before signing in.'
  }
  if (detail === 'Insufficient permissions for this resource') {
    return 'This account does not have admin access.'
  }

  // Firebase client error codes.
  const code = (err as { code?: string })?.code
  if (code === 'auth/invalid-credential'
    || code === 'auth/wrong-password'
    || code === 'auth/user-not-found') {
    return 'Invalid email or password.'
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Please try again later.'
  }

  return err instanceof Error ? err.message : 'Authentication failed.'
}

const onSubmit = async () => {
  error.value = ''
  info.value = ''
  needsVerification.value = false

  const parsed = schema.safeParse({ email: email.value, password: password.value })
  if (!parsed.success) {
    error.value = 'Please enter valid credentials.'
    return
  }

  try {
    await auth.loginWithFirebase(email.value, password.value)
    await navigateTo('/admin/home')
  } catch (err) {
    if (err instanceof EmailNotVerifiedError) {
      needsVerification.value = true
      error.value = 'Your email is not verified. Check your inbox or resend the verification email.'
      return
    }
    error.value = mapError(err)
  }
}

const onResendVerification = async () => {
  error.value = ''
  info.value = ''
  busy.value = true
  try {
    await auth.resendVerificationEmail()
    info.value = 'Verification email sent. Click the link, then sign in again.'
  } catch (err) {
    error.value = mapError(err)
  } finally {
    busy.value = false
  }
}

const onForgotPassword = async () => {
  error.value = ''
  info.value = ''

  const parsedEmail = z.string().email().safeParse(email.value)
  if (!parsedEmail.success) {
    error.value = 'Enter your email above first, then click “Forgot password?”.'
    return
  }

  busy.value = true
  try {
    await auth.requestPasswordReset(email.value)
    info.value = 'Password reset email sent. Check your inbox.'
  } catch (err) {
    error.value = mapError(err)
  } finally {
    busy.value = false
  }
}
</script>
