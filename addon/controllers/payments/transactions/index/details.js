import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class PaymentsTransactionsIndexDetailsController extends Controller {
    @service intl;
    @tracked overlay = null;

    get tabs() {
        return [{ label: this.intl.t('ledger.common.overview'), route: 'payments.transactions.index.details.index' }];
    }

    get actionButtons() {
        return [];
    }
}
