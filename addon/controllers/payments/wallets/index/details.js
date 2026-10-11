import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class PaymentsWalletsIndexDetailsController extends Controller {
    @service notifications;
    @service modalsManager;
    @service fetch;
    @service intl;

    get tabs() {
        return [
            { label: this.intl.t('ledger.common.overview'), route: 'payments.wallets.index.details.index' },
            { label: this.intl.t('resource.transactions'), route: 'payments.wallets.index.details.transactions' },
        ];
    }

    get actionButtons() {
        const wallet = this.model;
        const frozen = wallet?.is_frozen;

        return [
            {
                label: this.intl.t('ledger.common.add-funds'),
                icon: 'plus-circle',
                type: 'primary',
                helpText: this.intl.t('ledger.wallet.add-funds-to-this-wallet-balance'),
                onClick: this.topUpWallet,
            },
            { label: this.intl.t('ledger.common.transfer'), icon: 'exchange-alt', helpText: this.intl.t('ledger.wallet.transfer-funds-from-this-wallet-to'), onClick: this.transferFunds },
            {
                label: frozen ? this.intl.t('ledger.common.unfreeze') : this.intl.t('ledger.common.freeze'),
                icon: frozen ? 'unlock' : 'lock',
                type: frozen ? 'default' : 'danger',
                helpText: frozen ? this.intl.t('ledger.wallet.unfreeze-this-wallet-to-allow-debits') : this.intl.t('ledger.wallet.freeze-this-wallet-to-block-all'),
                onClick: frozen ? this.unfreezeWallet : this.freezeWallet,
            },
        ];
    }

    @action async freezeWallet() {
        const wallet = this.model;

        this.modalsManager.confirm({
            title: this.intl.t('ledger.wallet.freeze-title', { name: wallet.name }),
            body: this.intl.t('ledger.wallet.freezing-this-wallet-will-block-all'),
            acceptButtonText: this.intl.t('ledger.common.freeze-wallet'),
            acceptButtonIcon: 'lock',
            acceptButtonScheme: 'danger',
            confirm: async (modal) => {
                modal.startLoading();
                try {
                    await this.fetch.post(`wallets/${wallet.id}/freeze`, {}, { namespace: 'ledger/int/v1' });
                    this.notifications.success(this.intl.t('ledger.wallet.frozen-success', { name: wallet.name }));
                    await wallet.reload();
                    modal.done();
                } catch (error) {
                    this.notifications.serverError(error);
                    modal.stopLoading();
                }
            },
        });
    }

    @action async unfreezeWallet() {
        const wallet = this.model;

        this.modalsManager.confirm({
            title: this.intl.t('ledger.wallet.unfreeze-title', { name: wallet.name }),
            body: this.intl.t('ledger.wallet.unfreezing-this-wallet-will-restore-normal'),
            acceptButtonText: this.intl.t('ledger.common.unfreeze-wallet'),
            acceptButtonIcon: 'unlock',
            confirm: async (modal) => {
                modal.startLoading();
                try {
                    await this.fetch.post(`wallets/${wallet.id}/unfreeze`, {}, { namespace: 'ledger/int/v1' });
                    this.notifications.success(this.intl.t('ledger.wallet.unfrozen-success', { name: wallet.name }));
                    await wallet.reload();
                    modal.done();
                } catch (error) {
                    this.notifications.serverError(error);
                    modal.stopLoading();
                }
            },
        });
    }

    @action async topUpWallet() {
        const wallet = this.model;

        const options = {
            title: this.intl.t('ledger.wallet.add-funds-title', { name: wallet.name }),
            acceptButtonText: this.intl.t('ledger.common.add-funds'),
            acceptButtonIcon: 'plus-circle',
            wallet,
            amount: 0,
            description: '',
            setAmount: (centsValue) => {
                options.amount = centsValue;
            },
            setDescription: (event) => {
                options.description = event.target.value;
            },
            confirm: async (modal) => {
                if (!options.amount || options.amount <= 0) {
                    this.notifications.warning(this.intl.t('ledger.wallet.please-enter-a-valid-amount-greater'));
                    return;
                }
                modal.startLoading();
                try {
                    await this.fetch.post(
                        `wallets/${wallet.id}/credit`,
                        { amount: options.amount, description: options.description || this.intl.t('ledger.common.manual-top-up') },
                        { namespace: 'ledger/int/v1' }
                    );
                    this.notifications.success(this.intl.t('ledger.wallet.funds-added', { name: wallet.name }));
                    await wallet.reload();
                    modal.done();
                } catch (error) {
                    this.notifications.serverError(error);
                    modal.stopLoading();
                }
            },
        };

        this.modalsManager.show('modals/wallet-top-up', options);
    }

    @action async transferFunds() {
        const wallet = this.model;

        const options = {
            title: this.intl.t('ledger.wallet.transfer-funds-title', { name: wallet.name }),
            acceptButtonText: this.intl.t('ledger.common.transfer'),
            acceptButtonIcon: 'exchange-alt',
            wallet,
            toWallet: null,
            amount: 0,
            description: '',
            setToWallet: (selectedWallet) => {
                options.toWallet = selectedWallet;
            },
            setAmount: (centsValue) => {
                options.amount = centsValue;
            },
            setDescription: (event) => {
                options.description = event.target.value;
            },
            confirm: async (modal) => {
                if (!options.toWallet) {
                    this.notifications.warning(this.intl.t('ledger.wallet.please-select-a-destination-wallet'));
                    return;
                }
                if (!options.amount || options.amount <= 0) {
                    this.notifications.warning(this.intl.t('ledger.wallet.please-enter-a-valid-amount-greater'));
                    return;
                }
                if (options.toWallet.id === wallet.id) {
                    this.notifications.warning(this.intl.t('ledger.wallet.cannot-transfer-funds-to-the-same'));
                    return;
                }
                modal.startLoading();
                try {
                    await this.fetch.post(
                        `wallets/${wallet.id}/transfer`,
                        {
                            to_wallet_uuid: options.toWallet.id,
                            amount: options.amount,
                            description: options.description || this.intl.t('ledger.common.internal-transfer'),
                        },
                        { namespace: 'ledger/int/v1' }
                    );
                    this.notifications.success(this.intl.t('ledger.wallet.funds-transferred', { name: options.toWallet.name }));
                    await wallet.reload();
                    modal.done();
                } catch (error) {
                    this.notifications.serverError(error);
                    modal.stopLoading();
                }
            },
        };

        this.modalsManager.show('modals/wallet-transfer', options);
    }
}
