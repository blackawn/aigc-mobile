import { createRouter, createWebHistory,RouteRecordRaw  } from 'vue-router'

export const routeConfig: Array<RouteRecordRaw> = [
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
        meta: {
          transition: 'slide-right',
        },
        component: () => import('@/pages/ai/index.vue'),
        children: [
          {
            path: '/client/ai/chat/:type?/:id?',
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
        meta: {
          transition: 'slide-left',
        },
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
  history: createWebHistory (),
  routes: routeConfig
})

router.beforeEach((to, from, next) => {
  next()
})

router.afterEach((to, from, failure) => {

})

export { router }
