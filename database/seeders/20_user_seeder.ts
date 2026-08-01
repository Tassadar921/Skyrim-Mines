import { BaseSeeder } from '@adonisjs/lucid/seeders';
import { DateTime } from 'luxon';
import env from '#start/env';
import User from '#models/user';
import UserRepository from '#repositories/user_repository';
import UserRoleEnum from '#types/enum/user_role_enum';

export default class extends BaseSeeder {
    private readonly userRepository: UserRepository = new UserRepository();

    public async run(): Promise<void> {
        const email: string = env.get('ADMIN_EMAIL');

        if (!(await this.userRepository.findOneBy({ email }))) {
            await User.create({
                username: email.split('@')[0].replaceAll('.', ''),
                email,
                password: 'xxx',
                role: UserRoleEnum.ADMIN,
                enabled: true,
                acceptedTermsAt: DateTime.now(),
            });
        }

        if (!(await this.userRepository.findOneBy({ email: 'user@test.com' }))) {
            await User.create({
                username: 'testuser',
                email: 'user@test.com',
                password: 'xxx',
                role: UserRoleEnum.USER,
                enabled: true,
                acceptedTermsAt: DateTime.now(),
            });
        }
    }
}
