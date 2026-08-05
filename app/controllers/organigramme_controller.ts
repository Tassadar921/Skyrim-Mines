import { type HttpContext } from '@adonisjs/core/http';
import UserRepository from '#repositories/user_repository';
import UserRoleEnum from '#types/enum/user_role_enum';

export default class OrganigrammeController {
    constructor(private readonly userRepository: UserRepository = new UserRepository()) {}

    public async index({ inertia }: HttpContext) {
        const members = await this.userRepository.findForOrgChart();

        const toCard = (user: (typeof members)[number]) => ({ id: user.id, username: user.username, avatarUrl: user.avatar?.path ?? null });

        return inertia.render('organigramme', {
            owners: members.filter((user) => user.role === UserRoleEnum.ADMIN).map(toCard),
            employees: members.filter((user) => user.role === UserRoleEnum.STAFF).map(toCard),
            extras: members.filter((user) => user.role === UserRoleEnum.CONTRACTOR).map(toCard),
        });
    }
}
