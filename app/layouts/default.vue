<template>
  <Navbar />
  <div class="px-8 md:px-14 h-full pb-4 md:pb-12">
    <slot />
  </div>
</template>

<script setup lang="ts">
import Navbar from "~/components/Navbar.vue";
</script>
