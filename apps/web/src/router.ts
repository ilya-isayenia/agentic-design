import { createRouter, createWebHashHistory } from 'vue-router';
import { STEPS, useSignup } from '@web/composables/useSignup';

export const router = createRouter({
  // Hash history: GitHub Pages has no server rewrites.
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'finder', component: () => import('@web/views/ClubFinderView.vue'), meta: { title: 'Find your club' } },
    { path: '/join/:clubId', redirect: (to) => `/join/${String(to.params.clubId)}/type` },
    {
      path: '/join/:clubId/:step',
      name: 'signup',
      component: () => import('@web/views/SignupView.vue'),
      meta: { title: 'Join' },
      beforeEnter: (to) => {
        const signup = useSignup();
        const clubId = String(to.params.clubId);
        signup.startWith(clubId);
        if (!signup.club.value) return { name: 'finder' };
        const index = STEPS.findIndex((s) => s.id === to.params.step);
        const open = signup.firstOpen.value === -1 ? STEPS.length - 1 : signup.firstOpen.value;
        if (index === -1 || index > open) return { name: 'signup', params: { clubId, step: STEPS[open]?.id ?? 'type' } };
        return true;
      },
    },
    {
      path: '/success',
      name: 'success',
      component: () => import('@web/views/SuccessView.vue'),
      meta: { title: 'Welcome' },
      beforeEnter: () => (useSignup().state.verified ? true : { name: 'finder' }),
    },
    { path: '/legal/:page', name: 'legal', component: () => import('@web/views/LegalView.vue'), meta: { title: 'Legal' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

router.afterEach((to) => {
  document.title = `${String(to.meta.title ?? 'Join')} — membership signup (demo)`;
});
