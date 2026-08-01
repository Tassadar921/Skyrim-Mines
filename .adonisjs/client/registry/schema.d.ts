/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'simulator.index': {
    methods: ["GET","HEAD"]
    pattern: '/simulation'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['index']>>>
    }
  }
  'simulator.store': {
    methods: ["POST"]
    pattern: '/simulation'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/simulator').createSimulationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/simulator').createSimulationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'simulator.show': {
    methods: ["GET","HEAD"]
    pattern: '/simulation/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['show']>>>
    }
  }
  'simulator.announce': {
    methods: ["POST"]
    pattern: '/simulation/:id/announce'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/simulator').announceValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/simulator').announceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['announce']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['announce']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'simulator.uploadAnnouncement': {
    methods: ["POST"]
    pattern: '/simulation/:id/upload'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['uploadAnnouncement']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['uploadAnnouncement']>>>
    }
  }
  'simulator.updateAnnouncement': {
    methods: ["PATCH"]
    pattern: '/simulation/:id/announcements/:announcementId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/simulator').announceValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; announcementId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/simulator').announceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['updateAnnouncement']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['updateAnnouncement']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'simulator.destroyAnnouncement': {
    methods: ["DELETE"]
    pattern: '/simulation/:id/announcements/:announcementId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; announcementId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['destroyAnnouncement']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['destroyAnnouncement']>>>
    }
  }
  'simulator.nextMonth': {
    methods: ["POST"]
    pattern: '/simulation/:id/next-month'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['nextMonth']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['nextMonth']>>>
    }
  }
  'simulator.respondEvent': {
    methods: ["POST"]
    pattern: '/simulation/:id/respond-event'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/simulator').respondEventValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/simulator').respondEventValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['respondEvent']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['respondEvent']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'simulator.advisor': {
    methods: ["POST"]
    pattern: '/simulation/:id/advisor'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['advisor']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['advisor']>>>
    }
  }
  'simulator.destroy': {
    methods: ["DELETE"]
    pattern: '/simulation/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/simulator_controller').default['destroy']>>>
    }
  }
  'password.reset.show': {
    methods: ["GET","HEAD"]
    pattern: '/password-reset'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/token').tokenValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'password.reset.update': {
    methods: ["POST"]
    pattern: '/password-reset'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/token').tokenValidator)>|InferInput<(typeof import('#validators/password_reset').resetPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/token').tokenValidator)>|InferInput<(typeof import('#validators/password_reset').resetPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'profile.export': {
    methods: ["GET","HEAD"]
    pattern: '/profile/export'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['exportData']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['exportData']>>>
    }
  }
  'profile.update': {
    methods: ["PUT"]
    pattern: '/profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/profile').updateProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/profile').updateProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.passwordReset': {
    methods: ["POST"]
    pattern: '/profile/password-reset'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['sendPasswordReset']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['sendPasswordReset']>>>
    }
  }
  'profile.destroy': {
    methods: ["DELETE"]
    pattern: '/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['destroy']>>>
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
  'auth.login.store': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['login']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'forgot.password': {
    methods: ["GET","HEAD"]
    pattern: '/forgot-password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/forgot_password_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/forgot_password_controller').default['show']>>>
    }
  }
  'forgot.password.store': {
    methods: ["POST"]
    pattern: '/forgot-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth').forgotPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth').forgotPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/forgot_password_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/forgot_password_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'register': {
    methods: ["GET","HEAD"]
    pattern: '/register'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/register_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/register_controller').default['show']>>>
    }
  }
  'register.store': {
    methods: ["POST"]
    pattern: '/register'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/register').registerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/register').registerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/register_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/register_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'email.verify': {
    methods: ["GET","HEAD"]
    pattern: '/email-verify'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/token').tokenValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/email_verification_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/email_verification_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
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
  'admin.terms.invalidate': {
    methods: ["POST"]
    pattern: '/admin/terms/invalidate'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/dashboard').invalidateTermsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/dashboard').invalidateTermsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/dashboard_controller').default['invalidateTerms']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/dashboard_controller').default['invalidateTerms']>>> | { status: 422; response: { errors: SimpleError[] } }
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
  'admin.users.export': {
    methods: ["GET","HEAD"]
    pattern: '/admin/users/:id/export'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['exportData']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['exportData']>>>
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
  'legal.show': {
    methods: ["GET","HEAD"]
    pattern: '/legal'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/legal_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/legal_controller').default['show']>>>
    }
  }
  'terms.show': {
    methods: ["GET","HEAD"]
    pattern: '/terms'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/terms_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/terms_controller').default['show']>>>
    }
  }
  'terms.accept': {
    methods: ["POST"]
    pattern: '/terms/accept'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/terms_controller').default['accept']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/terms_controller').default['accept']>>>
    }
  }
}
