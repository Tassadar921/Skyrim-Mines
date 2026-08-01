/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  simulator: {
    index: typeof routes['simulator.index']
    store: typeof routes['simulator.store']
    show: typeof routes['simulator.show']
    announce: typeof routes['simulator.announce']
    uploadAnnouncement: typeof routes['simulator.uploadAnnouncement']
    updateAnnouncement: typeof routes['simulator.updateAnnouncement']
    destroyAnnouncement: typeof routes['simulator.destroyAnnouncement']
    nextMonth: typeof routes['simulator.nextMonth']
    respondEvent: typeof routes['simulator.respondEvent']
    advisor: typeof routes['simulator.advisor']
    destroy: typeof routes['simulator.destroy']
  }
  password: {
    reset: {
      show: typeof routes['password.reset.show']
      update: typeof routes['password.reset.update']
    }
  }
  profile: {
    show: typeof routes['profile.show']
    export: typeof routes['profile.export']
    update: typeof routes['profile.update']
    passwordReset: typeof routes['profile.passwordReset']
    destroy: typeof routes['profile.destroy']
  }
  login: typeof routes['login']
  auth: {
    login: {
      store: typeof routes['auth.login.store']
    }
    logout: typeof routes['auth.logout']
  }
  forgot: {
    password: typeof routes['forgot.password'] & {
      store: typeof routes['forgot.password.store']
    }
  }
  register: typeof routes['register'] & {
    store: typeof routes['register.store']
  }
  email: {
    verify: typeof routes['email.verify']
  }
  admin: {
    dashboard: typeof routes['admin.dashboard']
    terms: {
      invalidate: typeof routes['admin.terms.invalidate']
    }
    users: {
      index: typeof routes['admin.users.index']
      show: typeof routes['admin.users.show']
      export: typeof routes['admin.users.export']
      update: typeof routes['admin.users.update']
    }
  }
  legal: {
    show: typeof routes['legal.show']
  }
  terms: {
    show: typeof routes['terms.show']
    accept: typeof routes['terms.accept']
  }
}
