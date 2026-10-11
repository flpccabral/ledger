import { module, test } from 'qunit';
import ledgerLabel from '@fleetbase/ledger-engine/utils/ledger-label';

const messages = {
    'ledger.status.paid': 'Paga',
    'ledger.status.partial_refund_pending': 'Reembolso Parcial Pendente',
    'ledger.transaction-type.wallet_deposit': 'Depósito na Carteira',
};

const intl = {
    exists: (key) => key in messages,
    t: (key) => messages[key],
};

module('Unit | Utility | ledger-label', function () {
    test('it translates a raw status', function (assert) {
        assert.strictEqual(ledgerLabel(intl, 'paid'), 'Paga');
        assert.strictEqual(ledgerLabel(intl, 'partial_refund_pending'), 'Reembolso Parcial Pendente');
        assert.strictEqual(ledgerLabel(intl, 'PAID'), 'Paga');
    });

    test('it uses the given namespace', function (assert) {
        assert.strictEqual(ledgerLabel(intl, 'wallet_deposit', 'transaction-type'), 'Depósito na Carteira');
    });

    test('it humanizes values without a translation', function (assert) {
        assert.strictEqual(ledgerLabel(intl, 'wallet_deposit'), 'Wallet deposit');
        assert.strictEqual(ledgerLabel(intl, 'some-new_status'), 'Some new status');
    });

    test('it passes empty values through', function (assert) {
        assert.strictEqual(ledgerLabel(intl, null), null);
        assert.strictEqual(ledgerLabel(intl, undefined), undefined);
        assert.strictEqual(ledgerLabel(intl, ''), '');
    });
});
