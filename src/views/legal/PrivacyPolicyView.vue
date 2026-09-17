<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft, ShieldCheck } from '@lucide/vue'

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
        <ShieldCheck :size="22" class="text-orange-500" />
        <h1 class="text-2xl font-extrabold text-gray-900 md:text-3xl">Politique de confidentialité</h1>
      </div>
      <p class="text-xs text-gray-400">Dernière mise à jour : {{ new Date().toLocaleDateString('fr-FR') }}</p>

      <div class="mt-6 space-y-6 text-sm leading-relaxed text-gray-600">
        <section>
          <h2 class="mb-1.5 text-base font-bold text-gray-900">1. Qui sommes-nous ?</h2>
          <p>
            Tola Taste — Cotonou, Bénin. Pour toute question sur vos données :
            <span class="font-semibold text-gray-900"><a href="mailto: tolataste@gmail.com">tolataste@gmail.com</a></span>
            <span v-if="false"></span> / <span class="font-semibold text-gray-900"><a href="tel:+2290197333204">+229 01 97 33 32 04</a></span>.
          </p>
        </section>

        <section>
          <h2 class="mb-1.5 text-base font-bold text-gray-900">2. Données que nous collectons</h2>
          <ul class="list-disc space-y-1 pl-5">
            <li><span class="font-semibold">Compte client :</span> nom, adresse e-mail, mot de passe (stocké sous forme hashée, jamais en clair).</li>
            <li><span class="font-semibold">Commandes :</span> articles, quantités, table choisie, notes que vous ajoutez (ex. « à emporter »).</li>
            <li><span class="font-semibold">Données techniques :</span> jeton de session stocké dans votre navigateur (<code class="rounded bg-gray-100 px-1 text-xs">localStorage</code>) pour vous garder connecté(e).</li>
          </ul>
          <p class="mt-2">
            Nous ne collectons aucune coordonnée bancaire : les paiements se font sur place
            (espèces ou Mobile Money).
          </p>
        </section>

        <section>
          <h2 class="mb-1.5 text-base font-bold text-gray-900">3. À quoi servent vos données ?</h2>
          <ul class="list-disc space-y-1 pl-5">
            <li>Créer et gérer votre compte client.</li>
            <li>Enregistrer, préparer et suivre vos commandes.</li>
            <li>Améliorer le service (statistiques internes anonymisées).</li>
          </ul>
        </section>

        <section>
          <h2 class="mb-1.5 text-base font-bold text-gray-900">4. Durée de conservation</h2>
          <p>
            Votre compte est conservé tant qu'il est actif. Vous pouvez demander sa suppression
            à tout moment. L'historique des commandes est conservé pour les
            besoins d'exploitation, sans diffusion à des tiers.
          </p>
        </section>

        <section>
          <h2 class="mb-1.5 text-base font-bold text-gray-900">5. Partage des données</h2>
          <p>
            Vos données ne sont ni vendues ni louées. Elles sont accessibles uniquement à
            l'équipe Tola Taste (serveurs, cuisine, gestion) pour traiter vos commandes.
            Aucun traceur publicitaire tiers n'est utilisé sur ce site.
          </p>
        </section>

        <section>
          <h2 class="mb-1.5 text-base font-bold text-gray-900">6. Vos droits</h2>
          <p>
            Vous pouvez demander l'accès, la rectification ou la suppression de vos données
            en écrivant à <span class="font-semibold text-gray-900"><a href="mailto:tolataste@gmail.com">tolataste@gmail.com</a></span> ou en appelant <span class="font-semibold text-gray-900"><a href="tel:+2290197333204">+229 01 97 33 32 04</a></span>.
            Vous pouvez aussi vous déconnecter à tout moment : cela efface le jeton de session
            de votre navigateur.
          </p>
        </section>

        <section>
          <h2 class="mb-1.5 text-base font-bold text-gray-900">7. Sécurité</h2>
          <p>
            Les mots de passe sont hashés, les accès staff sont limités par rôle
            (serveur, cuisine, manager, admin) et les échanges avec le serveur sont
            protégés. En cas de question, contactez-nous aux coordonnées ci-dessus.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
