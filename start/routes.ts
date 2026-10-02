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
router.post('/commandes/:orderId/livraisons', [controllers.Livraisons, 'store']).as('livraisons.store').use(middleware.auth());
router.post('/deposits', [controllers.Deposits, 'store']).as('deposits.store').use(middleware.auth());
router.patch('/deposits/:id', [controllers.Deposits, 'update']).as('deposits.update').use(middleware.auth());
router
    .post('/buybacks', [controllers.Buybacks, 'store'])
    .as('buybacks.store')
    .use(middleware.auth())
    .use(middleware.admin({ roles: [UserRoleEnum.ADMIN, UserRoleEnum.FOREMAN] }));

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

// Read-only sections the new "foreman" role (contremaître) does NOT get: resources, materials,
// castellanies, barrel (tonneau breakdown), buybacks history, site settings.
const readOnly = middleware.admin({ roles: [UserRoleEnum.ADMIN, UserRoleEnum.AUDITOR] });

// Sections the foreman DOES get, with full read/write access (same level as admin) — dashboard,
// users, organizations, stocks, barrel rentals, expenses, commandes, livraisons.
const foremanAccess = middleware.admin({ roles: [UserRoleEnum.ADMIN, UserRoleEnum.AUDITOR, UserRoleEnum.FOREMAN] });
const foremanManage = middleware.admin({ roles: [UserRoleEnum.ADMIN, UserRoleEnum.FOREMAN] });

router
    .group((): void => {
        router.get('/', [controllers.admin.Dashboard, 'index']).as('admin.dashboard').use(foremanAccess);
        router.put('/castellany-tax', [controllers.admin.Dashboard, 'updateCastellanyTax']).as('admin.dashboard.castellanyTax.update').use(foremanManage);
        router.post('/capital-snapshot', [controllers.admin.Dashboard, 'storeCapitalSnapshot']).as('admin.dashboard.capitalSnapshot.store').use(foremanManage);

        router.get('/site-settings', [controllers.admin.SiteSettings, 'index']).as('admin.siteSettings.index').use(readOnly);
        router.post('/site-settings/logo', [controllers.admin.SiteSettings, 'updateLogo']).as('admin.siteSettings.updateLogo').use(middleware.admin());
        router.delete('/site-settings/logo', [controllers.admin.SiteSettings, 'destroyLogo']).as('admin.siteSettings.destroyLogo').use(middleware.admin());
        router.put('/site-settings/subtitle', [controllers.admin.SiteSettings, 'updateSubtitle']).as('admin.siteSettings.updateSubtitle').use(middleware.admin());
        router.put('/site-settings/tax-system', [controllers.admin.SiteSettings, 'updateTaxSystem']).as('admin.siteSettings.updateTaxSystem').use(middleware.admin());

        router.put('/tax-brackets', [controllers.admin.Dashboard, 'updateTaxBrackets']).as('admin.dashboard.taxBrackets.update').use(foremanManage);
        router.put('/tax-tiers', [controllers.admin.Dashboard, 'updateTaxTiers']).as('admin.dashboard.taxTiers.update').use(foremanManage);

        router.get('/users', [controllers.admin.Users, 'index']).as('admin.users.index').use(foremanAccess);
        router.get('/users/create', [controllers.admin.Users, 'create']).as('admin.users.create').use(foremanManage);
        router.post('/users', [controllers.admin.Users, 'store']).as('admin.users.store').use(foremanManage);
        router.get('/users/:id', [controllers.admin.Users, 'show']).as('admin.users.show').use(foremanAccess);
        router.put('/users/:id', [controllers.admin.Users, 'update']).as('admin.users.update').use(foremanManage);
        router.put('/users/:id/balance', [controllers.admin.Users, 'updateBalance']).as('admin.users.updateBalance').use(foremanManage);
        router.post('/users/:id/avatar', [controllers.admin.Users, 'updateAvatar']).as('admin.users.updateAvatar').use(foremanManage);
        router.delete('/users/:id', [controllers.admin.Users, 'destroy']).as('admin.users.destroy').use(foremanManage);

        router.get('/resources', [controllers.admin.Resources, 'index']).as('admin.resources.index').use(readOnly);
        router.get('/resources/create', [controllers.admin.Resources, 'create']).as('admin.resources.create').use(middleware.admin());
        router.post('/resources', [controllers.admin.Resources, 'store']).as('admin.resources.store').use(middleware.admin());
        router.patch('/resources/reorder', [controllers.admin.Resources, 'reorder']).as('admin.resources.reorder').use(middleware.admin());
        router.get('/resources/:id', [controllers.admin.Resources, 'show']).as('admin.resources.show').use(readOnly);
        router.put('/resources/:id', [controllers.admin.Resources, 'update']).as('admin.resources.update').use(middleware.admin());
        router.delete('/resources/:id', [controllers.admin.Resources, 'destroy']).as('admin.resources.destroy').use(middleware.admin());

        router.get('/resources/:id/recipe', [controllers.admin.ResourceRecipes, 'edit']).as('admin.resources.recipe.edit').use(readOnly);
        router.put('/resources/:id/recipe', [controllers.admin.ResourceRecipes, 'update']).as('admin.resources.recipe.update').use(middleware.admin());

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

        router.get('/stocks', [controllers.admin.Stocks, 'index']).as('admin.stocks.index').use(foremanAccess);
        router.patch('/stocks', [controllers.admin.Stocks, 'update']).as('admin.stocks.update').use(foremanManage);
        router.patch('/stocks/:resourceId/barrel', [controllers.admin.Stocks, 'updateBarrelTotal']).as('admin.stocks.barrel.update').use(foremanManage);

        router.get('/buybacks', [controllers.admin.Buybacks, 'index']).as('admin.buybacks.index').use(readOnly);

        router.get('/expenses', [controllers.admin.CompanyExpenses, 'index']).as('admin.expenses.index').use(foremanAccess);
        router.post('/expenses', [controllers.admin.CompanyExpenses, 'store']).as('admin.expenses.store').use(foremanManage);
        router.delete('/expenses/:id', [controllers.admin.CompanyExpenses, 'destroy']).as('admin.expenses.destroy').use(foremanManage);

        router.get('/commandes', [controllers.admin.Commandes, 'index']).as('admin.commandes.index').use(foremanAccess);
        router.patch('/commandes/:id/validate', [controllers.admin.Commandes, 'validate']).as('admin.commandes.validate').use(foremanManage);
        router.patch('/commandes/:id/cancel', [controllers.admin.Commandes, 'cancel']).as('admin.commandes.cancel').use(foremanManage);
        router.get('/commandes/archiver', [controllers.admin.OrderArchives, 'create']).as('admin.orderArchives.create').use(foremanManage);
        router.post('/commandes/archiver', [controllers.admin.OrderArchives, 'store']).as('admin.orderArchives.store').use(foremanManage);

        router.get('/livraisons', [controllers.admin.Livraisons, 'index']).as('admin.livraisons.index').use(foremanAccess);
        router.delete('/livraisons/:id', [controllers.admin.Livraisons, 'destroy']).as('admin.livraisons.destroy').use(foremanManage);
        router.patch('/livraisons/:id/deduct-stock', [controllers.admin.Livraisons, 'deductStock']).as('admin.livraisons.deductStock').use(foremanManage);
        router.post('/livraisons/deduct-stock-all', [controllers.admin.Livraisons, 'deductStockAll']).as('admin.livraisons.deductStockAll').use(foremanManage);

        router.get('/barrel', [controllers.admin.Barrel, 'index']).as('admin.barrel.index').use(readOnly);
        router.patch('/barrel', [controllers.admin.Barrel, 'update']).as('admin.barrel.update').use(middleware.admin());

        router.get('/barrel-rentals', [controllers.admin.BarrelRentals, 'index']).as('admin.barrelRentals.index').use(foremanAccess);
        router.post('/barrel-rentals', [controllers.admin.BarrelRentals, 'store']).as('admin.barrelRentals.store').use(foremanManage);
        router.get('/barrel-rentals/:id', [controllers.admin.BarrelRentals, 'show']).as('admin.barrelRentals.show').use(foremanAccess);
        router.put('/barrel-rentals/:id', [controllers.admin.BarrelRentals, 'update']).as('admin.barrelRentals.update').use(foremanManage);
        router.delete('/barrel-rentals/:id', [controllers.admin.BarrelRentals, 'destroy']).as('admin.barrelRentals.destroy').use(foremanManage);
        router.post('/barrel-rentals/:id/payments', [controllers.admin.BarrelRentals, 'storePayment']).as('admin.barrelRentals.payments.store').use(foremanManage);
        router.delete('/barrel-rentals/payments/:id', [controllers.admin.BarrelRentals, 'destroyPayment']).as('admin.barrelRentals.payments.destroy').use(foremanManage);

        router.get('/organizations', [controllers.admin.Organizations, 'index']).as('admin.organizations.index').use(foremanAccess);
        router.get('/organizations/create', [controllers.admin.Organizations, 'create']).as('admin.organizations.create').use(foremanManage);
        router.post('/organizations', [controllers.admin.Organizations, 'store']).as('admin.organizations.store').use(foremanManage);
        router.get('/organizations/:id', [controllers.admin.Organizations, 'show']).as('admin.organizations.show').use(foremanAccess);
        router.put('/organizations/:id', [controllers.admin.Organizations, 'update']).as('admin.organizations.update').use(foremanManage);
        router.delete('/organizations/:id', [controllers.admin.Organizations, 'destroy']).as('admin.organizations.destroy').use(foremanManage);
        router.post('/organizations/:id/members', [controllers.admin.Organizations, 'storeMember']).as('admin.organizations.members.store').use(foremanManage);
        router.delete('/organizations/:id/members/:memberId', [controllers.admin.Organizations, 'destroyMember']).as('admin.organizations.members.destroy').use(foremanManage);
        router.patch('/organizations/:id/members/:memberId/role', [controllers.admin.Organizations, 'updateMemberRole']).as('admin.organizations.members.updateRole').use(foremanManage);
        router.put('/organizations/:id/resource-prices/:resourceId', [controllers.admin.Organizations, 'updateResourcePrice']).as('admin.organizations.resourcePrices.update').use(foremanManage);
        router.delete('/organizations/:id/resource-prices/:resourceId', [controllers.admin.Organizations, 'destroyResourcePrice']).as('admin.organizations.resourcePrices.destroy').use(foremanManage);
    })
    .prefix('/admin')
    .use(middleware.auth());
