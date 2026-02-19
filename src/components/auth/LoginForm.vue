<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseInput } from '@/components/common'

const emit = defineEmits<{
  submit: [email: string, password: string]
  googleLogin: []
}>()

const email = ref('')
const password = ref('')

function handleSubmit() {
  emit('submit', email.value, password.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <BaseInput
      v-model="email"
      type="email"
      label="Correo electrónico"
      placeholder="tu@email.com"
      required
    />

    <BaseInput
      v-model="password"
      type="password"
      label="Contraseña"
      placeholder="••••••••"
      required
    />

    <div class="space-y-3">
      <BaseButton type="submit" class="w-full">
        Iniciar sesión
      </BaseButton>

      <BaseButton
        type="button"
        variant="secondary"
        class="w-full"
        @click="emit('googleLogin')"
      >
        Continuar con Google
      </BaseButton>
    </div>
  </form>
</template>
