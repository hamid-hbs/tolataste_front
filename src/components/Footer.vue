<template>
  <footer class="border-t border-tola-cream-dark bg-white mt-auto">
    <div class="mx-auto max-w-6xl px-4 py-6 text-center">
      <p class="font-script text-xl text-tola-orange">The sweetest meal</p>
      <p class="mt-1 text-xs text-tola-gray">Tola Taste — Cuisine généreuse, préparée à la commande.</p>
      <div class="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-semibold text-tola-gray">
        <router-link to="/confidentialite" class="transition hover:text-tola-orange">Politique de confidentialité</router-link>
        <span class="text-tola-gray/30">•</span>
        <router-link to="/mentions-legales" class="transition hover:text-tola-orange">Mentions légales</router-link>
      </div>
      <p class="mt-3 text-[10px] text-tola-gray/50">&copy; {{ new Date().getFullYear() }} Tola Taste. Tous droits réservés.</p>
    </div>
  </footer>
</template>
