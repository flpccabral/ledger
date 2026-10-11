import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AccountingJournalIndexDetailsController extends Controller {
    @service notifications;
    @service modalsManager;
    @service hostRouter;
    @service intl;

    @tracked overlay = null;

    get tabs() {
        return [{ label: this.intl.t('ledger.common.overview'), route: 'accounting.journal.index.details.index' }];
    }

    get actionButtons() {
        const entry = this.model;
        if (entry?.is_system_entry) return [];
        return [
            {
                label: this.intl.t('ledger.common.delete'),
                icon: 'trash',
                type: 'danger',
                helpText: this.intl.t('ledger.accounting.permanently-delete-this-journal-entry-system'),
                onClick: this.deleteEntry,
            },
        ];
    }

    @action async deleteEntry() {
        const entry = this.model;
        this.modalsManager.confirm({
            title: this.intl.t('ledger.accounting.delete-journal-entry'),
            body: this.intl.t('ledger.accounting.this-action-cannot-be-undone'),
            confirm: async (modal) => {
                modal.startLoading();
                try {
                    await entry.destroyRecord();
                    this.notifications.success(this.intl.t('ledger.accounting.journal-entry-deleted'));
                    this.hostRouter.transitionTo('accounting.journal.index');
                    modal.done();
                } catch (error) {
                    this.notifications.serverError(error);
                    modal.stopLoading();
                }
            },
        });
    }
}
