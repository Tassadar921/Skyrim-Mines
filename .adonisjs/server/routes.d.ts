import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'simulator.index': { paramsTuple?: []; params?: {} }
    'simulator.store': { paramsTuple?: []; params?: {} }
    'simulator.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'simulator.announce': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'simulator.uploadAnnouncement': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'simulator.updateAnnouncement': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'announcementId': ParamValue} }
    'simulator.destroyAnnouncement': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'announcementId': ParamValue} }
    'simulator.nextMonth': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'simulator.respondEvent': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'simulator.advisor': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'simulator.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'password.reset.show': { paramsTuple?: []; params?: {} }
    'password.reset.update': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'profile.export': { paramsTuple?: []; params?: {} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'profile.passwordReset': { paramsTuple?: []; params?: {} }
    'profile.destroy': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'auth.login.store': { paramsTuple?: []; params?: {} }
    'forgot.password': { paramsTuple?: []; params?: {} }
    'forgot.password.store': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'register.store': { paramsTuple?: []; params?: {} }
    'email.verify': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.terms.invalidate': { paramsTuple?: []; params?: {} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'admin.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.export': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'legal.show': { paramsTuple?: []; params?: {} }
    'terms.show': { paramsTuple?: []; params?: {} }
    'terms.accept': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'simulator.index': { paramsTuple?: []; params?: {} }
    'simulator.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'password.reset.show': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'profile.export': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'forgot.password': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'email.verify': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'admin.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.export': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'legal.show': { paramsTuple?: []; params?: {} }
    'terms.show': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'simulator.index': { paramsTuple?: []; params?: {} }
    'simulator.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'password.reset.show': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'profile.export': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'forgot.password': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'email.verify': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'admin.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.export': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'legal.show': { paramsTuple?: []; params?: {} }
    'terms.show': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'simulator.store': { paramsTuple?: []; params?: {} }
    'simulator.announce': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'simulator.uploadAnnouncement': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'simulator.nextMonth': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'simulator.respondEvent': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'simulator.advisor': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'password.reset.update': { paramsTuple?: []; params?: {} }
    'profile.passwordReset': { paramsTuple?: []; params?: {} }
    'auth.login.store': { paramsTuple?: []; params?: {} }
    'forgot.password.store': { paramsTuple?: []; params?: {} }
    'register.store': { paramsTuple?: []; params?: {} }
    'admin.terms.invalidate': { paramsTuple?: []; params?: {} }
    'terms.accept': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'simulator.updateAnnouncement': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'announcementId': ParamValue} }
  }
  DELETE: {
    'simulator.destroyAnnouncement': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'announcementId': ParamValue} }
    'simulator.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.destroy': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'profile.update': { paramsTuple?: []; params?: {} }
    'admin.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}