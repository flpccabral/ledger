import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class AccountingAccountsIndexDetailsController extends Controller {
    @service intl;
    @tracked overlay = null;

    get tabs() {
        return [
            { label: this.intl.t('ledger.common.overview'), route: 'accounting.accounts.index.details.index' },
            { label: this.intl.t('menu.general-ledger'), route: 'accounting.accounts.index.details.ledger' },
        ];
    }

    get actionButtons() {
        return [];
    }
}
