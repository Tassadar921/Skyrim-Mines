import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'tarifs': { paramsTuple?: []; params?: {} }
    'stocks': { paramsTuple?: []; params?: {} }
    'organigramme': { paramsTuple?: []; params?: {} }
    'commandes.create': { paramsTuple?: []; params?: {} }
    'commandes.store': { paramsTuple?: []; params?: {} }
    'commandes.index': { paramsTuple?: []; params?: {} }
    'commandes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commandes.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'livraisons.store': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'deposits.store': { paramsTuple?: []; params?: {} }
    'deposits.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'buybacks.store': { paramsTuple?: []; params?: {} }
    'organization.show': { paramsTuple?: []; params?: {} }
    'organization.members.store': { paramsTuple?: []; params?: {} }
    'organization.members.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organization.members.updateRole': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'login': { paramsTuple?: []; params?: {} }
    'auth.discord.redirect': { paramsTuple?: []; params?: {} }
    'auth.discord.callback': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.dashboard.castellanyTax.update': { paramsTuple?: []; params?: {} }
    'admin.dashboard.capitalSnapshot.store': { paramsTuple?: []; params?: {} }
    'admin.siteSettings.updateLogo': { paramsTuple?: []; params?: {} }
    'admin.siteSettings.destroyLogo': { paramsTuple?: []; params?: {} }
    'admin.siteSettings.updateSubtitle': { paramsTuple?: []; params?: {} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'admin.users.create': { paramsTuple?: []; params?: {} }
    'admin.users.store': { paramsTuple?: []; params?: {} }
    'admin.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.updateBalance': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.updateAvatar': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.index': { paramsTuple?: []; params?: {} }
    'admin.resources.create': { paramsTuple?: []; params?: {} }
    'admin.resources.store': { paramsTuple?: []; params?: {} }
    'admin.resources.reorder': { paramsTuple?: []; params?: {} }
    'admin.resources.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.recipe.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.recipe.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.materials.index': { paramsTuple?: []; params?: {} }
    'admin.materials.create': { paramsTuple?: []; params?: {} }
    'admin.materials.store': { paramsTuple?: []; params?: {} }
    'admin.materials.reorder': { paramsTuple?: []; params?: {} }
    'admin.materials.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.materials.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.materials.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.castellanies.index': { paramsTuple?: []; params?: {} }
    'admin.castellanies.create': { paramsTuple?: []; params?: {} }
    'admin.castellanies.store': { paramsTuple?: []; params?: {} }
    'admin.castellanies.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.castellanies.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.castellanies.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.stocks.index': { paramsTuple?: []; params?: {} }
    'admin.stocks.update': { paramsTuple?: []; params?: {} }
    'admin.stocks.barrel.update': { paramsTuple: [ParamValue]; params: {'resourceId': ParamValue} }
    'admin.buybacks.index': { paramsTuple?: []; params?: {} }
    'admin.expenses.index': { paramsTuple?: []; params?: {} }
    'admin.expenses.store': { paramsTuple?: []; params?: {} }
    'admin.expenses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.commandes.index': { paramsTuple?: []; params?: {} }
    'admin.commandes.validate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.commandes.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orderArchives.create': { paramsTuple?: []; params?: {} }
    'admin.orderArchives.store': { paramsTuple?: []; params?: {} }
    'admin.livraisons.index': { paramsTuple?: []; params?: {} }
    'admin.livraisons.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.barrel.index': { paramsTuple?: []; params?: {} }
    'admin.barrel.update': { paramsTuple?: []; params?: {} }
    'admin.barrelRentals.index': { paramsTuple?: []; params?: {} }
    'admin.barrelRentals.store': { paramsTuple?: []; params?: {} }
    'admin.barrelRentals.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.barrelRentals.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.barrelRentals.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.barrelRentals.payments.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.barrelRentals.payments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.index': { paramsTuple?: []; params?: {} }
    'admin.organizations.create': { paramsTuple?: []; params?: {} }
    'admin.organizations.store': { paramsTuple?: []; params?: {} }
    'admin.organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.members.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.members.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'memberId': ParamValue} }
    'admin.organizations.members.updateRole': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'memberId': ParamValue} }
    'admin.organizations.resourcePrices.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'resourceId': ParamValue} }
    'admin.organizations.resourcePrices.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'resourceId': ParamValue} }
  }
  GET: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'tarifs': { paramsTuple?: []; params?: {} }
    'stocks': { paramsTuple?: []; params?: {} }
    'organigramme': { paramsTuple?: []; params?: {} }
    'commandes.create': { paramsTuple?: []; params?: {} }
    'commandes.index': { paramsTuple?: []; params?: {} }
    'commandes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organization.show': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'auth.discord.redirect': { paramsTuple?: []; params?: {} }
    'auth.discord.callback': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'admin.users.create': { paramsTuple?: []; params?: {} }
    'admin.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.index': { paramsTuple?: []; params?: {} }
    'admin.resources.create': { paramsTuple?: []; params?: {} }
    'admin.resources.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.recipe.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.materials.index': { paramsTuple?: []; params?: {} }
    'admin.materials.create': { paramsTuple?: []; params?: {} }
    'admin.materials.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.castellanies.index': { paramsTuple?: []; params?: {} }
    'admin.castellanies.create': { paramsTuple?: []; params?: {} }
    'admin.castellanies.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.stocks.index': { paramsTuple?: []; params?: {} }
    'admin.buybacks.index': { paramsTuple?: []; params?: {} }
    'admin.expenses.index': { paramsTuple?: []; params?: {} }
    'admin.commandes.index': { paramsTuple?: []; params?: {} }
    'admin.orderArchives.create': { paramsTuple?: []; params?: {} }
    'admin.livraisons.index': { paramsTuple?: []; params?: {} }
    'admin.barrel.index': { paramsTuple?: []; params?: {} }
    'admin.barrelRentals.index': { paramsTuple?: []; params?: {} }
    'admin.barrelRentals.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.index': { paramsTuple?: []; params?: {} }
    'admin.organizations.create': { paramsTuple?: []; params?: {} }
    'admin.organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'tarifs': { paramsTuple?: []; params?: {} }
    'stocks': { paramsTuple?: []; params?: {} }
    'organigramme': { paramsTuple?: []; params?: {} }
    'commandes.create': { paramsTuple?: []; params?: {} }
    'commandes.index': { paramsTuple?: []; params?: {} }
    'commandes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organization.show': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'auth.discord.redirect': { paramsTuple?: []; params?: {} }
    'auth.discord.callback': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'admin.users.create': { paramsTuple?: []; params?: {} }
    'admin.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.index': { paramsTuple?: []; params?: {} }
    'admin.resources.create': { paramsTuple?: []; params?: {} }
    'admin.resources.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.recipe.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.materials.index': { paramsTuple?: []; params?: {} }
    'admin.materials.create': { paramsTuple?: []; params?: {} }
    'admin.materials.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.castellanies.index': { paramsTuple?: []; params?: {} }
    'admin.castellanies.create': { paramsTuple?: []; params?: {} }
    'admin.castellanies.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.stocks.index': { paramsTuple?: []; params?: {} }
    'admin.buybacks.index': { paramsTuple?: []; params?: {} }
    'admin.expenses.index': { paramsTuple?: []; params?: {} }
    'admin.commandes.index': { paramsTuple?: []; params?: {} }
    'admin.orderArchives.create': { paramsTuple?: []; params?: {} }
    'admin.livraisons.index': { paramsTuple?: []; params?: {} }
    'admin.barrel.index': { paramsTuple?: []; params?: {} }
    'admin.barrelRentals.index': { paramsTuple?: []; params?: {} }
    'admin.barrelRentals.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.index': { paramsTuple?: []; params?: {} }
    'admin.organizations.create': { paramsTuple?: []; params?: {} }
    'admin.organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'commandes.store': { paramsTuple?: []; params?: {} }
    'livraisons.store': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'deposits.store': { paramsTuple?: []; params?: {} }
    'buybacks.store': { paramsTuple?: []; params?: {} }
    'organization.members.store': { paramsTuple?: []; params?: {} }
    'admin.dashboard.capitalSnapshot.store': { paramsTuple?: []; params?: {} }
    'admin.siteSettings.updateLogo': { paramsTuple?: []; params?: {} }
    'admin.users.store': { paramsTuple?: []; params?: {} }
    'admin.users.updateAvatar': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.store': { paramsTuple?: []; params?: {} }
    'admin.materials.store': { paramsTuple?: []; params?: {} }
    'admin.castellanies.store': { paramsTuple?: []; params?: {} }
    'admin.expenses.store': { paramsTuple?: []; params?: {} }
    'admin.orderArchives.store': { paramsTuple?: []; params?: {} }
    'admin.barrelRentals.store': { paramsTuple?: []; params?: {} }
    'admin.barrelRentals.payments.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.store': { paramsTuple?: []; params?: {} }
    'admin.organizations.members.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'commandes.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'deposits.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organization.members.updateRole': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.reorder': { paramsTuple?: []; params?: {} }
    'admin.materials.reorder': { paramsTuple?: []; params?: {} }
    'admin.stocks.update': { paramsTuple?: []; params?: {} }
    'admin.stocks.barrel.update': { paramsTuple: [ParamValue]; params: {'resourceId': ParamValue} }
    'admin.commandes.validate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.commandes.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.barrel.update': { paramsTuple?: []; params?: {} }
    'admin.organizations.members.updateRole': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'memberId': ParamValue} }
  }
  DELETE: {
    'organization.members.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'admin.siteSettings.destroyLogo': { paramsTuple?: []; params?: {} }
    'admin.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.materials.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.castellanies.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.expenses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.livraisons.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.barrelRentals.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.barrelRentals.payments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.members.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'memberId': ParamValue} }
    'admin.organizations.resourcePrices.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'resourceId': ParamValue} }
  }
  PUT: {
    'admin.dashboard.castellanyTax.update': { paramsTuple?: []; params?: {} }
    'admin.siteSettings.updateSubtitle': { paramsTuple?: []; params?: {} }
    'admin.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.updateBalance': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.recipe.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.materials.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.castellanies.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.barrelRentals.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.resourcePrices.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'resourceId': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}