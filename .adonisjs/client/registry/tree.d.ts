/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  eventStream: typeof routes['event_stream']
  subscribe: typeof routes['subscribe']
  unsubscribe: typeof routes['unsubscribe']
  home: typeof routes['home']
  tarifs: typeof routes['tarifs']
  stocks: typeof routes['stocks'] & {
    resources: {
      updateQuantity: typeof routes['stocks.resources.updateQuantity']
    }
    materials: {
      updateQuantity: typeof routes['stocks.materials.updateQuantity']
    }
  }
  organigramme: typeof routes['organigramme']
  devis: {
    create: typeof routes['devis.create']
    store: typeof routes['devis.store']
    index: typeof routes['devis.index']
    show: typeof routes['devis.show']
  }
  commandes: {
    create: typeof routes['commandes.create']
    store: typeof routes['commandes.store']
    index: typeof routes['commandes.index']
    show: typeof routes['commandes.show']
    cancel: typeof routes['commandes.cancel']
  }
  livraisons: {
    store: typeof routes['livraisons.store']
  }
  deposits: {
    store: typeof routes['deposits.store']
    update: typeof routes['deposits.update']
  }
  buybacks: {
    store: typeof routes['buybacks.store']
  }
  pickaxes: {
    take: typeof routes['pickaxes.take']
    deposit: typeof routes['pickaxes.deposit']
  }
  organization: {
    show: typeof routes['organization.show']
    members: {
      store: typeof routes['organization.members.store']
      destroy: typeof routes['organization.members.destroy']
      updateRole: typeof routes['organization.members.updateRole']
    }
  }
  login: typeof routes['login']
  auth: {
    discord: {
      redirect: typeof routes['auth.discord.redirect']
      callback: typeof routes['auth.discord.callback']
    }
    logout: typeof routes['auth.logout']
  }
  admin: {
    dashboard: typeof routes['admin.dashboard'] & {
      castellanyTax: {
        update: typeof routes['admin.dashboard.castellanyTax.update']
      }
      largeOrderSetting: {
        update: typeof routes['admin.dashboard.largeOrderSetting.update']
      }
      capitalSnapshot: {
        store: typeof routes['admin.dashboard.capitalSnapshot.store']
      }
    }
    users: {
      index: typeof routes['admin.users.index']
      create: typeof routes['admin.users.create']
      store: typeof routes['admin.users.store']
      show: typeof routes['admin.users.show']
      update: typeof routes['admin.users.update']
      updateBalance: typeof routes['admin.users.updateBalance']
      updateAvatar: typeof routes['admin.users.updateAvatar']
      destroy: typeof routes['admin.users.destroy']
    }
    resources: {
      index: typeof routes['admin.resources.index']
      create: typeof routes['admin.resources.create']
      store: typeof routes['admin.resources.store']
      reorder: typeof routes['admin.resources.reorder']
      show: typeof routes['admin.resources.show']
      update: typeof routes['admin.resources.update']
      destroy: typeof routes['admin.resources.destroy']
    }
    materials: {
      index: typeof routes['admin.materials.index']
      create: typeof routes['admin.materials.create']
      store: typeof routes['admin.materials.store']
      reorder: typeof routes['admin.materials.reorder']
      show: typeof routes['admin.materials.show']
      update: typeof routes['admin.materials.update']
      destroy: typeof routes['admin.materials.destroy']
    }
    castellanies: {
      index: typeof routes['admin.castellanies.index']
      create: typeof routes['admin.castellanies.create']
      store: typeof routes['admin.castellanies.store']
      show: typeof routes['admin.castellanies.show']
      update: typeof routes['admin.castellanies.update']
      destroy: typeof routes['admin.castellanies.destroy']
    }
    buybacks: {
      index: typeof routes['admin.buybacks.index']
    }
    devis: {
      index: typeof routes['admin.devis.index']
    }
    commandes: {
      index: typeof routes['admin.commandes.index']
      validate: typeof routes['admin.commandes.validate']
      cancel: typeof routes['admin.commandes.cancel']
    }
    orderArchives: {
      create: typeof routes['admin.orderArchives.create']
      store: typeof routes['admin.orderArchives.store']
    }
    livraisons: {
      index: typeof routes['admin.livraisons.index']
      destroy: typeof routes['admin.livraisons.destroy']
    }
    tonneau: {
      index: typeof routes['admin.tonneau.index']
      update: typeof routes['admin.tonneau.update']
    }
    organizations: {
      index: typeof routes['admin.organizations.index']
      create: typeof routes['admin.organizations.create']
      store: typeof routes['admin.organizations.store']
      show: typeof routes['admin.organizations.show']
      update: typeof routes['admin.organizations.update']
      destroy: typeof routes['admin.organizations.destroy']
      members: {
        store: typeof routes['admin.organizations.members.store']
        destroy: typeof routes['admin.organizations.members.destroy']
        updateRole: typeof routes['admin.organizations.members.updateRole']
      }
      resourcePrices: {
        update: typeof routes['admin.organizations.resourcePrices.update']
        destroy: typeof routes['admin.organizations.resourcePrices.destroy']
      }
    }
    licenses: {
      index: typeof routes['admin.licenses.index']
      prices: {
        update: typeof routes['admin.licenses.prices.update']
      }
      subscribers: {
        store: typeof routes['admin.licenses.subscribers.store']
        show: typeof routes['admin.licenses.subscribers.show']
        destroy: typeof routes['admin.licenses.subscribers.destroy']
      }
      payments: {
        store: typeof routes['admin.licenses.payments.store']
        destroy: typeof routes['admin.licenses.payments.destroy']
      }
    }
  }
}
