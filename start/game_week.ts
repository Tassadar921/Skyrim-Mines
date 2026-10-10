/*
|--------------------------------------------------------------------------
| Game week file
|--------------------------------------------------------------------------
|
| Hydrates the in-memory "week 1 start" override (app/helpers/game_week_helper.ts)
| from the site_settings table at boot, so an admin-configured date survives
| server restarts without every call site needing to hit the database.
|
*/

import SiteSettingRepository from '#repositories/site_setting_repository';

await new SiteSettingRepository().hydrateWeekOneStart();
