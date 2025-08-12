<template>
  <div class="flex min-h-screen w-full bg-background/50">
    <!-- Placeholder for Sidebar -->
    <div class="w-64 border-r border-primary/20 bg-background/80 p-4">
      <h2 class="text-lg font-headline text-foreground">Sidebar</h2>
      <!-- Navigation links can be added here -->
    </div>

    <div class="flex flex-col w-full">
      <header class="flex h-14 items-center gap-4 border-b border-primary/20 bg-background/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
        <h1 class="text-xl font-headline md:text-2xl">Page Title</h1>
      </header>
      <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-transparent overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
// Script section for the layout
</script>

<style>
/* Scoped styles for the layout can be added here */
</style>
