import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ledgerLabel from '../../../utils/ledger-label';
import { tracked } from '@glimmer/tracking';

export default class PaymentsTransactionsIndexController extends Controller {
    @service transactionActions;
    @service tableContext;
    @service intl;

    @tracked queryParams = [
        'page',
        'limit',
        'sort',
        'query',
        'public_id',
        'description',
        'type',
        'status',
        'settlement_status',
        'direction',
        'currency',
        'gateway',
        'payment_method',
        'reference',
        'period',
        'failure_reason',
        'created_at',
        'updated_at',
        'settled_at',
    ];
    @tracked page = 1;
    @tracked limit = 30;
    @tracked sort = '-created_at';
    @tracked query = null;
    @tracked public_id = null;
    @tracked description = null;
    @tracked type = null;
    @tracked status = null;
    @tracked settlement_status = null;
    @tracked direction = null;
    @tracked currency = null;
    @tracked gateway = null;
    @tracked payment_method = null;
    @tracked reference = null;
    @tracked period = null;
    @tracked failure_reason = null;
    @tracked created_at = null;
    @tracked updated_at = null;
    @tracked settled_at = null;
    @tracked table = null;

    get actionButtons() {
        return [
            {
                icon: 'refresh',
                onClick: this.transactionActions.refresh,
                helpText: this.intl.t('common.refresh'),
            },
        ];
    }

    get bulkActions() {
        return [];
    }

    get columns() {
        return [
            // ── Default visible columns ──────────────────────────────────────
            {
                sticky: true,
                label: this.intl.t('column.id'),
                valuePath: 'public_id',
                cellComponent: 'table/cell/anchor',
                action: this.transactionActions.transition.view,
                width: 120,
                resizable: true,
                sortable: true,
                filterable: true,
                filterParam: 'public_id',
                filterComponent: 'filter/string',
            },
            {
                label: this.intl.t('column.date'),
                valuePath: 'createdAt',
                sortParam: 'created_at',
                filterParam: 'created_at',
                resizable: true,
                sortable: true,
                filterable: true,
                filterComponent: 'filter/date',
            },
            {
                label: this.intl.t('column.description'),
                valuePath: 'description',
                resizable: true,
                sortable: false,
                filterable: true,
                filterParam: 'description',
                filterComponent: 'filter/string',
            },
            {
                label: this.intl.t('column.type'),
                valuePath: 'type',
                cellComponent: 'table/cell/ledger-label',
                labelNamespace: 'transaction-type',
                resizable: true,
                sortable: true,
                filterable: true,
                filterParam: 'type',
                filterComponent: 'filter/multi-option',
                filterOptionLabel: 'label',
                filterOptionValue: 'value',
                filterOptions: [
                    { label: ledgerLabel(this.intl, 'wallet_deposit', 'transaction-type'), value: 'wallet_deposit' },
                    { label: ledgerLabel(this.intl, 'wallet_withdrawal', 'transaction-type'), value: 'wallet_withdrawal' },
                    { label: ledgerLabel(this.intl, 'wallet_transfer', 'transaction-type'), value: 'wallet_transfer' },
                    { label: ledgerLabel(this.intl, 'gateway_charge', 'transaction-type'), value: 'gateway_charge' },
                    { label: ledgerLabel(this.intl, 'gateway_refund', 'transaction-type'), value: 'gateway_refund' },
                    { label: ledgerLabel(this.intl, 'gateway_payout', 'transaction-type'), value: 'gateway_payout' },
                    { label: ledgerLabel(this.intl, 'adjustment', 'transaction-type'), value: 'adjustment' },
                    { label: ledgerLabel(this.intl, 'earning', 'transaction-type'), value: 'earning' },
                    { label: ledgerLabel(this.intl, 'fee', 'transaction-type'), value: 'fee' },
                ],
            },
            {
                label: this.intl.t('column.direction'),
                valuePath: 'direction',
                cellComponent: 'table/cell/ledger-label',
                labelNamespace: 'direction',
                resizable: true,
                sortable: true,
                filterable: true,
                filterParam: 'direction',
                filterComponent: 'filter/select',
                filterOptionLabel: 'label',
                filterOptionValue: 'value',
                filterOptions: [
                    { label: this.intl.t('ledger.common.credit'), value: 'credit' },
                    { label: this.intl.t('ledger.common.debit'), value: 'debit' },
                ],
            },
            {
                label: this.intl.t('column.amount'),
                valuePath: 'amount',
                cellComponent: 'table/cell/currency',
                resizable: true,
                sortable: true,
                sortParam: 'amount',
                filterable: false,
            },
            {
                label: this.intl.t('column.status'),
                valuePath: 'status',
                cellComponent: 'table/cell/ledger-status',
                resizable: true,
                sortable: true,
                filterable: true,
                filterParam: 'status',
                filterComponent: 'filter/multi-option',
                filterOptionLabel: 'label',
                filterOptionValue: 'value',
                filterOptions: [
                    { label: ledgerLabel(this.intl, 'pending', 'status'), value: 'pending' },
                    { label: ledgerLabel(this.intl, 'success', 'status'), value: 'success' },
                    { label: ledgerLabel(this.intl, 'failed', 'status'), value: 'failed' },
                    { label: ledgerLabel(this.intl, 'cancelled', 'status'), value: 'cancelled' },
                    { label: ledgerLabel(this.intl, 'voided', 'status'), value: 'voided' },
                    { label: ledgerLabel(this.intl, 'reversed', 'status'), value: 'reversed' },
                    { label: ledgerLabel(this.intl, 'expired', 'status'), value: 'expired' },
                ],
            },
            {
                label: this.intl.t('ledger.common.settlement'),
                valuePath: 'settlement_status',
                cellComponent: 'table/cell/ledger-status',
                hidden: true,
                resizable: true,
                sortable: true,
                filterable: true,
                filterParam: 'settlement_status',
                filterComponent: 'filter/multi-option',
                filterOptionLabel: 'label',
                filterOptionValue: 'value',
                filterOptions: [
                    { label: ledgerLabel(this.intl, 'unpaid', 'status'), value: 'unpaid' },
                    { label: ledgerLabel(this.intl, 'partially_paid', 'status'), value: 'partially_paid' },
                    { label: ledgerLabel(this.intl, 'paid', 'status'), value: 'paid' },
                    { label: ledgerLabel(this.intl, 'partially_refunded', 'status'), value: 'partially_refunded' },
                    { label: ledgerLabel(this.intl, 'refunded', 'status'), value: 'refunded' },
                ],
            },
            // ── Hidden / toggleable columns ──────────────────────────────────
            {
                label: this.intl.t('column.net-amount'),
                valuePath: 'net_amount',
                cellComponent: 'table/cell/currency',
                hidden: true,
                resizable: true,
                sortable: true,
                sortParam: 'net_amount',
                filterable: false,
            },
            {
                label: this.intl.t('column.fee'),
                valuePath: 'fee_amount',
                cellComponent: 'table/cell/currency',
                hidden: true,
                resizable: true,
                sortable: false,
                filterable: false,
            },
            {
                label: this.intl.t('column.tax'),
                valuePath: 'tax_amount',
                cellComponent: 'table/cell/currency',
                hidden: true,
                resizable: true,
                sortable: false,
                filterable: false,
            },
            {
                label: this.intl.t('column.currency'),
                valuePath: 'currency',
                hidden: true,
                resizable: true,
                sortable: true,
                filterable: true,
                filterParam: 'currency',
                filterComponent: 'filter/string',
            },
            {
                label: this.intl.t('column.gateway'),
                valuePath: 'gateway',
                hidden: true,
                resizable: true,
                sortable: true,
                filterable: true,
                filterParam: 'gateway',
                filterComponent: 'filter/string',
            },
            {
                label: this.intl.t('column.payment-method'),
                valuePath: 'payment_method',
                hidden: true,
                resizable: true,
                sortable: false,
                filterable: true,
                filterParam: 'payment_method',
                filterComponent: 'filter/select',
                filterOptionLabel: 'label',
                filterOptionValue: 'value',
                filterOptions: [
                    { label: this.intl.t('ledger.common.card'), value: 'card' },
                    { label: this.intl.t('ledger.common.bank-transfer'), value: 'bank_transfer' },
                    { label: this.intl.t('resource.wallet'), value: 'wallet' },
                    { label: this.intl.t('ledger.common.cash'), value: 'cash' },
                ],
            },
            {
                label: this.intl.t('column.reference'),
                valuePath: 'reference',
                hidden: true,
                resizable: true,
                sortable: false,
                filterable: true,
                filterParam: 'reference',
                filterComponent: 'filter/string',
            },
            {
                label: this.intl.t('column.period'),
                valuePath: 'period',
                hidden: true,
                resizable: true,
                sortable: true,
                filterable: true,
                filterParam: 'period',
                filterComponent: 'filter/string',
            },
            {
                label: this.intl.t('column.settled-at'),
                valuePath: 'settled_at',
                sortParam: 'settled_at',
                filterParam: 'settled_at',
                hidden: true,
                resizable: true,
                sortable: true,
                filterable: true,
                filterComponent: 'filter/date',
            },
            {
                label: this.intl.t('column.failure-reason'),
                valuePath: 'failure_reason',
                hidden: true,
                resizable: true,
                sortable: false,
                filterable: true,
                filterParam: 'failure_reason',
                filterComponent: 'filter/string',
            },
            {
                label: this.intl.t('column.updated-at'),
                valuePath: 'updatedAt',
                sortParam: 'updated_at',
                filterParam: 'updated_at',
                hidden: true,
                resizable: true,
                sortable: true,
                filterable: true,
                filterComponent: 'filter/date',
            },
            // ── Row actions dropdown ─────────────────────────────────────────
            {
                label: '',
                cellComponent: 'table/cell/dropdown',
                ddButtonText: false,
                ddButtonIcon: 'ellipsis-h',
                ddButtonIconPrefix: 'fas',
                ddMenuLabel: this.intl.t('common.resource-actions', { resource: this.intl.t('resource.transaction') }),
                cellClassNames: 'overflow-visible',
                wrapperClass: 'flex items-center justify-end mx-2',
                sticky: 'right',
                width: 60,
                actions: [
                    {
                        label: this.intl.t('common.view-resource', { resource: this.intl.t('resource.transaction') }),
                        icon: 'eye',
                        fn: this.transactionActions.transition.view,
                        permission: 'ledger view transaction',
                    },
                ],
                sortable: false,
                filterable: false,
                resizable: false,
                searchable: false,
            },
        ];
    }
}
