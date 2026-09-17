<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft, Scale } from '@lucide/vue'

const router = useRouter()
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-6 md:py-10">
    <button
      @click="router.push('/')"
      class="mb-4 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-600 ring-1 ring-gray-200 transition hover:bg-gray-100"
    >
      <ArrowLeft :size="14" /> Retour à l'accueil
    </button>

    <div class="rounded-3xl bg-white p-6 ring-1 ring-gray-100 md:p-10">
      <div class="mb-2 flex items-center gap-2">
        <Scale :size="22" class="text-orange-500" />
        <h1 class="text-2xl font-extrabold text-gray-900 md:text-3xl">Mentions légales</h1>
      </div>
      <p class="text-xs text-gray-400">Dernière mise à jour : {{ new Date().toLocaleDateString('fr-FR') }}</p>

      <div class="mt-6 space-y-6 text-sm leading-relaxed text-gray-600">
        <section>
          <h2 class="mb-1.5 text-base font-bold text-gray-900">1. Éditeur du site</h2>
          <ul class="space-y-1">
            <li><span class="font-semibold">Nom :</span> Tola Taste</li>
            <li><span class="font-semibold">Adresse :</span> Cotonou, Bénin</li>
            <li><span class="font-semibold">Contact :</span> <a href="mailto:tolataste@gmail.com">tolataste@gmail.com</a> / <a href="tel:+2290197333204">tel: +229 01 97 33 32 04</a></li>
            </ul>
        </section>

        <section>
          <h2 class="mb-1.5 text-base font-bold text-gray-900">2. Hébergement</h2>
          <p>Hébergeur : Hostinger.</p>
        </section>

        <section>
          <h2 class="mb-1.5 text-base font-bold text-gray-900">3. Activité</h2>
          <p>
            Tola Taste propose la consultation du menu et la prise de commande en ligne
            (sur place ou à emporter). Le paiement s'effectue sur place, en espèces ou
            via Mobile Money. Les prix sont affichés en FCFA.
          </p>
        </section>

        <section>
          <h2 class="mb-1.5 text-base font-bold text-gray-900">4. Propriété intellectuelle</h2>
          <p>
            L'ensemble des contenus du site (textes, images, logo, design) est la propriété
            exclusive de Tola Taste, sauf mention contraire. Toute reproduction ou
            réutilisation sans autorisation préalable est interdite.
          </p>
        </section>

        <section>
          <h2 class="mb-1.5 text-base font-bold text-gray-900">5. Données personnelles</h2>
          <p>
            Pour en savoir plus sur le traitement de vos données, consultez notre
            <router-link to="/confidentialite" class="font-bold text-orange-500 hover:text-orange-600">
              politique de confidentialité
            </router-link>.
          </p>
        </section>

        <section>
          <h2 class="mb-1.5 text-base font-bold text-gray-900">6. Limitation de responsabilité</h2>
          <p>
            Les informations et visuels du menu sont présentés à titre indicatif.
            La disponibilité des plats peut varier. En cas de question sur une commande,
            contactez-nous directement aux coordonnées indiquées ci-dessus.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
