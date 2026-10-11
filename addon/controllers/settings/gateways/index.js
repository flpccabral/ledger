import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class SettingsGatewaysIndexController extends Controller {
    @service hostRouter;
    @service notifications;
    @service modalsManager;
    @service fetch;
    @service intl;

    @tracked query = null;
    @tracked table = null;
    @tracked availableDrivers = [];

    columns = [
        { label: this.intl.t('column.name'), valuePath: 'name', width: '180px' },
        { label: this.intl.t('column.driver'), valuePath: 'driver_label', width: '120px' },
        { label: this.intl.t('column.environment'), valuePath: 'environment', width: '100px' },
        { label: this.intl.t('column.status'), valuePath: 'status', width: '90px', cellComponent: 'table/cell/ledger-status' },
    ];

    get actionButtons() {
        return [{ label: this.intl.t('ledger.common.add-gateway'), icon: 'plus', type: 'primary', onClick: this.addGateway }];
    }

    @task({ restartable: true }) *search(query) {
        yield Promise.resolve();
        this.query = query;
    }

    @action addGateway() {
        this.hostRouter.transitionTo('console.ledger.payments.gateways.new');
    }

    @action viewGateway(gateway) {
        this.hostRouter.transitionTo('console.ledger.payments.gateways.details', gateway.id);
    }

    @action editGateway(gateway) {
        this.hostRouter.transitionTo('console.ledger.payments.gateways.edit', gateway);
    }

    @action async deleteGateway(gateway) {
        this.modalsManager.confirm({
            title: this.intl.t('ledger.gateway.remove-payment-gateway'),
            body: this.intl.t('ledger.gateway.remove-gateway-body', { name: gateway.name }),
            confirm: async (modal) => {
                modal.startLoading();
                try {
                    await gateway.destroyRecord();
                    this.notifications.success(this.intl.t('ledger.gateway.gateway-removed'));
                    this.hostRouter.refresh();
                    modal.done();
                } catch (error) {
                    this.notifications.serverError(error);
                    modal.stopLoading();
                }
            },
        });
    }

    @action reload() {
        return this.hostRouter.refresh();
    }
}
