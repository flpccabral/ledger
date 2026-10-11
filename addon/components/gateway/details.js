import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import copyToClipboard from '@fleetbase/ember-core/utils/copy-to-clipboard';

export default class GatewayDetailsComponent extends Component {
    @service fetch;
    @service notifications;
    @service modalsManager;
    @service hostRouter;
    @service intl;

    @tracked diagnostics = null;
    @tracked lastActionResult = null;

    constructor() {
        super(...arguments);
        this.loadDiagnostics.perform();
    }

    get isTaler() {
        return this.args.resource?.driver === 'taler';
    }

    get gatewayId() {
        return this.args.resource?.id;
    }

    get section() {
        return this.args.section ?? 'overview';
    }

    get showOverview() {
        return this.section === 'overview';
    }

    get showSetup() {
        return this.section === 'setup';
    }

    get showDiagnostics() {
        return this.section === 'diagnostics';
    }

    get driverLabel() {
        const driver = this.args.resource?.driver;

        if (!driver) {
            return this.intl.t('resource.gateway');
        }

        if (driver === 'taler') {
            return 'GNU Taler';
        }

        if (driver === 'qpay') {
            return 'QPay';
        }

        return driver.charAt(0).toUpperCase() + driver.slice(1);
    }

    get diagnosticSummary() {
        return this.diagnostics?.diagnostics ?? {};
    }

    get gatewaySummary() {
        return this.diagnostics?.gateway ?? {};
    }

    get webhookStatus() {
        return this.diagnosticSummary.webhook_registration ?? (this.args.resource?.webhook_url ? 'configured' : 'not_configured');
    }

    get lastWebhookAt() {
        return this.diagnosticSummary.last_webhook_received_at;
    }

    get lastPaymentAt() {
        return this.diagnosticSummary.last_payment_event_at;
    }

    get lastRefundAt() {
        return this.diagnosticSummary.last_refund_event_at;
    }

    get lastSettlementAt() {
        return this.diagnosticSummary.last_settlement_seen_at;
    }

    get reconciliationStatus() {
        return this.diagnosticSummary.last_reconciliation_status;
    }

    get credentialStatus() {
        return this.diagnosticSummary.credential_status ?? 'not_checked';
    }

    get lastCredentialTestedAt() {
        return this.diagnosticSummary.last_credential_tested_at;
    }

    get lastCredentialTestMessage() {
        return this.diagnosticSummary.last_credential_test_message;
    }

    get lastWebhookRegistrationAt() {
        return this.diagnosticSummary.last_webhook_registration_at;
    }

    get lastTestOrderAt() {
        return this.diagnosticSummary.last_test_order_at;
    }

    get lastTestOrderId() {
        return this.diagnosticSummary.last_test_order_id;
    }

    get credentialTileValue() {
        if (this.credentialStatus === 'success' || this.credentialStatus === 'ok') {
            return this.intl.t('ledger.common.verified');
        }

        if (this.credentialStatus === 'failed') {
            return this.intl.t('ledger.common.failed');
        }

        return this.intl.t('ledger.common.not-checked');
    }

    get credentialAccentClass() {
        if (this.credentialStatus === 'success' || this.credentialStatus === 'ok') {
            return 'ledger-gateway-kpi-accent-green';
        }

        if (this.credentialStatus === 'failed') {
            return 'ledger-gateway-kpi-accent-rose';
        }

        return 'ledger-gateway-kpi-accent-slate';
    }

    get webhookRegistrationResultMessage() {
        if (this.lastWebhookRegistrationAt) {
            return this.intl.t('ledger.gateway.provider-webhook-registration-completed');
        }

        if (this.webhookStatus === 'configured') {
            return this.intl.t('ledger.gateway.webhook-url-is-configured-but-no');
        }

        return this.intl.t('ledger.gateway.no-provider-webhook-registration-stored');
    }

    get readinessItems() {
        return [
            {
                label: this.intl.t('ledger.common.connection'),
                value: this.args.resource?.status === 'active' ? this.intl.t('ledger.common.ready') : this.intl.t('ledger.common.inactive'),
                status: this.args.resource?.status === 'active' ? 'ready' : 'inactive',
                icon: 'plug',
                caption: this.args.resource?.status === 'active' ? this.intl.t('ledger.common.available-on-invoices') : this.intl.t('ledger.gateway.not-used-at-checkout'),
                accentClass: this.args.resource?.status === 'active' ? 'ledger-gateway-kpi-accent-green' : 'ledger-gateway-kpi-accent-slate',
            },
            {
                label: this.intl.t('column.environment'),
                value: this.args.resource?.environment === 'live' ? this.intl.t('ledger.common.live') : this.intl.t('ledger.common.sandbox'),
                status: this.args.resource?.environment ?? 'unknown',
                icon: 'server',
                caption: this.args.resource?.environment === 'live' ? this.intl.t('ledger.common.production-payments') : this.intl.t('ledger.gateway.testing-and-sandbox-use'),
                accentClass: this.args.resource?.environment === 'live' ? 'ledger-gateway-kpi-accent-blue' : 'ledger-gateway-kpi-accent-amber',
            },
            {
                label: this.intl.t('ledger.common.webhook'),
                value: this.webhookStatus === 'configured' ? this.intl.t('ledger.common.configured') : this.intl.t('ledger.common.needs-setup'),
                status: this.webhookStatus === 'configured' ? 'configured' : 'needs setup',
                icon: 'link',
                caption: this.webhookStatus === 'configured' ? this.intl.t('ledger.common.provider-callback-ready') : this.intl.t('ledger.common.registration-needed'),
                accentClass: this.webhookStatus === 'configured' ? 'ledger-gateway-kpi-accent-green' : 'ledger-gateway-kpi-accent-amber',
            },
            {
                label: this.intl.t('ledger.common.credentials'),
                value: this.credentialTileValue,
                status: this.credentialStatus,
                icon: 'key',
                caption: this.lastCredentialTestedAt ? this.intl.t('ledger.gateway.last-provider-auth-test') : this.intl.t('ledger.gateway.run-a-provider-check'),
                accentClass: this.credentialAccentClass,
            },
        ];
    }

    get providerStatusRows() {
        return [
            {
                label: this.intl.t('column.driver'),
                value: this.driverLabel,
                icon: this.isTaler ? 'wallet' : 'plug',
            },
            {
                label: this.intl.t('ledger.common.mode'),
                value: this.args.resource?.environment === 'live' ? this.intl.t('ledger.common.live') : this.intl.t('ledger.common.sandbox'),
                icon: this.args.resource?.environment === 'live' ? 'bolt' : 'flask',
            },
            {
                label: this.intl.t('ledger.common.credentials'),
                value: this.credentialStatus === 'not_checked' ? this.intl.t('ledger.common.not-checked-2') : this.credentialStatus,
                caption: this.lastCredentialTestMessage,
                date: this.lastCredentialTestedAt,
                icon: 'key',
                status: this.credentialStatus === 'success' || this.credentialStatus === 'ok' ? 'success' : this.credentialStatus === 'failed' ? 'danger' : 'warning',
            },
            {
                label: this.intl.t('ledger.common.webhook'),
                value: this.webhookStatus === 'configured' ? this.intl.t('ledger.common.configured') : this.intl.t('ledger.common.needs-setup-2'),
                date: this.lastWebhookRegistrationAt ?? this.lastWebhookAt,
                icon: 'link',
                status: this.webhookStatus === 'configured' ? 'success' : 'warning',
            },
            {
                label: this.intl.t('ledger.common.payment'),
                value: this.lastPaymentAt ? this.intl.t('ledger.common.seen') : this.intl.t('ledger.common.no-payment-yet'),
                date: this.lastPaymentAt,
                icon: 'money-bill-transfer',
                status: this.lastPaymentAt ? 'success' : 'default',
            },
            {
                label: this.intl.t('ledger.common.refund'),
                value: this.lastRefundAt ? this.intl.t('ledger.common.seen') : this.intl.t('ledger.common.no-refund-yet'),
                date: this.lastRefundAt,
                icon: 'rotate-left',
                status: this.lastRefundAt ? 'success' : 'default',
            },
            {
                label: this.intl.t('ledger.common.settlement'),
                value: this.reconciliationStatus ?? this.intl.t('ledger.common.not-checked-2'),
                date: this.lastSettlementAt,
                icon: 'scale-balanced',
                status: this.reconciliationStatus ? 'success' : 'warning',
            },
        ];
    }

    get setupIdentityRows() {
        return [
            {
                label: this.intl.t('column.name'),
                value: this.args.resource?.name,
            },
            {
                label: this.intl.t('column.driver'),
                value: this.driverLabel,
            },
            {
                label: this.intl.t('ledger.common.public-id'),
                value: this.args.resource?.public_id,
                mono: true,
                copyable: true,
            },
            {
                label: this.intl.t('column.status'),
                value: this.args.resource?.status,
            },
            {
                label: this.intl.t('column.environment'),
                value: this.args.resource?.environment ?? (this.args.resource?.is_sandbox ? 'sandbox' : 'live'),
            },
            {
                label: this.intl.t('column.created-at'),
                value: this.args.resource?.createdAt ?? this.args.resource?.created_at,
                date: true,
            },
        ];
    }

    get setupRoutingRows() {
        return [
            {
                label: this.intl.t('ledger.common.return-url'),
                value: this.args.resource?.return_url,
                mono: true,
                copyable: true,
            },
            {
                label: this.intl.t('ledger.common.ledger-webhook-url'),
                value: this.args.resource?.system_webhook_url,
                mono: true,
                copyable: true,
            },
            {
                label: this.intl.t('ledger.common.provider-registered-callback'),
                value: this.args.resource?.webhook_url,
                displayValue:
                    this.args.resource?.webhook_url && this.args.resource?.webhook_url === this.args.resource?.system_webhook_url
                        ? this.intl.t('ledger.gateway.same-as-ledger-webhook-url')
                        : this.args.resource?.webhook_url,
                caption:
                    this.args.resource?.webhook_url && this.args.resource?.webhook_url === this.args.resource?.system_webhook_url
                        ? this.intl.t('ledger.gateway.the-provider-posts-events-to-the')
                        : null,
                mono: true,
                copyable: true,
            },
        ];
    }

    get setupConfigRows() {
        const configSummary = this.gatewaySummary.config_summary ?? [];

        if (configSummary.length) {
            return configSummary;
        }

        return [
            {
                label: this.intl.t('ledger.common.provider-credentials'),
                value: this.intl.t('ledger.gateway.stored-encrypted-and-hidden'),
            },
        ];
    }

    get recentActivity() {
        return [
            this.activityItem(this.intl.t('ledger.common.webhook'), this.diagnostics?.last_webhook, 'link'),
            this.activityItem(this.intl.t('ledger.common.payment'), this.diagnostics?.last_payment, 'money-bill-transfer'),
            this.activityItem(this.intl.t('ledger.common.refund'), this.diagnostics?.last_refund, 'rotate-left'),
            this.activityItem(this.intl.t('ledger.common.settlement'), this.diagnostics?.last_settlement, 'scale-balanced', this.lastSettlementAt),
        ].filter(Boolean);
    }

    get diagnosticsResults() {
        return [
            {
                label: this.intl.t('ledger.common.credential-test'),
                value: this.lastCredentialTestMessage ?? this.intl.t('ledger.gateway.no-credential-test-has-been-run'),
                date: this.lastCredentialTestedAt,
                status: this.credentialStatus === 'success' || this.credentialStatus === 'ok' ? 'success' : this.credentialStatus === 'failed' ? 'danger' : 'warning',
            },
            {
                label: this.intl.t('ledger.common.webhook-registration'),
                value: this.webhookRegistrationResultMessage,
                date: this.lastWebhookRegistrationAt,
                status: this.lastWebhookRegistrationAt ? 'success' : 'warning',
            },
            {
                label: this.intl.t('ledger.common.test-order'),
                value: this.lastTestOrderId ? this.intl.t('ledger.gateway.last-order', { order: this.lastTestOrderId }) : this.intl.t('ledger.gateway.no-test-order-has-been-created'),
                date: this.lastTestOrderAt,
                status: this.lastTestOrderId ? 'success' : 'warning',
            },
        ];
    }

    get diagnosticActions() {
        if (!this.isTaler) {
            return [];
        }

        return [
            {
                key: 'test-credentials',
                title: this.intl.t('ledger.common.test-credentials'),
                description: this.intl.t('ledger.gateway.checks-whether-ledger-can-authenticate-against'),
                expectedResult: this.intl.t('ledger.gateway.updates-credential-status-and-last-checked'),
                icon: this.testCredentials.isRunning ? 'spinner' : 'check-circle',
                isLoading: this.testCredentials.isRunning,
                task: this.testCredentials,
                primary: true,
            },
            {
                key: 'register-webhook',
                title: this.intl.t('ledger.common.register-webhook'),
                description: this.intl.t('ledger.gateway.creates-or-updates-the-taler-webhook'),
                expectedResult: this.intl.t('ledger.gateway.stores-the-registered-webhook-url-and'),
                icon: this.registerWebhook.isRunning ? 'spinner' : 'link',
                isLoading: this.registerWebhook.isRunning,
                task: this.registerWebhook,
                confirm: true,
                confirmTitle: this.intl.t('ledger.gateway.register-taler-webhook-title'),
                confirmBody: this.intl.t('ledger.gateway.register-taler-webhook-body'),
            },
            {
                key: 'create-test-order',
                title: this.intl.t('ledger.common.create-test-order'),
                description: this.intl.t('ledger.gateway.creates-a-small-sandbox-order-to'),
                expectedResult: this.intl.t('ledger.gateway.creates-a-provider-test-order-and'),
                icon: this.createTestOrder.isRunning ? 'spinner' : 'flask',
                isLoading: this.createTestOrder.isRunning,
                task: this.createTestOrder,
                confirm: true,
                confirmTitle: this.intl.t('ledger.gateway.create-taler-test-order-title'),
                confirmBody: this.intl.t('ledger.gateway.create-taler-test-order-body'),
            },
            {
                key: 'refresh',
                title: this.intl.t('ledger.common.refresh-diagnostics'),
                description: this.intl.t('ledger.gateway.reloads-the-latest-credential-webhook-payment'),
                expectedResult: this.intl.t('ledger.gateway.no-provider-mutation-refreshes-this-screen'),
                icon: this.loadDiagnostics.isRunning ? 'spinner' : 'rotate',
                isLoading: this.loadDiagnostics.isRunning,
                task: this.loadDiagnostics,
                secondary: true,
            },
        ];
    }

    get overviewActions() {
        return [
            ...this.diagnosticActions.filter((diagnosticAction) => diagnosticAction.key !== 'refresh'),
            {
                key: 'copy-webhook-url',
                title: this.intl.t('ledger.common.copy-webhook-url'),
                description: this.intl.t('ledger.gateway.copies-the-ledger-callback-url-for'),
                expectedResult: this.intl.t('ledger.gateway.use-this-when-provider-webhook-registration'),
                icon: 'copy',
                action: this.copySystemWebhookUrl,
                secondary: true,
            },
            {
                key: 'edit-settings',
                title: this.intl.t('ledger.common.edit-settings'),
                description: this.intl.t('ledger.gateway.change-the-gateway-name-credentials-routing'),
                expectedResult: this.intl.t('ledger.gateway.opens-the-gateway-setup-wizard-for'),
                icon: 'pen-to-square',
                action: this.editGateway,
                secondary: true,
            },
        ];
    }

    activityItem(label, record, icon, fallbackDate) {
        if (!record && !fallbackDate) {
            return null;
        }

        return {
            label,
            icon,
            status: record?.status ?? record?.event_type ?? this.reconciliationStatus ?? 'seen',
            message: record?.message ?? record?.description ?? (label === this.intl.t('ledger.common.settlement') ? this.reconciliationStatus : null),
            date: record?.created_at ?? record?.createdAt ?? fallbackDate,
            reference: record?.gateway_reference_id ?? record?.id,
        };
    }

    @task({ restartable: true })
    *loadDiagnostics() {
        if (!this.gatewayId) return;

        try {
            this.diagnostics = yield this.fetch.get(`gateways/${this.gatewayId}/diagnostics`, {}, { namespace: 'ledger/int/v1' });
        } catch {
            this.diagnostics = null;
        }
    }

    @task({ drop: true })
    *testCredentials() {
        yield* this.runGatewayAction('test-credentials', this.intl.t('ledger.gateway.taler-credentials-accepted'));
    }

    @task({ drop: true })
    *createTestOrder() {
        yield* this.runGatewayAction('create-test-order', this.intl.t('ledger.gateway.taler-test-order-created'));
    }

    @task({ drop: true })
    *registerWebhook() {
        yield* this.runGatewayAction('register-webhook', this.intl.t('ledger.gateway.taler-webhook-registered'));
    }

    @action runDiagnosticAction(diagnosticAction) {
        if (diagnosticAction.action) {
            return diagnosticAction.action();
        }

        if (diagnosticAction.confirm) {
            return this.modalsManager.confirm({
                title: diagnosticAction.confirmTitle,
                body: diagnosticAction.confirmBody,
                acceptButtonText: diagnosticAction.title,
                confirm: () => diagnosticAction.task.perform(),
            });
        }

        return diagnosticAction.task.perform();
    }

    @action editGateway() {
        return this.hostRouter.transitionTo('console.ledger.payments.gateways.edit', this.args.resource);
    }

    @action copySystemWebhookUrl() {
        const url = this.args.resource?.system_webhook_url;

        if (!url) {
            return this.notifications.warning(this.intl.t('ledger.gateway.no-system-webhook-url-is-available'));
        }

        copyToClipboard(url)
            .then(() => this.notifications.success(this.intl.t('ledger.gateway.system-webhook-url-copied')))
            .catch(() => this.notifications.error(this.intl.t('ledger.gateway.unable-to-copy-webhook-url')));
    }

    *runGatewayAction(action, successMessage) {
        if (!this.gatewayId) return;

        try {
            const result = yield this.fetch.post(`gateways/${this.gatewayId}/${action}`, {}, { namespace: 'ledger/int/v1' });
            this.lastActionResult = result;
            this.notifications.success(result?.message ?? successMessage);
            yield this.loadDiagnostics.perform();
        } catch (error) {
            this.notifications.serverError(error);
        }
    }
}
