import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import ledgerLabel from '../utils/ledger-label';

/**
 * Display label for a raw API value: `{{ledger-label @resource.status}}` or
 * `{{ledger-label @resource.type "transaction-type"}}`.
 */
export default class LedgerLabelHelper extends Helper {
    @service intl;

    compute([value, namespace = 'status']) {
        return ledgerLabel(this.intl, value, namespace);
    }
}
