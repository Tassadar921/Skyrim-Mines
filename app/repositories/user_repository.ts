import BaseRepository from '#repositories/base/base_repository';
import User from '#models/user';
import UserRoleEnum from '#types/enum/user_role_enum';
import { DateTime } from 'luxon';

export default class UserRepository extends BaseRepository<typeof User> {
    constructor() {
        super(User);
    }

    public async paginate(params: { page: number; perPage: number; sort: string; dir: 'asc' | 'desc'; search?: string }) {
        const { page, perPage, sort, dir, search } = params;
        const allowedSorts: Record<string, string> = {
            username: 'username',
            email: 'email',
            createdAt: 'created_at',
        };
        const sortColumn = allowedSorts[sort] ?? 'created_at';

        const q = User.query().orderBy(sortColumn, dir);
        if (search) {
            q.where((builder) => {
                builder.whereILike('username', `%${search}%`).orWhereILike('email', `%${search}%`);
            });
        }
        return q.paginate(page, perPage);
    }

    public async findOrFail(id: string): Promise<User> {
        return User.findOrFail(id);
    }

    public async create(data: { username: string; email: string; password: string; acceptedTerms?: boolean }): Promise<User> {
        return User.create({
            username: data.username,
            email: data.email,
            password: data.password,
            role: UserRoleEnum.USER,
            enabled: false,
            acceptedTermsAt: data.acceptedTerms ? DateTime.now() : null,
        });
    }

    public async update(id: string, data: { username: string; role: UserRoleEnum; enabled: boolean }): Promise<User> {
        const user = await User.findOrFail(id);
        user.username = data.username;
        user.role = data.role;
        user.enabled = data.enabled;
        await user.save();
        return user;
    }
}
