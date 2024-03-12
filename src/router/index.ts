import { createRouter, createWebHashHistory } from 'vue-router'

export const routeConfig = [
  {
    path: '/',
    redirect: '/client'
  },
  {
    path: '/client',
    redirect: '/client/ai/chat',
    name: 'client',
    component: () => import('@/layout/index.vue'),
    children: [
      {
        path: '/client/ai',
        redirect: '/client/ai/chat',
        name: 'ai',
        component: () => import('@/pages/ai/index.vue'),
        children: [
          {
            path: '/client/ai/chat',
            name: 'chat',
            component: () => import('@/pages/ai/chat/index.vue'),
          },
          {
            path: '/client/ai/draw',
            name: 'draw',
            component: () => import('@/pages/ai/draw/index.vue'),
          }
        ]
      },
      {
        path: '/client/mine',
        name: 'mine',
        component: () => import('@/pages/mine/index.vue')
      }
    ]
  },
  {
    path: '/sign-in',
    name: 'signIn',
    component: () => import('@/pages/sign-in/index.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routeConfig
})

router.beforeEach((to, from, next) => {
  next()
})

router.afterEach((to, from, failure) => {

})

export { router }
