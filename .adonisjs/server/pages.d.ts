import '@adonisjs/inertia/types'

import type { VNodeProps, AllowedComponentProps, ComponentInstance } from 'vue'

type ExtractProps<T> = Omit<
  ComponentInstance<T>['$props'],
  keyof VNodeProps | keyof AllowedComponentProps
>

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'admin/buybacks/index': ExtractProps<(typeof import('../../inertia/pages/admin/buybacks/index.vue'))['default']>
    'admin/castellanies/create': ExtractProps<(typeof import('../../inertia/pages/admin/castellanies/create.vue'))['default']>
    'admin/castellanies/index': ExtractProps<(typeof import('../../inertia/pages/admin/castellanies/index.vue'))['default']>
    'admin/castellanies/show': ExtractProps<(typeof import('../../inertia/pages/admin/castellanies/show.vue'))['default']>
    'admin/commandes/archive': ExtractProps<(typeof import('../../inertia/pages/admin/commandes/archive.vue'))['default']>
    'admin/commandes/index': ExtractProps<(typeof import('../../inertia/pages/admin/commandes/index.vue'))['default']>
    'admin/dashboard': ExtractProps<(typeof import('../../inertia/pages/admin/dashboard.vue'))['default']>
    'admin/devis/index': ExtractProps<(typeof import('../../inertia/pages/admin/devis/index.vue'))['default']>
    'admin/licenses/index': ExtractProps<(typeof import('../../inertia/pages/admin/licenses/index.vue'))['default']>
    'admin/licenses/show': ExtractProps<(typeof import('../../inertia/pages/admin/licenses/show.vue'))['default']>
    'admin/livraisons/index': ExtractProps<(typeof import('../../inertia/pages/admin/livraisons/index.vue'))['default']>
    'admin/materials/create': ExtractProps<(typeof import('../../inertia/pages/admin/materials/create.vue'))['default']>
    'admin/materials/index': ExtractProps<(typeof import('../../inertia/pages/admin/materials/index.vue'))['default']>
    'admin/materials/show': ExtractProps<(typeof import('../../inertia/pages/admin/materials/show.vue'))['default']>
    'admin/organizations/create': ExtractProps<(typeof import('../../inertia/pages/admin/organizations/create.vue'))['default']>
    'admin/organizations/index': ExtractProps<(typeof import('../../inertia/pages/admin/organizations/index.vue'))['default']>
    'admin/organizations/show': ExtractProps<(typeof import('../../inertia/pages/admin/organizations/show.vue'))['default']>
    'admin/resources/create': ExtractProps<(typeof import('../../inertia/pages/admin/resources/create.vue'))['default']>
    'admin/resources/index': ExtractProps<(typeof import('../../inertia/pages/admin/resources/index.vue'))['default']>
    'admin/resources/show': ExtractProps<(typeof import('../../inertia/pages/admin/resources/show.vue'))['default']>
    'admin/tonneau/index': ExtractProps<(typeof import('../../inertia/pages/admin/tonneau/index.vue'))['default']>
    'admin/users/create': ExtractProps<(typeof import('../../inertia/pages/admin/users/create.vue'))['default']>
    'admin/users/index': ExtractProps<(typeof import('../../inertia/pages/admin/users/index.vue'))['default']>
    'admin/users/show': ExtractProps<(typeof import('../../inertia/pages/admin/users/show.vue'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.vue'))['default']>
    'commandes/create': ExtractProps<(typeof import('../../inertia/pages/commandes/create.vue'))['default']>
    'commandes/index': ExtractProps<(typeof import('../../inertia/pages/commandes/index.vue'))['default']>
    'commandes/show': ExtractProps<(typeof import('../../inertia/pages/commandes/show.vue'))['default']>
    'devis/create': ExtractProps<(typeof import('../../inertia/pages/devis/create.vue'))['default']>
    'devis/index': ExtractProps<(typeof import('../../inertia/pages/devis/index.vue'))['default']>
    'devis/show': ExtractProps<(typeof import('../../inertia/pages/devis/show.vue'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.vue'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.vue'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.vue'))['default']>
    'organigramme': ExtractProps<(typeof import('../../inertia/pages/organigramme.vue'))['default']>
    'organization/show': ExtractProps<(typeof import('../../inertia/pages/organization/show.vue'))['default']>
    'stocks': ExtractProps<(typeof import('../../inertia/pages/stocks.vue'))['default']>
    'tarifs': ExtractProps<(typeof import('../../inertia/pages/tarifs.vue'))['default']>
  }
}
