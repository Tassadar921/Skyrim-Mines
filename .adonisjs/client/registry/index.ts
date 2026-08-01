/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'simulator.index': {
    methods: ["GET","HEAD"],
    pattern: '/simulation',
    tokens: [{"old":"/simulation","type":0,"val":"simulation","end":""}],
    types: placeholder as Registry['simulator.index']['types'],
  },
  'simulator.store': {
    methods: ["POST"],
    pattern: '/simulation',
    tokens: [{"old":"/simulation","type":0,"val":"simulation","end":""}],
    types: placeholder as Registry['simulator.store']['types'],
  },
  'simulator.show': {
    methods: ["GET","HEAD"],
    pattern: '/simulation/:id',
    tokens: [{"old":"/simulation/:id","type":0,"val":"simulation","end":""},{"old":"/simulation/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['simulator.show']['types'],
  },
  'simulator.announce': {
    methods: ["POST"],
    pattern: '/simulation/:id/announce',
    tokens: [{"old":"/simulation/:id/announce","type":0,"val":"simulation","end":""},{"old":"/simulation/:id/announce","type":1,"val":"id","end":""},{"old":"/simulation/:id/announce","type":0,"val":"announce","end":""}],
    types: placeholder as Registry['simulator.announce']['types'],
  },
  'simulator.uploadAnnouncement': {
    methods: ["POST"],
    pattern: '/simulation/:id/upload',
    tokens: [{"old":"/simulation/:id/upload","type":0,"val":"simulation","end":""},{"old":"/simulation/:id/upload","type":1,"val":"id","end":""},{"old":"/simulation/:id/upload","type":0,"val":"upload","end":""}],
    types: placeholder as Registry['simulator.uploadAnnouncement']['types'],
  },
  'simulator.updateAnnouncement': {
    methods: ["PATCH"],
    pattern: '/simulation/:id/announcements/:announcementId',
    tokens: [{"old":"/simulation/:id/announcements/:announcementId","type":0,"val":"simulation","end":""},{"old":"/simulation/:id/announcements/:announcementId","type":1,"val":"id","end":""},{"old":"/simulation/:id/announcements/:announcementId","type":0,"val":"announcements","end":""},{"old":"/simulation/:id/announcements/:announcementId","type":1,"val":"announcementId","end":""}],
    types: placeholder as Registry['simulator.updateAnnouncement']['types'],
  },
  'simulator.destroyAnnouncement': {
    methods: ["DELETE"],
    pattern: '/simulation/:id/announcements/:announcementId',
    tokens: [{"old":"/simulation/:id/announcements/:announcementId","type":0,"val":"simulation","end":""},{"old":"/simulation/:id/announcements/:announcementId","type":1,"val":"id","end":""},{"old":"/simulation/:id/announcements/:announcementId","type":0,"val":"announcements","end":""},{"old":"/simulation/:id/announcements/:announcementId","type":1,"val":"announcementId","end":""}],
    types: placeholder as Registry['simulator.destroyAnnouncement']['types'],
  },
  'simulator.nextMonth': {
    methods: ["POST"],
    pattern: '/simulation/:id/next-month',
    tokens: [{"old":"/simulation/:id/next-month","type":0,"val":"simulation","end":""},{"old":"/simulation/:id/next-month","type":1,"val":"id","end":""},{"old":"/simulation/:id/next-month","type":0,"val":"next-month","end":""}],
    types: placeholder as Registry['simulator.nextMonth']['types'],
  },
  'simulator.respondEvent': {
    methods: ["POST"],
    pattern: '/simulation/:id/respond-event',
    tokens: [{"old":"/simulation/:id/respond-event","type":0,"val":"simulation","end":""},{"old":"/simulation/:id/respond-event","type":1,"val":"id","end":""},{"old":"/simulation/:id/respond-event","type":0,"val":"respond-event","end":""}],
    types: placeholder as Registry['simulator.respondEvent']['types'],
  },
  'simulator.advisor': {
    methods: ["POST"],
    pattern: '/simulation/:id/advisor',
    tokens: [{"old":"/simulation/:id/advisor","type":0,"val":"simulation","end":""},{"old":"/simulation/:id/advisor","type":1,"val":"id","end":""},{"old":"/simulation/:id/advisor","type":0,"val":"advisor","end":""}],
    types: placeholder as Registry['simulator.advisor']['types'],
  },
  'simulator.destroy': {
    methods: ["DELETE"],
    pattern: '/simulation/:id',
    tokens: [{"old":"/simulation/:id","type":0,"val":"simulation","end":""},{"old":"/simulation/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['simulator.destroy']['types'],
  },
  'password.reset.show': {
    methods: ["GET","HEAD"],
    pattern: '/password-reset',
    tokens: [{"old":"/password-reset","type":0,"val":"password-reset","end":""}],
    types: placeholder as Registry['password.reset.show']['types'],
  },
  'password.reset.update': {
    methods: ["POST"],
    pattern: '/password-reset',
    tokens: [{"old":"/password-reset","type":0,"val":"password-reset","end":""}],
    types: placeholder as Registry['password.reset.update']['types'],
  },
  'profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/profile',
    tokens: [{"old":"/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.show']['types'],
  },
  'profile.export': {
    methods: ["GET","HEAD"],
    pattern: '/profile/export',
    tokens: [{"old":"/profile/export","type":0,"val":"profile","end":""},{"old":"/profile/export","type":0,"val":"export","end":""}],
    types: placeholder as Registry['profile.export']['types'],
  },
  'profile.update': {
    methods: ["PUT"],
    pattern: '/profile',
    tokens: [{"old":"/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.update']['types'],
  },
  'profile.passwordReset': {
    methods: ["POST"],
    pattern: '/profile/password-reset',
    tokens: [{"old":"/profile/password-reset","type":0,"val":"profile","end":""},{"old":"/profile/password-reset","type":0,"val":"password-reset","end":""}],
    types: placeholder as Registry['profile.passwordReset']['types'],
  },
  'profile.destroy': {
    methods: ["DELETE"],
    pattern: '/profile',
    tokens: [{"old":"/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.destroy']['types'],
  },
  'login': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['login']['types'],
  },
  'auth.login.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login.store']['types'],
  },
  'forgot.password': {
    methods: ["GET","HEAD"],
    pattern: '/forgot-password',
    tokens: [{"old":"/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['forgot.password']['types'],
  },
  'forgot.password.store': {
    methods: ["POST"],
    pattern: '/forgot-password',
    tokens: [{"old":"/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['forgot.password.store']['types'],
  },
  'register': {
    methods: ["GET","HEAD"],
    pattern: '/register',
    tokens: [{"old":"/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['register']['types'],
  },
  'register.store': {
    methods: ["POST"],
    pattern: '/register',
    tokens: [{"old":"/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['register.store']['types'],
  },
  'email.verify': {
    methods: ["GET","HEAD"],
    pattern: '/email-verify',
    tokens: [{"old":"/email-verify","type":0,"val":"email-verify","end":""}],
    types: placeholder as Registry['email.verify']['types'],
  },
  'auth.logout': {
    methods: ["DELETE"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'admin.dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/admin',
    tokens: [{"old":"/admin","type":0,"val":"admin","end":""}],
    types: placeholder as Registry['admin.dashboard']['types'],
  },
  'admin.terms.invalidate': {
    methods: ["POST"],
    pattern: '/admin/terms/invalidate',
    tokens: [{"old":"/admin/terms/invalidate","type":0,"val":"admin","end":""},{"old":"/admin/terms/invalidate","type":0,"val":"terms","end":""},{"old":"/admin/terms/invalidate","type":0,"val":"invalidate","end":""}],
    types: placeholder as Registry['admin.terms.invalidate']['types'],
  },
  'admin.users.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/users',
    tokens: [{"old":"/admin/users","type":0,"val":"admin","end":""},{"old":"/admin/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['admin.users.index']['types'],
  },
  'admin.users.show': {
    methods: ["GET","HEAD"],
    pattern: '/admin/users/:id',
    tokens: [{"old":"/admin/users/:id","type":0,"val":"admin","end":""},{"old":"/admin/users/:id","type":0,"val":"users","end":""},{"old":"/admin/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.users.show']['types'],
  },
  'admin.users.export': {
    methods: ["GET","HEAD"],
    pattern: '/admin/users/:id/export',
    tokens: [{"old":"/admin/users/:id/export","type":0,"val":"admin","end":""},{"old":"/admin/users/:id/export","type":0,"val":"users","end":""},{"old":"/admin/users/:id/export","type":1,"val":"id","end":""},{"old":"/admin/users/:id/export","type":0,"val":"export","end":""}],
    types: placeholder as Registry['admin.users.export']['types'],
  },
  'admin.users.update': {
    methods: ["PUT"],
    pattern: '/admin/users/:id',
    tokens: [{"old":"/admin/users/:id","type":0,"val":"admin","end":""},{"old":"/admin/users/:id","type":0,"val":"users","end":""},{"old":"/admin/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.users.update']['types'],
  },
  'legal.show': {
    methods: ["GET","HEAD"],
    pattern: '/legal',
    tokens: [{"old":"/legal","type":0,"val":"legal","end":""}],
    types: placeholder as Registry['legal.show']['types'],
  },
  'terms.show': {
    methods: ["GET","HEAD"],
    pattern: '/terms',
    tokens: [{"old":"/terms","type":0,"val":"terms","end":""}],
    types: placeholder as Registry['terms.show']['types'],
  },
  'terms.accept': {
    methods: ["POST"],
    pattern: '/terms/accept',
    tokens: [{"old":"/terms/accept","type":0,"val":"terms","end":""},{"old":"/terms/accept","type":0,"val":"accept","end":""}],
    types: placeholder as Registry['terms.accept']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
