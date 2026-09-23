/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  eventStream: typeof routes['event_stream']
  subscribe: typeof routes['subscribe']
  unsubscribe: typeof routes['unsubscribe']
  home: typeof routes['home']
  tarifs: typeof routes['tarifs']
  stocks: typeof routes['stocks']
  organigramme: typeof routes['organigramme']
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
      capitalSnapshot: {
        store: typeof routes['admin.dashboard.capitalSnapshot.store']
      }
      taxBrackets: {
        update: typeof routes['admin.dashboard.taxBrackets.update']
      }
    }
    siteSettings: {
      index: typeof routes['admin.siteSettings.index']
      updateLogo: typeof routes['admin.siteSettings.updateLogo']
      destroyLogo: typeof routes['admin.siteSettings.destroyLogo']
      updateSubtitle: typeof routes['admin.siteSettings.updateSubtitle']
      updateTaxSystem: typeof routes['admin.siteSettings.updateTaxSystem']
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
      recipe: {
        edit: typeof routes['admin.resources.recipe.edit']
        update: typeof routes['admin.resources.recipe.update']
      }
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
    stocks: {
      index: typeof routes['admin.stocks.index']
      update: typeof routes['admin.stocks.update']
      barrel: {
        update: typeof routes['admin.stocks.barrel.update']
      }
    }
    buybacks: {
      index: typeof routes['admin.buybacks.index']
    }
    expenses: {
      index: typeof routes['admin.expenses.index']
      store: typeof routes['admin.expenses.store']
      destroy: typeof routes['admin.expenses.destroy']
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
    barrel: {
      index: typeof routes['admin.barrel.index']
      update: typeof routes['admin.barrel.update']
    }
    barrelRentals: {
      index: typeof routes['admin.barrelRentals.index']
      store: typeof routes['admin.barrelRentals.store']
      show: typeof routes['admin.barrelRentals.show']
      update: typeof routes['admin.barrelRentals.update']
      destroy: typeof routes['admin.barrelRentals.destroy']
      payments: {
        store: typeof routes['admin.barrelRentals.payments.store']
        destroy: typeof routes['admin.barrelRentals.payments.destroy']
      }
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
  }
}
