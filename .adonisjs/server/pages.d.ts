import '@adonisjs/inertia/types'

import type { VNodeProps, AllowedComponentProps, ComponentInstance } from 'vue'

type ExtractProps<T> = Omit<
  ComponentInstance<T>['$props'],
  keyof VNodeProps | keyof AllowedComponentProps
>

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'admin/dashboard': ExtractProps<(typeof import('../../inertia/pages/admin/dashboard.vue'))['default']>
    'admin/users/index': ExtractProps<(typeof import('../../inertia/pages/admin/users/index.vue'))['default']>
    'admin/users/show': ExtractProps<(typeof import('../../inertia/pages/admin/users/show.vue'))['default']>
    'auth/forgot_password': ExtractProps<(typeof import('../../inertia/pages/auth/forgot_password.vue'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.vue'))['default']>
    'auth/register': ExtractProps<(typeof import('../../inertia/pages/auth/register.vue'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.vue'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.vue'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.vue'))['default']>
    'legal': ExtractProps<(typeof import('../../inertia/pages/legal.vue'))['default']>
    'password_reset': ExtractProps<(typeof import('../../inertia/pages/password_reset.vue'))['default']>
    'profile': ExtractProps<(typeof import('../../inertia/pages/profile.vue'))['default']>
    'simulation/index': ExtractProps<(typeof import('../../inertia/pages/simulation/index.vue'))['default']>
    'simulation/show': ExtractProps<(typeof import('../../inertia/pages/simulation/show.vue'))['default']>
    'terms': ExtractProps<(typeof import('../../inertia/pages/terms.vue'))['default']>
  }
}
