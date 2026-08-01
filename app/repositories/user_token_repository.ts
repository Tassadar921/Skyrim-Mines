import { createHash, randomBytes } from 'node:crypto';
import { DateTime } from 'luxon';
import UserToken from '#models/user_token';
import UserTokenTypeEnum from '#types/enum/user_token_type_enum';

export default class UserTokenRepository {
    private static hash(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    public async create(userId: string, type: UserTokenTypeEnum, expiresInHours: number = 1): Promise<string> {
        await UserToken.query().where('user_id', userId).where('type', type).delete();

        const token = randomBytes(32).toString('hex');

        await UserToken.create({
            userId,
            type,
            tokenHash: UserTokenRepository.hash(token),
            expiresAt: DateTime.now().plus({ hours: expiresInHours }),
        });

        return token;
    }

    public async findValid(token: string, type: UserTokenTypeEnum): Promise<UserToken | null> {
        return UserToken.query().where('token_hash', UserTokenRepository.hash(token)).where('type', type).where('expires_at', '>', DateTime.now().toSQL()!).first();
    }

    public async consume(token: string, type: UserTokenTypeEnum): Promise<void> {
        await UserToken.query().where('token_hash', UserTokenRepository.hash(token)).where('type', type).delete();
    }
}
