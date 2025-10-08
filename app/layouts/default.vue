<template>
  <Navbar />
  <div class="h-full px-8 py-4 md:px-14 lg:py-6">
    <slot />
  </div>
</template>

<script setup lang="ts">
import Navbar from "~/components/Navbar.vue";
</script>
