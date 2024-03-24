import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import store from '@/store'
import { storeMutual } from '@/store/mutual'

const mutualStore = storeMutual(store)

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
        component: () => import('@/pages/ai/index.vue'),
        children: [
          {
            path: '/client/ai/chat/:type?/:id?',
            name: 'chat',
            component: () => import('@/pages/ai/chat/index.vue'),
          },
          {
            path: '/client/ai/draw/:id?',
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
  history: createWebHistory(),
  routes: routeConfig
})

router.beforeEach((to, from, next) => {
  next()
})

router.afterEach((to, from, failure) => {

  if (mutualStore.transitionEffected) {
    const toName = to.name as string
    const fromName = from.name as string

    const slideLeft = (['signIn'].includes((toName)) && fromName)
      || ((['ai', 'chat', 'draw'].includes(fromName)) && (toName === 'mine'))
      || ((fromName === 'chat') && (toName === 'draw'))

    const slideRight = (['signIn'].includes((fromName)))
      || ((['ai', 'chat', 'draw'].includes(toName)) && (fromName === 'mine'))
      || ((toName === 'chat') && (fromName === 'draw'))

    if (slideLeft) {
      to.meta.transition = 'slide-left'
    } else if (slideRight) {
      to.meta.transition = 'slide-right'
    }
  }

})

export { router }
