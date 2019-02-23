import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: require('@/components/Login').default
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: require('@/components/Dashboard').default,
      children: [
        {
          path: '/sessions',
          name: 'Sessions',
          component: require('@/components/Session').default,
          children: [
            {
              path: '/sessions/workspace/:sessionId/:platform',
              name: 'Workspace',
              component: require('@/components/sessionView/Workspace').default
            }
          ]
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
