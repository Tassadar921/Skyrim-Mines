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
    'devis.create': { paramsTuple?: []; params?: {} }
    'devis.store': { paramsTuple?: []; params?: {} }
    'devis.index': { paramsTuple?: []; params?: {} }
    'devis.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commandes.create': { paramsTuple?: []; params?: {} }
    'commandes.store': { paramsTuple?: []; params?: {} }
    'commandes.index': { paramsTuple?: []; params?: {} }
    'commandes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'commandes.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'livraisons.store': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'stocks.resources.updateQuantity': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stocks.materials.updateQuantity': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'deposits.store': { paramsTuple?: []; params?: {} }
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
    'admin.materials.index': { paramsTuple?: []; params?: {} }
    'admin.materials.create': { paramsTuple?: []; params?: {} }
    'admin.materials.store': { paramsTuple?: []; params?: {} }
    'admin.materials.reorder': { paramsTuple?: []; params?: {} }
    'admin.materials.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.materials.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.materials.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.buybacks.index': { paramsTuple?: []; params?: {} }
    'admin.devis.index': { paramsTuple?: []; params?: {} }
    'admin.commandes.index': { paramsTuple?: []; params?: {} }
    'admin.commandes.validate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.commandes.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.livraisons.index': { paramsTuple?: []; params?: {} }
    'admin.livraisons.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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
    'admin.licenses.index': { paramsTuple?: []; params?: {} }
    'admin.licenses.prices.update': { paramsTuple?: []; params?: {} }
    'admin.licenses.subscribers.store': { paramsTuple?: []; params?: {} }
    'admin.licenses.subscribers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.licenses.subscribers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.licenses.payments.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.licenses.payments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'tarifs': { paramsTuple?: []; params?: {} }
    'stocks': { paramsTuple?: []; params?: {} }
    'organigramme': { paramsTuple?: []; params?: {} }
    'devis.create': { paramsTuple?: []; params?: {} }
    'devis.index': { paramsTuple?: []; params?: {} }
    'devis.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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
    'admin.materials.index': { paramsTuple?: []; params?: {} }
    'admin.materials.create': { paramsTuple?: []; params?: {} }
    'admin.materials.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.buybacks.index': { paramsTuple?: []; params?: {} }
    'admin.devis.index': { paramsTuple?: []; params?: {} }
    'admin.commandes.index': { paramsTuple?: []; params?: {} }
    'admin.livraisons.index': { paramsTuple?: []; params?: {} }
    'admin.organizations.index': { paramsTuple?: []; params?: {} }
    'admin.organizations.create': { paramsTuple?: []; params?: {} }
    'admin.organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.licenses.index': { paramsTuple?: []; params?: {} }
    'admin.licenses.subscribers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'tarifs': { paramsTuple?: []; params?: {} }
    'stocks': { paramsTuple?: []; params?: {} }
    'organigramme': { paramsTuple?: []; params?: {} }
    'devis.create': { paramsTuple?: []; params?: {} }
    'devis.index': { paramsTuple?: []; params?: {} }
    'devis.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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
    'admin.materials.index': { paramsTuple?: []; params?: {} }
    'admin.materials.create': { paramsTuple?: []; params?: {} }
    'admin.materials.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.buybacks.index': { paramsTuple?: []; params?: {} }
    'admin.devis.index': { paramsTuple?: []; params?: {} }
    'admin.commandes.index': { paramsTuple?: []; params?: {} }
    'admin.livraisons.index': { paramsTuple?: []; params?: {} }
    'admin.organizations.index': { paramsTuple?: []; params?: {} }
    'admin.organizations.create': { paramsTuple?: []; params?: {} }
    'admin.organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.licenses.index': { paramsTuple?: []; params?: {} }
    'admin.licenses.subscribers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'devis.store': { paramsTuple?: []; params?: {} }
    'commandes.store': { paramsTuple?: []; params?: {} }
    'livraisons.store': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'deposits.store': { paramsTuple?: []; params?: {} }
    'buybacks.store': { paramsTuple?: []; params?: {} }
    'organization.members.store': { paramsTuple?: []; params?: {} }
    'admin.users.store': { paramsTuple?: []; params?: {} }
    'admin.users.updateAvatar': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.store': { paramsTuple?: []; params?: {} }
    'admin.materials.store': { paramsTuple?: []; params?: {} }
    'admin.organizations.store': { paramsTuple?: []; params?: {} }
    'admin.organizations.members.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.licenses.subscribers.store': { paramsTuple?: []; params?: {} }
    'admin.licenses.payments.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'commandes.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stocks.resources.updateQuantity': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'stocks.materials.updateQuantity': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organization.members.updateRole': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.reorder': { paramsTuple?: []; params?: {} }
    'admin.materials.reorder': { paramsTuple?: []; params?: {} }
    'admin.commandes.validate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.commandes.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.members.updateRole': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'memberId': ParamValue} }
  }
  DELETE: {
    'organization.members.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'admin.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.materials.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.livraisons.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.members.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'memberId': ParamValue} }
    'admin.organizations.resourcePrices.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'resourceId': ParamValue} }
    'admin.licenses.subscribers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.licenses.payments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'admin.dashboard.castellanyTax.update': { paramsTuple?: []; params?: {} }
    'admin.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.updateBalance': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.resources.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.materials.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.organizations.resourcePrices.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'resourceId': ParamValue} }
    'admin.licenses.prices.update': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}