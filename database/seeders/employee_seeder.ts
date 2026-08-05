import { BaseSeeder } from '@adonisjs/lucid/seeders';
import UserRepository from '#repositories/user_repository';
import UserRoleEnum from '#types/enum/user_role_enum';

const EMPLOYEES = [
    { discordId: 'seed-employee-user1', username: 'user1' },
    { discordId: 'seed-employee-user2', username: 'user2' },
];

export default class extends BaseSeeder {
    private readonly userRepository: UserRepository = new UserRepository();

    public async run(): Promise<void> {
        for (const employee of EMPLOYEES) {
            if (await this.userRepository.findByDiscordId(employee.discordId)) {
                continue;
            }

            await this.userRepository.create({
                discordId: employee.discordId,
                username: employee.username,
                role: UserRoleEnum.STAFF,
            });
        }
    }
}
