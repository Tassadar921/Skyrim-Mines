/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'event_stream': {
    methods: ["GET","HEAD"],
    pattern: '/__transmit/events',
    tokens: [{"old":"/__transmit/events","type":0,"val":"__transmit","end":""},{"old":"/__transmit/events","type":0,"val":"events","end":""}],
    types: placeholder as Registry['event_stream']['types'],
  },
  'subscribe': {
    methods: ["POST"],
    pattern: '/__transmit/subscribe',
    tokens: [{"old":"/__transmit/subscribe","type":0,"val":"__transmit","end":""},{"old":"/__transmit/subscribe","type":0,"val":"subscribe","end":""}],
    types: placeholder as Registry['subscribe']['types'],
  },
  'unsubscribe': {
    methods: ["POST"],
    pattern: '/__transmit/unsubscribe',
    tokens: [{"old":"/__transmit/unsubscribe","type":0,"val":"__transmit","end":""},{"old":"/__transmit/unsubscribe","type":0,"val":"unsubscribe","end":""}],
    types: placeholder as Registry['unsubscribe']['types'],
  },
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'tarifs': {
    methods: ["GET","HEAD"],
    pattern: '/tarifs',
    tokens: [{"old":"/tarifs","type":0,"val":"tarifs","end":""}],
    types: placeholder as Registry['tarifs']['types'],
  },
  'stocks': {
    methods: ["GET","HEAD"],
    pattern: '/stocks',
    tokens: [{"old":"/stocks","type":0,"val":"stocks","end":""}],
    types: placeholder as Registry['stocks']['types'],
  },
  'organigramme': {
    methods: ["GET","HEAD"],
    pattern: '/organigramme',
    tokens: [{"old":"/organigramme","type":0,"val":"organigramme","end":""}],
    types: placeholder as Registry['organigramme']['types'],
  },
  'devis.create': {
    methods: ["GET","HEAD"],
    pattern: '/devis',
    tokens: [{"old":"/devis","type":0,"val":"devis","end":""}],
    types: placeholder as Registry['devis.create']['types'],
  },
  'devis.store': {
    methods: ["POST"],
    pattern: '/devis',
    tokens: [{"old":"/devis","type":0,"val":"devis","end":""}],
    types: placeholder as Registry['devis.store']['types'],
  },
  'devis.index': {
    methods: ["GET","HEAD"],
    pattern: '/mes-devis',
    tokens: [{"old":"/mes-devis","type":0,"val":"mes-devis","end":""}],
    types: placeholder as Registry['devis.index']['types'],
  },
  'devis.show': {
    methods: ["GET","HEAD"],
    pattern: '/devis/:id',
    tokens: [{"old":"/devis/:id","type":0,"val":"devis","end":""},{"old":"/devis/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['devis.show']['types'],
  },
  'commandes.create': {
    methods: ["GET","HEAD"],
    pattern: '/commandes',
    tokens: [{"old":"/commandes","type":0,"val":"commandes","end":""}],
    types: placeholder as Registry['commandes.create']['types'],
  },
  'commandes.store': {
    methods: ["POST"],
    pattern: '/commandes',
    tokens: [{"old":"/commandes","type":0,"val":"commandes","end":""}],
    types: placeholder as Registry['commandes.store']['types'],
  },
  'commandes.index': {
    methods: ["GET","HEAD"],
    pattern: '/mes-commandes',
    tokens: [{"old":"/mes-commandes","type":0,"val":"mes-commandes","end":""}],
    types: placeholder as Registry['commandes.index']['types'],
  },
  'commandes.show': {
    methods: ["GET","HEAD"],
    pattern: '/commandes/:id',
    tokens: [{"old":"/commandes/:id","type":0,"val":"commandes","end":""},{"old":"/commandes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['commandes.show']['types'],
  },
  'commandes.cancel': {
    methods: ["PATCH"],
    pattern: '/commandes/:id/cancel',
    tokens: [{"old":"/commandes/:id/cancel","type":0,"val":"commandes","end":""},{"old":"/commandes/:id/cancel","type":1,"val":"id","end":""},{"old":"/commandes/:id/cancel","type":0,"val":"cancel","end":""}],
    types: placeholder as Registry['commandes.cancel']['types'],
  },
  'livraisons.store': {
    methods: ["POST"],
    pattern: '/commandes/:orderId/livraisons',
    tokens: [{"old":"/commandes/:orderId/livraisons","type":0,"val":"commandes","end":""},{"old":"/commandes/:orderId/livraisons","type":1,"val":"orderId","end":""},{"old":"/commandes/:orderId/livraisons","type":0,"val":"livraisons","end":""}],
    types: placeholder as Registry['livraisons.store']['types'],
  },
  'stocks.resources.updateQuantity': {
    methods: ["PATCH"],
    pattern: '/stocks/resources/:id',
    tokens: [{"old":"/stocks/resources/:id","type":0,"val":"stocks","end":""},{"old":"/stocks/resources/:id","type":0,"val":"resources","end":""},{"old":"/stocks/resources/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['stocks.resources.updateQuantity']['types'],
  },
  'stocks.materials.updateQuantity': {
    methods: ["PATCH"],
    pattern: '/stocks/materials/:id',
    tokens: [{"old":"/stocks/materials/:id","type":0,"val":"stocks","end":""},{"old":"/stocks/materials/:id","type":0,"val":"materials","end":""},{"old":"/stocks/materials/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['stocks.materials.updateQuantity']['types'],
  },
  'deposits.store': {
    methods: ["POST"],
    pattern: '/deposits',
    tokens: [{"old":"/deposits","type":0,"val":"deposits","end":""}],
    types: placeholder as Registry['deposits.store']['types'],
  },
  'buybacks.store': {
    methods: ["POST"],
    pattern: '/buybacks',
    tokens: [{"old":"/buybacks","type":0,"val":"buybacks","end":""}],
    types: placeholder as Registry['buybacks.store']['types'],
  },
  'organization.show': {
    methods: ["GET","HEAD"],
    pattern: '/organization',
    tokens: [{"old":"/organization","type":0,"val":"organization","end":""}],
    types: placeholder as Registry['organization.show']['types'],
  },
  'organization.members.store': {
    methods: ["POST"],
    pattern: '/organization/members',
    tokens: [{"old":"/organization/members","type":0,"val":"organization","end":""},{"old":"/organization/members","type":0,"val":"members","end":""}],
    types: placeholder as Registry['organization.members.store']['types'],
  },
  'organization.members.destroy': {
    methods: ["DELETE"],
    pattern: '/organization/members/:id',
    tokens: [{"old":"/organization/members/:id","type":0,"val":"organization","end":""},{"old":"/organization/members/:id","type":0,"val":"members","end":""},{"old":"/organization/members/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['organization.members.destroy']['types'],
  },
  'organization.members.updateRole': {
    methods: ["PATCH"],
    pattern: '/organization/members/:id/role',
    tokens: [{"old":"/organization/members/:id/role","type":0,"val":"organization","end":""},{"old":"/organization/members/:id/role","type":0,"val":"members","end":""},{"old":"/organization/members/:id/role","type":1,"val":"id","end":""},{"old":"/organization/members/:id/role","type":0,"val":"role","end":""}],
    types: placeholder as Registry['organization.members.updateRole']['types'],
  },
  'login': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['login']['types'],
  },
  'auth.discord.redirect': {
    methods: ["GET","HEAD"],
    pattern: '/auth/discord/redirect',
    tokens: [{"old":"/auth/discord/redirect","type":0,"val":"auth","end":""},{"old":"/auth/discord/redirect","type":0,"val":"discord","end":""},{"old":"/auth/discord/redirect","type":0,"val":"redirect","end":""}],
    types: placeholder as Registry['auth.discord.redirect']['types'],
  },
  'auth.discord.callback': {
    methods: ["GET","HEAD"],
    pattern: '/auth/discord/callback',
    tokens: [{"old":"/auth/discord/callback","type":0,"val":"auth","end":""},{"old":"/auth/discord/callback","type":0,"val":"discord","end":""},{"old":"/auth/discord/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['auth.discord.callback']['types'],
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
  'admin.users.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/users',
    tokens: [{"old":"/admin/users","type":0,"val":"admin","end":""},{"old":"/admin/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['admin.users.index']['types'],
  },
  'admin.users.create': {
    methods: ["GET","HEAD"],
    pattern: '/admin/users/create',
    tokens: [{"old":"/admin/users/create","type":0,"val":"admin","end":""},{"old":"/admin/users/create","type":0,"val":"users","end":""},{"old":"/admin/users/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['admin.users.create']['types'],
  },
  'admin.users.store': {
    methods: ["POST"],
    pattern: '/admin/users',
    tokens: [{"old":"/admin/users","type":0,"val":"admin","end":""},{"old":"/admin/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['admin.users.store']['types'],
  },
  'admin.users.show': {
    methods: ["GET","HEAD"],
    pattern: '/admin/users/:id',
    tokens: [{"old":"/admin/users/:id","type":0,"val":"admin","end":""},{"old":"/admin/users/:id","type":0,"val":"users","end":""},{"old":"/admin/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.users.show']['types'],
  },
  'admin.users.update': {
    methods: ["PUT"],
    pattern: '/admin/users/:id',
    tokens: [{"old":"/admin/users/:id","type":0,"val":"admin","end":""},{"old":"/admin/users/:id","type":0,"val":"users","end":""},{"old":"/admin/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.users.update']['types'],
  },
  'admin.users.updateAvatar': {
    methods: ["POST"],
    pattern: '/admin/users/:id/avatar',
    tokens: [{"old":"/admin/users/:id/avatar","type":0,"val":"admin","end":""},{"old":"/admin/users/:id/avatar","type":0,"val":"users","end":""},{"old":"/admin/users/:id/avatar","type":1,"val":"id","end":""},{"old":"/admin/users/:id/avatar","type":0,"val":"avatar","end":""}],
    types: placeholder as Registry['admin.users.updateAvatar']['types'],
  },
  'admin.resources.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/resources',
    tokens: [{"old":"/admin/resources","type":0,"val":"admin","end":""},{"old":"/admin/resources","type":0,"val":"resources","end":""}],
    types: placeholder as Registry['admin.resources.index']['types'],
  },
  'admin.resources.create': {
    methods: ["GET","HEAD"],
    pattern: '/admin/resources/create',
    tokens: [{"old":"/admin/resources/create","type":0,"val":"admin","end":""},{"old":"/admin/resources/create","type":0,"val":"resources","end":""},{"old":"/admin/resources/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['admin.resources.create']['types'],
  },
  'admin.resources.store': {
    methods: ["POST"],
    pattern: '/admin/resources',
    tokens: [{"old":"/admin/resources","type":0,"val":"admin","end":""},{"old":"/admin/resources","type":0,"val":"resources","end":""}],
    types: placeholder as Registry['admin.resources.store']['types'],
  },
  'admin.resources.reorder': {
    methods: ["PATCH"],
    pattern: '/admin/resources/reorder',
    tokens: [{"old":"/admin/resources/reorder","type":0,"val":"admin","end":""},{"old":"/admin/resources/reorder","type":0,"val":"resources","end":""},{"old":"/admin/resources/reorder","type":0,"val":"reorder","end":""}],
    types: placeholder as Registry['admin.resources.reorder']['types'],
  },
  'admin.resources.show': {
    methods: ["GET","HEAD"],
    pattern: '/admin/resources/:id',
    tokens: [{"old":"/admin/resources/:id","type":0,"val":"admin","end":""},{"old":"/admin/resources/:id","type":0,"val":"resources","end":""},{"old":"/admin/resources/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.resources.show']['types'],
  },
  'admin.resources.update': {
    methods: ["PUT"],
    pattern: '/admin/resources/:id',
    tokens: [{"old":"/admin/resources/:id","type":0,"val":"admin","end":""},{"old":"/admin/resources/:id","type":0,"val":"resources","end":""},{"old":"/admin/resources/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.resources.update']['types'],
  },
  'admin.resources.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/resources/:id',
    tokens: [{"old":"/admin/resources/:id","type":0,"val":"admin","end":""},{"old":"/admin/resources/:id","type":0,"val":"resources","end":""},{"old":"/admin/resources/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.resources.destroy']['types'],
  },
  'admin.materials.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/materials',
    tokens: [{"old":"/admin/materials","type":0,"val":"admin","end":""},{"old":"/admin/materials","type":0,"val":"materials","end":""}],
    types: placeholder as Registry['admin.materials.index']['types'],
  },
  'admin.materials.create': {
    methods: ["GET","HEAD"],
    pattern: '/admin/materials/create',
    tokens: [{"old":"/admin/materials/create","type":0,"val":"admin","end":""},{"old":"/admin/materials/create","type":0,"val":"materials","end":""},{"old":"/admin/materials/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['admin.materials.create']['types'],
  },
  'admin.materials.store': {
    methods: ["POST"],
    pattern: '/admin/materials',
    tokens: [{"old":"/admin/materials","type":0,"val":"admin","end":""},{"old":"/admin/materials","type":0,"val":"materials","end":""}],
    types: placeholder as Registry['admin.materials.store']['types'],
  },
  'admin.materials.reorder': {
    methods: ["PATCH"],
    pattern: '/admin/materials/reorder',
    tokens: [{"old":"/admin/materials/reorder","type":0,"val":"admin","end":""},{"old":"/admin/materials/reorder","type":0,"val":"materials","end":""},{"old":"/admin/materials/reorder","type":0,"val":"reorder","end":""}],
    types: placeholder as Registry['admin.materials.reorder']['types'],
  },
  'admin.materials.show': {
    methods: ["GET","HEAD"],
    pattern: '/admin/materials/:id',
    tokens: [{"old":"/admin/materials/:id","type":0,"val":"admin","end":""},{"old":"/admin/materials/:id","type":0,"val":"materials","end":""},{"old":"/admin/materials/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.materials.show']['types'],
  },
  'admin.materials.update': {
    methods: ["PUT"],
    pattern: '/admin/materials/:id',
    tokens: [{"old":"/admin/materials/:id","type":0,"val":"admin","end":""},{"old":"/admin/materials/:id","type":0,"val":"materials","end":""},{"old":"/admin/materials/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.materials.update']['types'],
  },
  'admin.materials.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/materials/:id',
    tokens: [{"old":"/admin/materials/:id","type":0,"val":"admin","end":""},{"old":"/admin/materials/:id","type":0,"val":"materials","end":""},{"old":"/admin/materials/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.materials.destroy']['types'],
  },
  'admin.buybacks.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/buybacks',
    tokens: [{"old":"/admin/buybacks","type":0,"val":"admin","end":""},{"old":"/admin/buybacks","type":0,"val":"buybacks","end":""}],
    types: placeholder as Registry['admin.buybacks.index']['types'],
  },
  'admin.devis.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/devis',
    tokens: [{"old":"/admin/devis","type":0,"val":"admin","end":""},{"old":"/admin/devis","type":0,"val":"devis","end":""}],
    types: placeholder as Registry['admin.devis.index']['types'],
  },
  'admin.commandes.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/commandes',
    tokens: [{"old":"/admin/commandes","type":0,"val":"admin","end":""},{"old":"/admin/commandes","type":0,"val":"commandes","end":""}],
    types: placeholder as Registry['admin.commandes.index']['types'],
  },
  'admin.commandes.validate': {
    methods: ["PATCH"],
    pattern: '/admin/commandes/:id/validate',
    tokens: [{"old":"/admin/commandes/:id/validate","type":0,"val":"admin","end":""},{"old":"/admin/commandes/:id/validate","type":0,"val":"commandes","end":""},{"old":"/admin/commandes/:id/validate","type":1,"val":"id","end":""},{"old":"/admin/commandes/:id/validate","type":0,"val":"validate","end":""}],
    types: placeholder as Registry['admin.commandes.validate']['types'],
  },
  'admin.commandes.cancel': {
    methods: ["PATCH"],
    pattern: '/admin/commandes/:id/cancel',
    tokens: [{"old":"/admin/commandes/:id/cancel","type":0,"val":"admin","end":""},{"old":"/admin/commandes/:id/cancel","type":0,"val":"commandes","end":""},{"old":"/admin/commandes/:id/cancel","type":1,"val":"id","end":""},{"old":"/admin/commandes/:id/cancel","type":0,"val":"cancel","end":""}],
    types: placeholder as Registry['admin.commandes.cancel']['types'],
  },
  'admin.livraisons.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/livraisons',
    tokens: [{"old":"/admin/livraisons","type":0,"val":"admin","end":""},{"old":"/admin/livraisons","type":0,"val":"livraisons","end":""}],
    types: placeholder as Registry['admin.livraisons.index']['types'],
  },
  'admin.livraisons.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/livraisons/:id',
    tokens: [{"old":"/admin/livraisons/:id","type":0,"val":"admin","end":""},{"old":"/admin/livraisons/:id","type":0,"val":"livraisons","end":""},{"old":"/admin/livraisons/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.livraisons.destroy']['types'],
  },
  'admin.organizations.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/organizations',
    tokens: [{"old":"/admin/organizations","type":0,"val":"admin","end":""},{"old":"/admin/organizations","type":0,"val":"organizations","end":""}],
    types: placeholder as Registry['admin.organizations.index']['types'],
  },
  'admin.organizations.create': {
    methods: ["GET","HEAD"],
    pattern: '/admin/organizations/create',
    tokens: [{"old":"/admin/organizations/create","type":0,"val":"admin","end":""},{"old":"/admin/organizations/create","type":0,"val":"organizations","end":""},{"old":"/admin/organizations/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['admin.organizations.create']['types'],
  },
  'admin.organizations.store': {
    methods: ["POST"],
    pattern: '/admin/organizations',
    tokens: [{"old":"/admin/organizations","type":0,"val":"admin","end":""},{"old":"/admin/organizations","type":0,"val":"organizations","end":""}],
    types: placeholder as Registry['admin.organizations.store']['types'],
  },
  'admin.organizations.show': {
    methods: ["GET","HEAD"],
    pattern: '/admin/organizations/:id',
    tokens: [{"old":"/admin/organizations/:id","type":0,"val":"admin","end":""},{"old":"/admin/organizations/:id","type":0,"val":"organizations","end":""},{"old":"/admin/organizations/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.organizations.show']['types'],
  },
  'admin.organizations.update': {
    methods: ["PUT"],
    pattern: '/admin/organizations/:id',
    tokens: [{"old":"/admin/organizations/:id","type":0,"val":"admin","end":""},{"old":"/admin/organizations/:id","type":0,"val":"organizations","end":""},{"old":"/admin/organizations/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.organizations.update']['types'],
  },
  'admin.organizations.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/organizations/:id',
    tokens: [{"old":"/admin/organizations/:id","type":0,"val":"admin","end":""},{"old":"/admin/organizations/:id","type":0,"val":"organizations","end":""},{"old":"/admin/organizations/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.organizations.destroy']['types'],
  },
  'admin.organizations.members.store': {
    methods: ["POST"],
    pattern: '/admin/organizations/:id/members',
    tokens: [{"old":"/admin/organizations/:id/members","type":0,"val":"admin","end":""},{"old":"/admin/organizations/:id/members","type":0,"val":"organizations","end":""},{"old":"/admin/organizations/:id/members","type":1,"val":"id","end":""},{"old":"/admin/organizations/:id/members","type":0,"val":"members","end":""}],
    types: placeholder as Registry['admin.organizations.members.store']['types'],
  },
  'admin.organizations.members.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/organizations/:id/members/:memberId',
    tokens: [{"old":"/admin/organizations/:id/members/:memberId","type":0,"val":"admin","end":""},{"old":"/admin/organizations/:id/members/:memberId","type":0,"val":"organizations","end":""},{"old":"/admin/organizations/:id/members/:memberId","type":1,"val":"id","end":""},{"old":"/admin/organizations/:id/members/:memberId","type":0,"val":"members","end":""},{"old":"/admin/organizations/:id/members/:memberId","type":1,"val":"memberId","end":""}],
    types: placeholder as Registry['admin.organizations.members.destroy']['types'],
  },
  'admin.organizations.members.updateRole': {
    methods: ["PATCH"],
    pattern: '/admin/organizations/:id/members/:memberId/role',
    tokens: [{"old":"/admin/organizations/:id/members/:memberId/role","type":0,"val":"admin","end":""},{"old":"/admin/organizations/:id/members/:memberId/role","type":0,"val":"organizations","end":""},{"old":"/admin/organizations/:id/members/:memberId/role","type":1,"val":"id","end":""},{"old":"/admin/organizations/:id/members/:memberId/role","type":0,"val":"members","end":""},{"old":"/admin/organizations/:id/members/:memberId/role","type":1,"val":"memberId","end":""},{"old":"/admin/organizations/:id/members/:memberId/role","type":0,"val":"role","end":""}],
    types: placeholder as Registry['admin.organizations.members.updateRole']['types'],
  },
  'admin.organizations.resourcePrices.update': {
    methods: ["PUT"],
    pattern: '/admin/organizations/:id/resource-prices/:resourceId',
    tokens: [{"old":"/admin/organizations/:id/resource-prices/:resourceId","type":0,"val":"admin","end":""},{"old":"/admin/organizations/:id/resource-prices/:resourceId","type":0,"val":"organizations","end":""},{"old":"/admin/organizations/:id/resource-prices/:resourceId","type":1,"val":"id","end":""},{"old":"/admin/organizations/:id/resource-prices/:resourceId","type":0,"val":"resource-prices","end":""},{"old":"/admin/organizations/:id/resource-prices/:resourceId","type":1,"val":"resourceId","end":""}],
    types: placeholder as Registry['admin.organizations.resourcePrices.update']['types'],
  },
  'admin.organizations.resourcePrices.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/organizations/:id/resource-prices/:resourceId',
    tokens: [{"old":"/admin/organizations/:id/resource-prices/:resourceId","type":0,"val":"admin","end":""},{"old":"/admin/organizations/:id/resource-prices/:resourceId","type":0,"val":"organizations","end":""},{"old":"/admin/organizations/:id/resource-prices/:resourceId","type":1,"val":"id","end":""},{"old":"/admin/organizations/:id/resource-prices/:resourceId","type":0,"val":"resource-prices","end":""},{"old":"/admin/organizations/:id/resource-prices/:resourceId","type":1,"val":"resourceId","end":""}],
    types: placeholder as Registry['admin.organizations.resourcePrices.destroy']['types'],
  },
  'admin.licenses.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/licenses',
    tokens: [{"old":"/admin/licenses","type":0,"val":"admin","end":""},{"old":"/admin/licenses","type":0,"val":"licenses","end":""}],
    types: placeholder as Registry['admin.licenses.index']['types'],
  },
  'admin.licenses.prices.update': {
    methods: ["PUT"],
    pattern: '/admin/licenses/prices',
    tokens: [{"old":"/admin/licenses/prices","type":0,"val":"admin","end":""},{"old":"/admin/licenses/prices","type":0,"val":"licenses","end":""},{"old":"/admin/licenses/prices","type":0,"val":"prices","end":""}],
    types: placeholder as Registry['admin.licenses.prices.update']['types'],
  },
  'admin.licenses.subscribers.store': {
    methods: ["POST"],
    pattern: '/admin/licenses/subscribers',
    tokens: [{"old":"/admin/licenses/subscribers","type":0,"val":"admin","end":""},{"old":"/admin/licenses/subscribers","type":0,"val":"licenses","end":""},{"old":"/admin/licenses/subscribers","type":0,"val":"subscribers","end":""}],
    types: placeholder as Registry['admin.licenses.subscribers.store']['types'],
  },
  'admin.licenses.subscribers.show': {
    methods: ["GET","HEAD"],
    pattern: '/admin/licenses/subscribers/:id',
    tokens: [{"old":"/admin/licenses/subscribers/:id","type":0,"val":"admin","end":""},{"old":"/admin/licenses/subscribers/:id","type":0,"val":"licenses","end":""},{"old":"/admin/licenses/subscribers/:id","type":0,"val":"subscribers","end":""},{"old":"/admin/licenses/subscribers/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.licenses.subscribers.show']['types'],
  },
  'admin.licenses.subscribers.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/licenses/subscribers/:id',
    tokens: [{"old":"/admin/licenses/subscribers/:id","type":0,"val":"admin","end":""},{"old":"/admin/licenses/subscribers/:id","type":0,"val":"licenses","end":""},{"old":"/admin/licenses/subscribers/:id","type":0,"val":"subscribers","end":""},{"old":"/admin/licenses/subscribers/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.licenses.subscribers.destroy']['types'],
  },
  'admin.licenses.payments.store': {
    methods: ["POST"],
    pattern: '/admin/licenses/subscribers/:id/payments',
    tokens: [{"old":"/admin/licenses/subscribers/:id/payments","type":0,"val":"admin","end":""},{"old":"/admin/licenses/subscribers/:id/payments","type":0,"val":"licenses","end":""},{"old":"/admin/licenses/subscribers/:id/payments","type":0,"val":"subscribers","end":""},{"old":"/admin/licenses/subscribers/:id/payments","type":1,"val":"id","end":""},{"old":"/admin/licenses/subscribers/:id/payments","type":0,"val":"payments","end":""}],
    types: placeholder as Registry['admin.licenses.payments.store']['types'],
  },
  'admin.licenses.payments.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/licenses/payments/:id',
    tokens: [{"old":"/admin/licenses/payments/:id","type":0,"val":"admin","end":""},{"old":"/admin/licenses/payments/:id","type":0,"val":"licenses","end":""},{"old":"/admin/licenses/payments/:id","type":0,"val":"payments","end":""},{"old":"/admin/licenses/payments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.licenses.payments.destroy']['types'],
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
