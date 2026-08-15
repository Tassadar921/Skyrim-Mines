/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'event_stream': {
    methods: ["GET","HEAD"]
    pattern: '/__transmit/events'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'subscribe': {
    methods: ["POST"]
    pattern: '/__transmit/subscribe'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'unsubscribe': {
    methods: ["POST"]
    pattern: '/__transmit/unsubscribe'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/home_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/home_controller').default['index']>>>
    }
  }
  'tarifs': {
    methods: ["GET","HEAD"]
    pattern: '/tarifs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tarifs_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tarifs_controller').default['index']>>>
    }
  }
  'stocks': {
    methods: ["GET","HEAD"]
    pattern: '/stocks'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stocks_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stocks_controller').default['index']>>>
    }
  }
  'organigramme': {
    methods: ["GET","HEAD"]
    pattern: '/organigramme'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organigramme_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organigramme_controller').default['index']>>>
    }
  }
  'devis.create': {
    methods: ["GET","HEAD"]
    pattern: '/devis'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/devis_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/devis_controller').default['create']>>>
    }
  }
  'devis.store': {
    methods: ["POST"]
    pattern: '/devis'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/quotes').createQuoteValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/quotes').createQuoteValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/devis_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/devis_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'devis.index': {
    methods: ["GET","HEAD"]
    pattern: '/mes-devis'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/devis_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/devis_controller').default['index']>>>
    }
  }
  'devis.show': {
    methods: ["GET","HEAD"]
    pattern: '/devis/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/devis_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/devis_controller').default['show']>>>
    }
  }
  'commandes.create': {
    methods: ["GET","HEAD"]
    pattern: '/commandes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/commandes_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/commandes_controller').default['create']>>>
    }
  }
  'commandes.store': {
    methods: ["POST"]
    pattern: '/commandes'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/orders').createOrderValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/orders').createOrderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/commandes_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/commandes_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'commandes.index': {
    methods: ["GET","HEAD"]
    pattern: '/mes-commandes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/commandes_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/commandes_controller').default['index']>>>
    }
  }
  'commandes.show': {
    methods: ["GET","HEAD"]
    pattern: '/commandes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/commandes_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/commandes_controller').default['show']>>>
    }
  }
  'commandes.cancel': {
    methods: ["PATCH"]
    pattern: '/commandes/:id/cancel'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/commandes_controller').default['cancel']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/commandes_controller').default['cancel']>>>
    }
  }
  'livraisons.store': {
    methods: ["POST"]
    pattern: '/commandes/:orderId/livraisons'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/deliveries').createDeliveryValidator)>>
      paramsTuple: [ParamValue]
      params: { orderId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/deliveries').createDeliveryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/livraisons_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/livraisons_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'stocks.resources.updateQuantity': {
    methods: ["PATCH"]
    pattern: '/stocks/resources/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/stocks').updateResourceStockQuantityValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/stocks').updateResourceStockQuantityValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stocks_controller').default['updateResourceQuantity']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stocks_controller').default['updateResourceQuantity']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'stocks.materials.updateQuantity': {
    methods: ["PATCH"]
    pattern: '/stocks/materials/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/stocks').updateMaterialStockQuantityValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/stocks').updateMaterialStockQuantityValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/stocks_controller').default['updateMaterialQuantity']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/stocks_controller').default['updateMaterialQuantity']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'deposits.store': {
    methods: ["POST"]
    pattern: '/deposits'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/deposits').createDepositValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/deposits').createDepositValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/deposits_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/deposits_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'deposits.update': {
    methods: ["PATCH"]
    pattern: '/deposits/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/deposits').updateDepositValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/deposits').updateDepositValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/deposits_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/deposits_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'buybacks.store': {
    methods: ["POST"]
    pattern: '/buybacks'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/buybacks').createBuybackValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/buybacks').createBuybackValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/buybacks_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/buybacks_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'pickaxes.take': {
    methods: ["POST"]
    pattern: '/pickaxes/take'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pickaxes_controller').default['take']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pickaxes_controller').default['take']>>>
    }
  }
  'pickaxes.deposit': {
    methods: ["POST"]
    pattern: '/pickaxes/deposit'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pickaxes_controller').default['deposit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pickaxes_controller').default['deposit']>>>
    }
  }
  'organization.show': {
    methods: ["GET","HEAD"]
    pattern: '/organization'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['show']>>>
    }
  }
  'organization.members.store': {
    methods: ["POST"]
    pattern: '/organization/members'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/organization').storeOrganizationMemberValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/organization').storeOrganizationMemberValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['storeMember']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['storeMember']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'organization.members.destroy': {
    methods: ["DELETE"]
    pattern: '/organization/members/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['destroyMember']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['destroyMember']>>>
    }
  }
  'organization.members.updateRole': {
    methods: ["PATCH"]
    pattern: '/organization/members/:id/role'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/organization').updateOrganizationMemberRoleValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/organization').updateOrganizationMemberRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['updateMemberRole']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organization_controller').default['updateMemberRole']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'login': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'auth.discord.redirect': {
    methods: ["GET","HEAD"]
    pattern: '/auth/discord/redirect'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['discordRedirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['discordRedirect']>>>
    }
  }
  'auth.discord.callback': {
    methods: ["GET","HEAD"]
    pattern: '/auth/discord/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['discordCallback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['discordCallback']>>>
    }
  }
  'auth.logout': {
    methods: ["DELETE"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
    }
  }
  'admin.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/admin'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/dashboard_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/dashboard_controller').default['index']>>>
    }
  }
  'admin.dashboard.castellanyTax.update': {
    methods: ["PUT"]
    pattern: '/admin/castellany-tax'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/castellany_tax').updateCastellanyTaxValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/castellany_tax').updateCastellanyTaxValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/dashboard_controller').default['updateCastellanyTax']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/dashboard_controller').default['updateCastellanyTax']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.dashboard.largeOrderSetting.update': {
    methods: ["PUT"]
    pattern: '/admin/large-order-threshold'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/large_order_setting').updateLargeOrderSettingValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/large_order_setting').updateLargeOrderSettingValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/dashboard_controller').default['updateLargeOrderSetting']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/dashboard_controller').default['updateLargeOrderSetting']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.dashboard.capitalSnapshot.store': {
    methods: ["POST"]
    pattern: '/admin/capital-snapshot'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/company_capital_snapshot').storeCompanyCapitalSnapshotValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/company_capital_snapshot').storeCompanyCapitalSnapshotValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/dashboard_controller').default['storeCapitalSnapshot']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/dashboard_controller').default['storeCapitalSnapshot']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.users.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin/users').indexUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.users.create': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['create']>>>
    }
  }
  'admin.users.store': {
    methods: ["POST"]
    pattern: '/admin/users'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/users').createUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/users').createUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.users.show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['show']>>>
    }
  }
  'admin.users.update': {
    methods: ["PUT"]
    pattern: '/admin/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/users').updateUserValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/users').updateUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.users.updateBalance': {
    methods: ["PUT"]
    pattern: '/admin/users/:id/balance'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/users').updateUserBalanceValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/users').updateUserBalanceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['updateBalance']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['updateBalance']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.users.updateAvatar': {
    methods: ["POST"]
    pattern: '/admin/users/:id/avatar'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/users').updateUserAvatarValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/users').updateUserAvatarValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['updateAvatar']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['updateAvatar']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.users.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['destroy']>>>
    }
  }
  'admin.resources.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/resources'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin/resources').indexResourceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/resources_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/resources_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.resources.create': {
    methods: ["GET","HEAD"]
    pattern: '/admin/resources/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/resources_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/resources_controller').default['create']>>>
    }
  }
  'admin.resources.store': {
    methods: ["POST"]
    pattern: '/admin/resources'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/resources').createResourceValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/resources').createResourceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/resources_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/resources_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.resources.reorder': {
    methods: ["PATCH"]
    pattern: '/admin/resources/reorder'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/resources').reorderResourcesValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/resources').reorderResourcesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/resources_controller').default['reorder']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/resources_controller').default['reorder']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.resources.show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/resources/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/resources_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/resources_controller').default['show']>>>
    }
  }
  'admin.resources.update': {
    methods: ["PUT"]
    pattern: '/admin/resources/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/resources').updateResourceValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/resources').updateResourceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/resources_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/resources_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.resources.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/resources/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/resources_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/resources_controller').default['destroy']>>>
    }
  }
  'admin.materials.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/materials'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin/materials').indexMaterialValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/materials_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/materials_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.materials.create': {
    methods: ["GET","HEAD"]
    pattern: '/admin/materials/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/materials_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/materials_controller').default['create']>>>
    }
  }
  'admin.materials.store': {
    methods: ["POST"]
    pattern: '/admin/materials'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/materials').createMaterialValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/materials').createMaterialValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/materials_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/materials_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.materials.reorder': {
    methods: ["PATCH"]
    pattern: '/admin/materials/reorder'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/materials').reorderMaterialsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/materials').reorderMaterialsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/materials_controller').default['reorder']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/materials_controller').default['reorder']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.materials.show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/materials/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/materials_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/materials_controller').default['show']>>>
    }
  }
  'admin.materials.update': {
    methods: ["PUT"]
    pattern: '/admin/materials/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/materials').updateMaterialValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/materials').updateMaterialValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/materials_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/materials_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.materials.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/materials/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/materials_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/materials_controller').default['destroy']>>>
    }
  }
  'admin.castellanies.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/castellanies'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin/castellanies').indexCastellanyValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/castellanies_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/castellanies_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.castellanies.create': {
    methods: ["GET","HEAD"]
    pattern: '/admin/castellanies/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/castellanies_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/castellanies_controller').default['create']>>>
    }
  }
  'admin.castellanies.store': {
    methods: ["POST"]
    pattern: '/admin/castellanies'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/castellanies').createCastellanyValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/castellanies').createCastellanyValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/castellanies_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/castellanies_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.castellanies.show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/castellanies/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/castellanies_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/castellanies_controller').default['show']>>>
    }
  }
  'admin.castellanies.update': {
    methods: ["PUT"]
    pattern: '/admin/castellanies/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/castellanies').updateCastellanyValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/castellanies').updateCastellanyValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/castellanies_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/castellanies_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.castellanies.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/castellanies/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/castellanies_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/castellanies_controller').default['destroy']>>>
    }
  }
  'admin.buybacks.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/buybacks'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin/buybacks').indexBuybackValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/buybacks_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/buybacks_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.devis.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/devis'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin/quotes').indexQuoteValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/devis_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/devis_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.commandes.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/commandes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin/orders').indexOrderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/commandes_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/commandes_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.commandes.validate': {
    methods: ["PATCH"]
    pattern: '/admin/commandes/:id/validate'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/commandes_controller').default['validate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/commandes_controller').default['validate']>>>
    }
  }
  'admin.commandes.cancel': {
    methods: ["PATCH"]
    pattern: '/admin/commandes/:id/cancel'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/commandes_controller').default['cancel']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/commandes_controller').default['cancel']>>>
    }
  }
  'admin.orderArchives.create': {
    methods: ["GET","HEAD"]
    pattern: '/admin/commandes/archiver'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/order_archives_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/order_archives_controller').default['create']>>>
    }
  }
  'admin.orderArchives.store': {
    methods: ["POST"]
    pattern: '/admin/commandes/archiver'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/order_archives').createOrderArchiveValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/order_archives').createOrderArchiveValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/order_archives_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/order_archives_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.livraisons.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/livraisons'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin/deliveries').indexDeliveryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/livraisons_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/livraisons_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.livraisons.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/livraisons/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/livraisons_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/livraisons_controller').default['destroy']>>>
    }
  }
  'admin.tonneau.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/tonneau'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin/tonneau').indexTonneauValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/tonneau_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/tonneau_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.tonneau.update': {
    methods: ["PATCH"]
    pattern: '/admin/tonneau'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/tonneau').updateBarrelQuantityValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/tonneau').updateBarrelQuantityValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/tonneau_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/tonneau_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.organizations.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/organizations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin/organizations').indexOrganizationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.organizations.create': {
    methods: ["GET","HEAD"]
    pattern: '/admin/organizations/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['create']>>>
    }
  }
  'admin.organizations.store': {
    methods: ["POST"]
    pattern: '/admin/organizations'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/organizations').createOrganizationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/organizations').createOrganizationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.organizations.show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/organizations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['show']>>>
    }
  }
  'admin.organizations.update': {
    methods: ["PUT"]
    pattern: '/admin/organizations/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/organizations').updateOrganizationValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/organizations').updateOrganizationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.organizations.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/organizations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['destroy']>>>
    }
  }
  'admin.organizations.members.store': {
    methods: ["POST"]
    pattern: '/admin/organizations/:id/members'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/organizations').storeOrganizationMemberValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/organizations').storeOrganizationMemberValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['storeMember']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['storeMember']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.organizations.members.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/organizations/:id/members/:memberId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; memberId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['destroyMember']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['destroyMember']>>>
    }
  }
  'admin.organizations.members.updateRole': {
    methods: ["PATCH"]
    pattern: '/admin/organizations/:id/members/:memberId/role'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/organizations').updateOrganizationMemberRoleValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; memberId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/organizations').updateOrganizationMemberRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['updateMemberRole']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['updateMemberRole']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.organizations.resourcePrices.update': {
    methods: ["PUT"]
    pattern: '/admin/organizations/:id/resource-prices/:resourceId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/organization_resource_prices').upsertOrganizationResourcePriceValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; resourceId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/organization_resource_prices').upsertOrganizationResourcePriceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['updateResourcePrice']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['updateResourcePrice']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.organizations.resourcePrices.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/organizations/:id/resource-prices/:resourceId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; resourceId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['destroyResourcePrice']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/organizations_controller').default['destroyResourcePrice']>>>
    }
  }
  'admin.licenses.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/licenses'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin/license_subscribers').indexLicenseSubscriberValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/licenses_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/licenses_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.licenses.prices.update': {
    methods: ["PUT"]
    pattern: '/admin/licenses/prices'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/license_prices').updateLicensePricesValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/license_prices').updateLicensePricesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/licenses_controller').default['updatePrices']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/licenses_controller').default['updatePrices']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.licenses.subscribers.store': {
    methods: ["POST"]
    pattern: '/admin/licenses/subscribers'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/license_subscribers').storeLicenseSubscriberValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/license_subscribers').storeLicenseSubscriberValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/licenses_controller').default['storeSubscriber']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/licenses_controller').default['storeSubscriber']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.licenses.subscribers.show': {
    methods: ["GET","HEAD"]
    pattern: '/admin/licenses/subscribers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/licenses_controller').default['showSubscriber']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/licenses_controller').default['showSubscriber']>>>
    }
  }
  'admin.licenses.subscribers.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/licenses/subscribers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/licenses_controller').default['destroySubscriber']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/licenses_controller').default['destroySubscriber']>>>
    }
  }
  'admin.licenses.payments.store': {
    methods: ["POST"]
    pattern: '/admin/licenses/subscribers/:id/payments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/license_payments').storeLicensePaymentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/license_payments').storeLicensePaymentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/licenses_controller').default['storePayment']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/licenses_controller').default['storePayment']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.licenses.payments.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/licenses/payments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/licenses_controller').default['destroyPayment']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/licenses_controller').default['destroyPayment']>>>
    }
  }
}
