import type { Registry } from './schema.d.ts';
import type { ApiDefinition } from './tree.d.ts';
declare const routes: {
    readonly home: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/";
        readonly tokens: [{
            readonly old: "/";
            readonly type: 0;
            readonly val: "/";
            readonly end: "";
        }];
        readonly types: Registry["home"]["types"];
    };
    readonly 'simulator.index': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/simulation";
        readonly tokens: [{
            readonly old: "/simulation";
            readonly type: 0;
            readonly val: "simulation";
            readonly end: "";
        }];
        readonly types: Registry["simulator.index"]["types"];
    };
    readonly 'simulator.store': {
        readonly methods: ["POST"];
        readonly pattern: "/simulation";
        readonly tokens: [{
            readonly old: "/simulation";
            readonly type: 0;
            readonly val: "simulation";
            readonly end: "";
        }];
        readonly types: Registry["simulator.store"]["types"];
    };
    readonly 'simulator.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/simulation/:id";
        readonly tokens: [{
            readonly old: "/simulation/:id";
            readonly type: 0;
            readonly val: "simulation";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["simulator.show"]["types"];
    };
    readonly 'simulator.announce': {
        readonly methods: ["POST"];
        readonly pattern: "/simulation/:id/announce";
        readonly tokens: [{
            readonly old: "/simulation/:id/announce";
            readonly type: 0;
            readonly val: "simulation";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/announce";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/announce";
            readonly type: 0;
            readonly val: "announce";
            readonly end: "";
        }];
        readonly types: Registry["simulator.announce"]["types"];
    };
    readonly 'simulator.uploadAnnouncement': {
        readonly methods: ["POST"];
        readonly pattern: "/simulation/:id/upload";
        readonly tokens: [{
            readonly old: "/simulation/:id/upload";
            readonly type: 0;
            readonly val: "simulation";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/upload";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/upload";
            readonly type: 0;
            readonly val: "upload";
            readonly end: "";
        }];
        readonly types: Registry["simulator.uploadAnnouncement"]["types"];
    };
    readonly 'simulator.updateAnnouncement': {
        readonly methods: ["PATCH"];
        readonly pattern: "/simulation/:id/announcements/:announcementId";
        readonly tokens: [{
            readonly old: "/simulation/:id/announcements/:announcementId";
            readonly type: 0;
            readonly val: "simulation";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/announcements/:announcementId";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/announcements/:announcementId";
            readonly type: 0;
            readonly val: "announcements";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/announcements/:announcementId";
            readonly type: 1;
            readonly val: "announcementId";
            readonly end: "";
        }];
        readonly types: Registry["simulator.updateAnnouncement"]["types"];
    };
    readonly 'simulator.destroyAnnouncement': {
        readonly methods: ["DELETE"];
        readonly pattern: "/simulation/:id/announcements/:announcementId";
        readonly tokens: [{
            readonly old: "/simulation/:id/announcements/:announcementId";
            readonly type: 0;
            readonly val: "simulation";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/announcements/:announcementId";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/announcements/:announcementId";
            readonly type: 0;
            readonly val: "announcements";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/announcements/:announcementId";
            readonly type: 1;
            readonly val: "announcementId";
            readonly end: "";
        }];
        readonly types: Registry["simulator.destroyAnnouncement"]["types"];
    };
    readonly 'simulator.nextMonth': {
        readonly methods: ["POST"];
        readonly pattern: "/simulation/:id/next-month";
        readonly tokens: [{
            readonly old: "/simulation/:id/next-month";
            readonly type: 0;
            readonly val: "simulation";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/next-month";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/next-month";
            readonly type: 0;
            readonly val: "next-month";
            readonly end: "";
        }];
        readonly types: Registry["simulator.nextMonth"]["types"];
    };
    readonly 'simulator.respondEvent': {
        readonly methods: ["POST"];
        readonly pattern: "/simulation/:id/respond-event";
        readonly tokens: [{
            readonly old: "/simulation/:id/respond-event";
            readonly type: 0;
            readonly val: "simulation";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/respond-event";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/respond-event";
            readonly type: 0;
            readonly val: "respond-event";
            readonly end: "";
        }];
        readonly types: Registry["simulator.respondEvent"]["types"];
    };
    readonly 'simulator.advisor': {
        readonly methods: ["POST"];
        readonly pattern: "/simulation/:id/advisor";
        readonly tokens: [{
            readonly old: "/simulation/:id/advisor";
            readonly type: 0;
            readonly val: "simulation";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/advisor";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id/advisor";
            readonly type: 0;
            readonly val: "advisor";
            readonly end: "";
        }];
        readonly types: Registry["simulator.advisor"]["types"];
    };
    readonly 'simulator.destroy': {
        readonly methods: ["DELETE"];
        readonly pattern: "/simulation/:id";
        readonly tokens: [{
            readonly old: "/simulation/:id";
            readonly type: 0;
            readonly val: "simulation";
            readonly end: "";
        }, {
            readonly old: "/simulation/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["simulator.destroy"]["types"];
    };
    readonly 'password.reset.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/password-reset";
        readonly tokens: [{
            readonly old: "/password-reset";
            readonly type: 0;
            readonly val: "password-reset";
            readonly end: "";
        }];
        readonly types: Registry["password.reset.show"]["types"];
    };
    readonly 'password.reset.update': {
        readonly methods: ["POST"];
        readonly pattern: "/password-reset";
        readonly tokens: [{
            readonly old: "/password-reset";
            readonly type: 0;
            readonly val: "password-reset";
            readonly end: "";
        }];
        readonly types: Registry["password.reset.update"]["types"];
    };
    readonly 'profile.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/profile";
        readonly tokens: [{
            readonly old: "/profile";
            readonly type: 0;
            readonly val: "profile";
            readonly end: "";
        }];
        readonly types: Registry["profile.show"]["types"];
    };
    readonly 'profile.export': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/profile/export";
        readonly tokens: [{
            readonly old: "/profile/export";
            readonly type: 0;
            readonly val: "profile";
            readonly end: "";
        }, {
            readonly old: "/profile/export";
            readonly type: 0;
            readonly val: "export";
            readonly end: "";
        }];
        readonly types: Registry["profile.export"]["types"];
    };
    readonly 'profile.update': {
        readonly methods: ["PUT"];
        readonly pattern: "/profile";
        readonly tokens: [{
            readonly old: "/profile";
            readonly type: 0;
            readonly val: "profile";
            readonly end: "";
        }];
        readonly types: Registry["profile.update"]["types"];
    };
    readonly 'profile.passwordReset': {
        readonly methods: ["POST"];
        readonly pattern: "/profile/password-reset";
        readonly tokens: [{
            readonly old: "/profile/password-reset";
            readonly type: 0;
            readonly val: "profile";
            readonly end: "";
        }, {
            readonly old: "/profile/password-reset";
            readonly type: 0;
            readonly val: "password-reset";
            readonly end: "";
        }];
        readonly types: Registry["profile.passwordReset"]["types"];
    };
    readonly 'profile.destroy': {
        readonly methods: ["DELETE"];
        readonly pattern: "/profile";
        readonly tokens: [{
            readonly old: "/profile";
            readonly type: 0;
            readonly val: "profile";
            readonly end: "";
        }];
        readonly types: Registry["profile.destroy"]["types"];
    };
    readonly login: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/login";
        readonly tokens: [{
            readonly old: "/login";
            readonly type: 0;
            readonly val: "login";
            readonly end: "";
        }];
        readonly types: Registry["login"]["types"];
    };
    readonly 'auth.login.store': {
        readonly methods: ["POST"];
        readonly pattern: "/login";
        readonly tokens: [{
            readonly old: "/login";
            readonly type: 0;
            readonly val: "login";
            readonly end: "";
        }];
        readonly types: Registry["auth.login.store"]["types"];
    };
    readonly 'forgot.password': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/forgot-password";
        readonly tokens: [{
            readonly old: "/forgot-password";
            readonly type: 0;
            readonly val: "forgot-password";
            readonly end: "";
        }];
        readonly types: Registry["forgot.password"]["types"];
    };
    readonly 'forgot.password.store': {
        readonly methods: ["POST"];
        readonly pattern: "/forgot-password";
        readonly tokens: [{
            readonly old: "/forgot-password";
            readonly type: 0;
            readonly val: "forgot-password";
            readonly end: "";
        }];
        readonly types: Registry["forgot.password.store"]["types"];
    };
    readonly register: {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/register";
        readonly tokens: [{
            readonly old: "/register";
            readonly type: 0;
            readonly val: "register";
            readonly end: "";
        }];
        readonly types: Registry["register"]["types"];
    };
    readonly 'register.store': {
        readonly methods: ["POST"];
        readonly pattern: "/register";
        readonly tokens: [{
            readonly old: "/register";
            readonly type: 0;
            readonly val: "register";
            readonly end: "";
        }];
        readonly types: Registry["register.store"]["types"];
    };
    readonly 'email.verify': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/email-verify";
        readonly tokens: [{
            readonly old: "/email-verify";
            readonly type: 0;
            readonly val: "email-verify";
            readonly end: "";
        }];
        readonly types: Registry["email.verify"]["types"];
    };
    readonly 'auth.logout': {
        readonly methods: ["DELETE"];
        readonly pattern: "/logout";
        readonly tokens: [{
            readonly old: "/logout";
            readonly type: 0;
            readonly val: "logout";
            readonly end: "";
        }];
        readonly types: Registry["auth.logout"]["types"];
    };
    readonly 'admin.dashboard': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/admin";
        readonly tokens: [{
            readonly old: "/admin";
            readonly type: 0;
            readonly val: "admin";
            readonly end: "";
        }];
        readonly types: Registry["admin.dashboard"]["types"];
    };
    readonly 'admin.terms.invalidate': {
        readonly methods: ["POST"];
        readonly pattern: "/admin/terms/invalidate";
        readonly tokens: [{
            readonly old: "/admin/terms/invalidate";
            readonly type: 0;
            readonly val: "admin";
            readonly end: "";
        }, {
            readonly old: "/admin/terms/invalidate";
            readonly type: 0;
            readonly val: "terms";
            readonly end: "";
        }, {
            readonly old: "/admin/terms/invalidate";
            readonly type: 0;
            readonly val: "invalidate";
            readonly end: "";
        }];
        readonly types: Registry["admin.terms.invalidate"]["types"];
    };
    readonly 'admin.users.index': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/admin/users";
        readonly tokens: [{
            readonly old: "/admin/users";
            readonly type: 0;
            readonly val: "admin";
            readonly end: "";
        }, {
            readonly old: "/admin/users";
            readonly type: 0;
            readonly val: "users";
            readonly end: "";
        }];
        readonly types: Registry["admin.users.index"]["types"];
    };
    readonly 'admin.users.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/admin/users/:id";
        readonly tokens: [{
            readonly old: "/admin/users/:id";
            readonly type: 0;
            readonly val: "admin";
            readonly end: "";
        }, {
            readonly old: "/admin/users/:id";
            readonly type: 0;
            readonly val: "users";
            readonly end: "";
        }, {
            readonly old: "/admin/users/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["admin.users.show"]["types"];
    };
    readonly 'admin.users.export': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/admin/users/:id/export";
        readonly tokens: [{
            readonly old: "/admin/users/:id/export";
            readonly type: 0;
            readonly val: "admin";
            readonly end: "";
        }, {
            readonly old: "/admin/users/:id/export";
            readonly type: 0;
            readonly val: "users";
            readonly end: "";
        }, {
            readonly old: "/admin/users/:id/export";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }, {
            readonly old: "/admin/users/:id/export";
            readonly type: 0;
            readonly val: "export";
            readonly end: "";
        }];
        readonly types: Registry["admin.users.export"]["types"];
    };
    readonly 'admin.users.update': {
        readonly methods: ["PUT"];
        readonly pattern: "/admin/users/:id";
        readonly tokens: [{
            readonly old: "/admin/users/:id";
            readonly type: 0;
            readonly val: "admin";
            readonly end: "";
        }, {
            readonly old: "/admin/users/:id";
            readonly type: 0;
            readonly val: "users";
            readonly end: "";
        }, {
            readonly old: "/admin/users/:id";
            readonly type: 1;
            readonly val: "id";
            readonly end: "";
        }];
        readonly types: Registry["admin.users.update"]["types"];
    };
    readonly 'legal.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/legal";
        readonly tokens: [{
            readonly old: "/legal";
            readonly type: 0;
            readonly val: "legal";
            readonly end: "";
        }];
        readonly types: Registry["legal.show"]["types"];
    };
    readonly 'terms.show': {
        readonly methods: ["GET", "HEAD"];
        readonly pattern: "/terms";
        readonly tokens: [{
            readonly old: "/terms";
            readonly type: 0;
            readonly val: "terms";
            readonly end: "";
        }];
        readonly types: Registry["terms.show"]["types"];
    };
    readonly 'terms.accept': {
        readonly methods: ["POST"];
        readonly pattern: "/terms/accept";
        readonly tokens: [{
            readonly old: "/terms/accept";
            readonly type: 0;
            readonly val: "terms";
            readonly end: "";
        }, {
            readonly old: "/terms/accept";
            readonly type: 0;
            readonly val: "accept";
            readonly end: "";
        }];
        readonly types: Registry["terms.accept"]["types"];
    };
};
export { routes };
export declare const registry: {
    routes: {
        readonly home: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/";
            readonly tokens: [{
                readonly old: "/";
                readonly type: 0;
                readonly val: "/";
                readonly end: "";
            }];
            readonly types: Registry["home"]["types"];
        };
        readonly 'simulator.index': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/simulation";
            readonly tokens: [{
                readonly old: "/simulation";
                readonly type: 0;
                readonly val: "simulation";
                readonly end: "";
            }];
            readonly types: Registry["simulator.index"]["types"];
        };
        readonly 'simulator.store': {
            readonly methods: ["POST"];
            readonly pattern: "/simulation";
            readonly tokens: [{
                readonly old: "/simulation";
                readonly type: 0;
                readonly val: "simulation";
                readonly end: "";
            }];
            readonly types: Registry["simulator.store"]["types"];
        };
        readonly 'simulator.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/simulation/:id";
            readonly tokens: [{
                readonly old: "/simulation/:id";
                readonly type: 0;
                readonly val: "simulation";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["simulator.show"]["types"];
        };
        readonly 'simulator.announce': {
            readonly methods: ["POST"];
            readonly pattern: "/simulation/:id/announce";
            readonly tokens: [{
                readonly old: "/simulation/:id/announce";
                readonly type: 0;
                readonly val: "simulation";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/announce";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/announce";
                readonly type: 0;
                readonly val: "announce";
                readonly end: "";
            }];
            readonly types: Registry["simulator.announce"]["types"];
        };
        readonly 'simulator.uploadAnnouncement': {
            readonly methods: ["POST"];
            readonly pattern: "/simulation/:id/upload";
            readonly tokens: [{
                readonly old: "/simulation/:id/upload";
                readonly type: 0;
                readonly val: "simulation";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/upload";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/upload";
                readonly type: 0;
                readonly val: "upload";
                readonly end: "";
            }];
            readonly types: Registry["simulator.uploadAnnouncement"]["types"];
        };
        readonly 'simulator.updateAnnouncement': {
            readonly methods: ["PATCH"];
            readonly pattern: "/simulation/:id/announcements/:announcementId";
            readonly tokens: [{
                readonly old: "/simulation/:id/announcements/:announcementId";
                readonly type: 0;
                readonly val: "simulation";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/announcements/:announcementId";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/announcements/:announcementId";
                readonly type: 0;
                readonly val: "announcements";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/announcements/:announcementId";
                readonly type: 1;
                readonly val: "announcementId";
                readonly end: "";
            }];
            readonly types: Registry["simulator.updateAnnouncement"]["types"];
        };
        readonly 'simulator.destroyAnnouncement': {
            readonly methods: ["DELETE"];
            readonly pattern: "/simulation/:id/announcements/:announcementId";
            readonly tokens: [{
                readonly old: "/simulation/:id/announcements/:announcementId";
                readonly type: 0;
                readonly val: "simulation";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/announcements/:announcementId";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/announcements/:announcementId";
                readonly type: 0;
                readonly val: "announcements";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/announcements/:announcementId";
                readonly type: 1;
                readonly val: "announcementId";
                readonly end: "";
            }];
            readonly types: Registry["simulator.destroyAnnouncement"]["types"];
        };
        readonly 'simulator.nextMonth': {
            readonly methods: ["POST"];
            readonly pattern: "/simulation/:id/next-month";
            readonly tokens: [{
                readonly old: "/simulation/:id/next-month";
                readonly type: 0;
                readonly val: "simulation";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/next-month";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/next-month";
                readonly type: 0;
                readonly val: "next-month";
                readonly end: "";
            }];
            readonly types: Registry["simulator.nextMonth"]["types"];
        };
        readonly 'simulator.respondEvent': {
            readonly methods: ["POST"];
            readonly pattern: "/simulation/:id/respond-event";
            readonly tokens: [{
                readonly old: "/simulation/:id/respond-event";
                readonly type: 0;
                readonly val: "simulation";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/respond-event";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/respond-event";
                readonly type: 0;
                readonly val: "respond-event";
                readonly end: "";
            }];
            readonly types: Registry["simulator.respondEvent"]["types"];
        };
        readonly 'simulator.advisor': {
            readonly methods: ["POST"];
            readonly pattern: "/simulation/:id/advisor";
            readonly tokens: [{
                readonly old: "/simulation/:id/advisor";
                readonly type: 0;
                readonly val: "simulation";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/advisor";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id/advisor";
                readonly type: 0;
                readonly val: "advisor";
                readonly end: "";
            }];
            readonly types: Registry["simulator.advisor"]["types"];
        };
        readonly 'simulator.destroy': {
            readonly methods: ["DELETE"];
            readonly pattern: "/simulation/:id";
            readonly tokens: [{
                readonly old: "/simulation/:id";
                readonly type: 0;
                readonly val: "simulation";
                readonly end: "";
            }, {
                readonly old: "/simulation/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["simulator.destroy"]["types"];
        };
        readonly 'password.reset.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/password-reset";
            readonly tokens: [{
                readonly old: "/password-reset";
                readonly type: 0;
                readonly val: "password-reset";
                readonly end: "";
            }];
            readonly types: Registry["password.reset.show"]["types"];
        };
        readonly 'password.reset.update': {
            readonly methods: ["POST"];
            readonly pattern: "/password-reset";
            readonly tokens: [{
                readonly old: "/password-reset";
                readonly type: 0;
                readonly val: "password-reset";
                readonly end: "";
            }];
            readonly types: Registry["password.reset.update"]["types"];
        };
        readonly 'profile.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/profile";
            readonly tokens: [{
                readonly old: "/profile";
                readonly type: 0;
                readonly val: "profile";
                readonly end: "";
            }];
            readonly types: Registry["profile.show"]["types"];
        };
        readonly 'profile.export': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/profile/export";
            readonly tokens: [{
                readonly old: "/profile/export";
                readonly type: 0;
                readonly val: "profile";
                readonly end: "";
            }, {
                readonly old: "/profile/export";
                readonly type: 0;
                readonly val: "export";
                readonly end: "";
            }];
            readonly types: Registry["profile.export"]["types"];
        };
        readonly 'profile.update': {
            readonly methods: ["PUT"];
            readonly pattern: "/profile";
            readonly tokens: [{
                readonly old: "/profile";
                readonly type: 0;
                readonly val: "profile";
                readonly end: "";
            }];
            readonly types: Registry["profile.update"]["types"];
        };
        readonly 'profile.passwordReset': {
            readonly methods: ["POST"];
            readonly pattern: "/profile/password-reset";
            readonly tokens: [{
                readonly old: "/profile/password-reset";
                readonly type: 0;
                readonly val: "profile";
                readonly end: "";
            }, {
                readonly old: "/profile/password-reset";
                readonly type: 0;
                readonly val: "password-reset";
                readonly end: "";
            }];
            readonly types: Registry["profile.passwordReset"]["types"];
        };
        readonly 'profile.destroy': {
            readonly methods: ["DELETE"];
            readonly pattern: "/profile";
            readonly tokens: [{
                readonly old: "/profile";
                readonly type: 0;
                readonly val: "profile";
                readonly end: "";
            }];
            readonly types: Registry["profile.destroy"]["types"];
        };
        readonly login: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/login";
            readonly tokens: [{
                readonly old: "/login";
                readonly type: 0;
                readonly val: "login";
                readonly end: "";
            }];
            readonly types: Registry["login"]["types"];
        };
        readonly 'auth.login.store': {
            readonly methods: ["POST"];
            readonly pattern: "/login";
            readonly tokens: [{
                readonly old: "/login";
                readonly type: 0;
                readonly val: "login";
                readonly end: "";
            }];
            readonly types: Registry["auth.login.store"]["types"];
        };
        readonly 'forgot.password': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/forgot-password";
            readonly tokens: [{
                readonly old: "/forgot-password";
                readonly type: 0;
                readonly val: "forgot-password";
                readonly end: "";
            }];
            readonly types: Registry["forgot.password"]["types"];
        };
        readonly 'forgot.password.store': {
            readonly methods: ["POST"];
            readonly pattern: "/forgot-password";
            readonly tokens: [{
                readonly old: "/forgot-password";
                readonly type: 0;
                readonly val: "forgot-password";
                readonly end: "";
            }];
            readonly types: Registry["forgot.password.store"]["types"];
        };
        readonly register: {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/register";
            readonly tokens: [{
                readonly old: "/register";
                readonly type: 0;
                readonly val: "register";
                readonly end: "";
            }];
            readonly types: Registry["register"]["types"];
        };
        readonly 'register.store': {
            readonly methods: ["POST"];
            readonly pattern: "/register";
            readonly tokens: [{
                readonly old: "/register";
                readonly type: 0;
                readonly val: "register";
                readonly end: "";
            }];
            readonly types: Registry["register.store"]["types"];
        };
        readonly 'email.verify': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/email-verify";
            readonly tokens: [{
                readonly old: "/email-verify";
                readonly type: 0;
                readonly val: "email-verify";
                readonly end: "";
            }];
            readonly types: Registry["email.verify"]["types"];
        };
        readonly 'auth.logout': {
            readonly methods: ["DELETE"];
            readonly pattern: "/logout";
            readonly tokens: [{
                readonly old: "/logout";
                readonly type: 0;
                readonly val: "logout";
                readonly end: "";
            }];
            readonly types: Registry["auth.logout"]["types"];
        };
        readonly 'admin.dashboard': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/admin";
            readonly tokens: [{
                readonly old: "/admin";
                readonly type: 0;
                readonly val: "admin";
                readonly end: "";
            }];
            readonly types: Registry["admin.dashboard"]["types"];
        };
        readonly 'admin.terms.invalidate': {
            readonly methods: ["POST"];
            readonly pattern: "/admin/terms/invalidate";
            readonly tokens: [{
                readonly old: "/admin/terms/invalidate";
                readonly type: 0;
                readonly val: "admin";
                readonly end: "";
            }, {
                readonly old: "/admin/terms/invalidate";
                readonly type: 0;
                readonly val: "terms";
                readonly end: "";
            }, {
                readonly old: "/admin/terms/invalidate";
                readonly type: 0;
                readonly val: "invalidate";
                readonly end: "";
            }];
            readonly types: Registry["admin.terms.invalidate"]["types"];
        };
        readonly 'admin.users.index': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/admin/users";
            readonly tokens: [{
                readonly old: "/admin/users";
                readonly type: 0;
                readonly val: "admin";
                readonly end: "";
            }, {
                readonly old: "/admin/users";
                readonly type: 0;
                readonly val: "users";
                readonly end: "";
            }];
            readonly types: Registry["admin.users.index"]["types"];
        };
        readonly 'admin.users.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/admin/users/:id";
            readonly tokens: [{
                readonly old: "/admin/users/:id";
                readonly type: 0;
                readonly val: "admin";
                readonly end: "";
            }, {
                readonly old: "/admin/users/:id";
                readonly type: 0;
                readonly val: "users";
                readonly end: "";
            }, {
                readonly old: "/admin/users/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["admin.users.show"]["types"];
        };
        readonly 'admin.users.export': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/admin/users/:id/export";
            readonly tokens: [{
                readonly old: "/admin/users/:id/export";
                readonly type: 0;
                readonly val: "admin";
                readonly end: "";
            }, {
                readonly old: "/admin/users/:id/export";
                readonly type: 0;
                readonly val: "users";
                readonly end: "";
            }, {
                readonly old: "/admin/users/:id/export";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }, {
                readonly old: "/admin/users/:id/export";
                readonly type: 0;
                readonly val: "export";
                readonly end: "";
            }];
            readonly types: Registry["admin.users.export"]["types"];
        };
        readonly 'admin.users.update': {
            readonly methods: ["PUT"];
            readonly pattern: "/admin/users/:id";
            readonly tokens: [{
                readonly old: "/admin/users/:id";
                readonly type: 0;
                readonly val: "admin";
                readonly end: "";
            }, {
                readonly old: "/admin/users/:id";
                readonly type: 0;
                readonly val: "users";
                readonly end: "";
            }, {
                readonly old: "/admin/users/:id";
                readonly type: 1;
                readonly val: "id";
                readonly end: "";
            }];
            readonly types: Registry["admin.users.update"]["types"];
        };
        readonly 'legal.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/legal";
            readonly tokens: [{
                readonly old: "/legal";
                readonly type: 0;
                readonly val: "legal";
                readonly end: "";
            }];
            readonly types: Registry["legal.show"]["types"];
        };
        readonly 'terms.show': {
            readonly methods: ["GET", "HEAD"];
            readonly pattern: "/terms";
            readonly tokens: [{
                readonly old: "/terms";
                readonly type: 0;
                readonly val: "terms";
                readonly end: "";
            }];
            readonly types: Registry["terms.show"]["types"];
        };
        readonly 'terms.accept': {
            readonly methods: ["POST"];
            readonly pattern: "/terms/accept";
            readonly tokens: [{
                readonly old: "/terms/accept";
                readonly type: 0;
                readonly val: "terms";
                readonly end: "";
            }, {
                readonly old: "/terms/accept";
                readonly type: 0;
                readonly val: "accept";
                readonly end: "";
            }];
            readonly types: Registry["terms.accept"]["types"];
        };
    };
    $tree: ApiDefinition;
};
declare module '@tuyau/core/types' {
    interface UserRegistry {
        routes: typeof routes;
        $tree: ApiDefinition;
    }
}
