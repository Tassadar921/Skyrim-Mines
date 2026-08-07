import router from '@adonisjs/core/services/router';
import transmit from '@adonisjs/transmit/services/main';
import { middleware } from '#start/kernel';
import { controllers } from '#generated/controllers';
import { discordAuthThrottle } from '#start/limiter';
import UserRoleEnum from '#types/enum/user_role_enum';
import OrganizationRoleEnum from '#types/enum/organization_role_enum';

transmit.registerRoutes((route) => {
    if (route.getPattern() === '__transmit/events') {
        route.middleware(middleware.auth());
    }
});

router.get('/', [controllers.Home, 'index']).as('home').use(middleware.auth());
router.get('/tarifs', [controllers.Tarifs, 'index']).as('tarifs').use(middleware.auth());
const companyOnly = middleware.admin({ roles: [UserRoleEnum.ADMIN, UserRoleEnum.AUDITOR, UserRoleEnum.STAFF] });
router.get('/stocks', [controllers.Stocks, 'index']).as('stocks').use(middleware.auth()).use(companyOnly);
router.get('/organigramme', [controllers.Organigramme, 'index']).as('organigramme').use(middleware.auth());
router.get('/devis', [controllers.Devis, 'create']).as('devis.create').use(middleware.auth());
router.post('/devis', [controllers.Devis, 'store']).as('devis.store').use(middleware.auth());
router.get('/mes-devis', [controllers.Devis, 'index']).as('devis.index').use(middleware.auth());
router.get('/devis/:id', [controllers.Devis, 'show']).as('devis.show').use(middleware.auth());
router.get('/commandes', [controllers.Commandes, 'create']).as('commandes.create').use(middleware.auth());
router.post('/commandes', [controllers.Commandes, 'store']).as('commandes.store').use(middleware.auth());
router.get('/mes-commandes', [controllers.Commandes, 'index']).as('commandes.index').use(middleware.auth());
router.get('/commandes/:id', [controllers.Commandes, 'show']).as('commandes.show').use(middleware.auth());
router.patch('/commandes/:id/cancel', [controllers.Commandes, 'cancel']).as('commandes.cancel').use(middleware.auth());
router.post('/commandes/:orderId/livraisons', [controllers.Livraisons, 'store']).as('livraisons.store').use(middleware.auth());
router.patch('/stocks/resources/:id', [controllers.Stocks, 'updateResourceQuantity']).as('stocks.resources.updateQuantity').use(middleware.auth()).use(middleware.admin());
router.patch('/stocks/materials/:id', [controllers.Stocks, 'updateMaterialQuantity']).as('stocks.materials.updateQuantity').use(middleware.auth()).use(middleware.admin());
router.post('/deposits', [controllers.Deposits, 'store']).as('deposits.store').use(middleware.auth());
router.post('/buybacks', [controllers.Buybacks, 'store']).as('buybacks.store').use(middleware.auth()).use(middleware.admin());

const organizationManage = middleware.organization({ roles: [OrganizationRoleEnum.OWNER, OrganizationRoleEnum.ADMIN] });
const organizationOwnerOnly = middleware.organization({ roles: [OrganizationRoleEnum.OWNER] });

router.get('/organization', [controllers.Organization, 'show']).as('organization.show').use(middleware.auth()).use(organizationManage);
router.post('/organization/members', [controllers.Organization, 'storeMember']).as('organization.members.store').use(middleware.auth()).use(organizationManage);
router.delete('/organization/members/:id', [controllers.Organization, 'destroyMember']).as('organization.members.destroy').use(middleware.auth()).use(organizationManage);
router.patch('/organization/members/:id/role', [controllers.Organization, 'updateMemberRole']).as('organization.members.updateRole').use(middleware.auth()).use(organizationOwnerOnly);

router.on('/login').renderInertia('auth/login', {}).as('login').use(middleware.guest());
router.get('/auth/discord/redirect', [controllers.Auth, 'discordRedirect']).as('auth.discord.redirect').use(middleware.guest()).use(discordAuthThrottle);
router.get('/auth/discord/callback', [controllers.Auth, 'discordCallback']).as('auth.discord.callback').use(discordAuthThrottle);
router.delete('/logout', [controllers.Auth, 'logout']).as('auth.logout').use(middleware.auth());

const readOnly = middleware.admin({ roles: [UserRoleEnum.ADMIN, UserRoleEnum.AUDITOR] });

router
    .group((): void => {
        router.get('/', [controllers.admin.Dashboard, 'index']).as('admin.dashboard').use(readOnly);
        router.put('/castellany-tax', [controllers.admin.Dashboard, 'updateCastellanyTax']).as('admin.dashboard.castellanyTax.update').use(middleware.admin());
        router.put('/large-order-threshold', [controllers.admin.Dashboard, 'updateLargeOrderSetting']).as('admin.dashboard.largeOrderSetting.update').use(middleware.admin());

        router.get('/users', [controllers.admin.Users, 'index']).as('admin.users.index').use(readOnly);
        router.get('/users/create', [controllers.admin.Users, 'create']).as('admin.users.create').use(middleware.admin());
        router.post('/users', [controllers.admin.Users, 'store']).as('admin.users.store').use(middleware.admin());
        router.get('/users/:id', [controllers.admin.Users, 'show']).as('admin.users.show').use(readOnly);
        router.put('/users/:id', [controllers.admin.Users, 'update']).as('admin.users.update').use(middleware.admin());
        router.put('/users/:id/balance', [controllers.admin.Users, 'updateBalance']).as('admin.users.updateBalance').use(middleware.admin());
        router.post('/users/:id/avatar', [controllers.admin.Users, 'updateAvatar']).as('admin.users.updateAvatar').use(middleware.admin());
        router.delete('/users/:id', [controllers.admin.Users, 'destroy']).as('admin.users.destroy').use(middleware.admin());

        router.get('/resources', [controllers.admin.Resources, 'index']).as('admin.resources.index').use(readOnly);
        router.get('/resources/create', [controllers.admin.Resources, 'create']).as('admin.resources.create').use(middleware.admin());
        router.post('/resources', [controllers.admin.Resources, 'store']).as('admin.resources.store').use(middleware.admin());
        router.patch('/resources/reorder', [controllers.admin.Resources, 'reorder']).as('admin.resources.reorder').use(middleware.admin());
        router.get('/resources/:id', [controllers.admin.Resources, 'show']).as('admin.resources.show').use(readOnly);
        router.put('/resources/:id', [controllers.admin.Resources, 'update']).as('admin.resources.update').use(middleware.admin());
        router.delete('/resources/:id', [controllers.admin.Resources, 'destroy']).as('admin.resources.destroy').use(middleware.admin());

        router.get('/materials', [controllers.admin.Materials, 'index']).as('admin.materials.index').use(readOnly);
        router.get('/materials/create', [controllers.admin.Materials, 'create']).as('admin.materials.create').use(middleware.admin());
        router.post('/materials', [controllers.admin.Materials, 'store']).as('admin.materials.store').use(middleware.admin());
        router.patch('/materials/reorder', [controllers.admin.Materials, 'reorder']).as('admin.materials.reorder').use(middleware.admin());
        router.get('/materials/:id', [controllers.admin.Materials, 'show']).as('admin.materials.show').use(readOnly);
        router.put('/materials/:id', [controllers.admin.Materials, 'update']).as('admin.materials.update').use(middleware.admin());
        router.delete('/materials/:id', [controllers.admin.Materials, 'destroy']).as('admin.materials.destroy').use(middleware.admin());

        router.get('/castellanies', [controllers.admin.Castellanies, 'index']).as('admin.castellanies.index').use(readOnly);
        router.get('/castellanies/create', [controllers.admin.Castellanies, 'create']).as('admin.castellanies.create').use(middleware.admin());
        router.post('/castellanies', [controllers.admin.Castellanies, 'store']).as('admin.castellanies.store').use(middleware.admin());
        router.get('/castellanies/:id', [controllers.admin.Castellanies, 'show']).as('admin.castellanies.show').use(readOnly);
        router.put('/castellanies/:id', [controllers.admin.Castellanies, 'update']).as('admin.castellanies.update').use(middleware.admin());
        router.delete('/castellanies/:id', [controllers.admin.Castellanies, 'destroy']).as('admin.castellanies.destroy').use(middleware.admin());

        router.get('/buybacks', [controllers.admin.Buybacks, 'index']).as('admin.buybacks.index').use(readOnly);

        router.get('/devis', [controllers.admin.Devis, 'index']).as('admin.devis.index').use(readOnly);

        router.get('/commandes', [controllers.admin.Commandes, 'index']).as('admin.commandes.index').use(readOnly);
        router.patch('/commandes/:id/validate', [controllers.admin.Commandes, 'validate']).as('admin.commandes.validate').use(middleware.admin());
        router.patch('/commandes/:id/cancel', [controllers.admin.Commandes, 'cancel']).as('admin.commandes.cancel').use(middleware.admin());
        router.get('/commandes/archiver', [controllers.admin.OrderArchives, 'create']).as('admin.orderArchives.create').use(middleware.admin());
        router.post('/commandes/archiver', [controllers.admin.OrderArchives, 'store']).as('admin.orderArchives.store').use(middleware.admin());

        router.get('/livraisons', [controllers.admin.Livraisons, 'index']).as('admin.livraisons.index').use(readOnly);
        router.delete('/livraisons/:id', [controllers.admin.Livraisons, 'destroy']).as('admin.livraisons.destroy').use(middleware.admin());

        router.get('/organizations', [controllers.admin.Organizations, 'index']).as('admin.organizations.index').use(readOnly);
        router.get('/organizations/create', [controllers.admin.Organizations, 'create']).as('admin.organizations.create').use(middleware.admin());
        router.post('/organizations', [controllers.admin.Organizations, 'store']).as('admin.organizations.store').use(middleware.admin());
        router.get('/organizations/:id', [controllers.admin.Organizations, 'show']).as('admin.organizations.show').use(readOnly);
        router.put('/organizations/:id', [controllers.admin.Organizations, 'update']).as('admin.organizations.update').use(middleware.admin());
        router.delete('/organizations/:id', [controllers.admin.Organizations, 'destroy']).as('admin.organizations.destroy').use(middleware.admin());
        router.post('/organizations/:id/members', [controllers.admin.Organizations, 'storeMember']).as('admin.organizations.members.store').use(middleware.admin());
        router.delete('/organizations/:id/members/:memberId', [controllers.admin.Organizations, 'destroyMember']).as('admin.organizations.members.destroy').use(middleware.admin());
        router.patch('/organizations/:id/members/:memberId/role', [controllers.admin.Organizations, 'updateMemberRole']).as('admin.organizations.members.updateRole').use(middleware.admin());
        router.put('/organizations/:id/resource-prices/:resourceId', [controllers.admin.Organizations, 'updateResourcePrice']).as('admin.organizations.resourcePrices.update').use(middleware.admin());
        router
            .delete('/organizations/:id/resource-prices/:resourceId', [controllers.admin.Organizations, 'destroyResourcePrice'])
            .as('admin.organizations.resourcePrices.destroy')
            .use(middleware.admin());

        router.get('/licenses', [controllers.admin.Licenses, 'index']).as('admin.licenses.index').use(readOnly);
        router.put('/licenses/prices', [controllers.admin.Licenses, 'updatePrices']).as('admin.licenses.prices.update').use(middleware.admin());
        router.post('/licenses/subscribers', [controllers.admin.Licenses, 'storeSubscriber']).as('admin.licenses.subscribers.store').use(middleware.admin());
        router.get('/licenses/subscribers/:id', [controllers.admin.Licenses, 'showSubscriber']).as('admin.licenses.subscribers.show').use(readOnly);
        router.delete('/licenses/subscribers/:id', [controllers.admin.Licenses, 'destroySubscriber']).as('admin.licenses.subscribers.destroy').use(middleware.admin());
        router.post('/licenses/subscribers/:id/payments', [controllers.admin.Licenses, 'storePayment']).as('admin.licenses.payments.store').use(middleware.admin());
        router.delete('/licenses/payments/:id', [controllers.admin.Licenses, 'destroyPayment']).as('admin.licenses.payments.destroy').use(middleware.admin());
    })
    .prefix('/admin')
    .use(middleware.auth());
