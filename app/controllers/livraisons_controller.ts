import { type HttpContext } from '@adonisjs/core/http';
import transmit from '@adonisjs/transmit/services/main';
import DeliveryRepository from '#repositories/delivery_repository';
import { isStaffOrAdmin } from '#helpers/user_role_helper';
import { createDeliveryValidator } from '#validators/deliveries';

export default class LivraisonsController {
    constructor(private readonly deliveryRepository: DeliveryRepository = new DeliveryRepository()) {}

    public async store({ params, request, auth, response, session, i18n }: HttpContext) {
        const viewer = auth.user!;
        if (!isStaffOrAdmin(viewer.role)) {
            session.flash('error', i18n.t('messages.commandes.show.forbidden'));
            return response.redirect().toRoute('home');
        }

        const { lines, castellanyId } = await request.validateUsing(createDeliveryValidator);
        const requestedLines = lines.filter((line) => line.quantity > 0);

        const delivery = requestedLines.length ? await this.deliveryRepository.createForOrder(params.orderId, viewer.id, requestedLines, { castellanyId: castellanyId ?? null }) : null;
        if (delivery) transmit.broadcast('to-deliver', {});

        session.flash(delivery ? 'success' : 'error', i18n.t(delivery ? 'messages.livraisons.create.success' : 'messages.livraisons.create.error'));
        return response.redirect().back();
    }
}
