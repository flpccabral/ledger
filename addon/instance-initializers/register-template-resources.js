/**
 * register-template-resources
 *
 * Registers Ledger model classes as queryable resource types in the
 * TemplateBuilder query form. This runs once per application instance,
 * making Invoice, Transaction, Account, and Wallet available as data
 * sources when building invoice templates.
 */
export function initialize(appInstance) {
    const templateBuilder = appInstance.lookup('service:template-builder');
    if (!templateBuilder) {
        return;
    }
    // Labels are translation keys rendered by ember-ui's `translate-label`;
    // older ember-ui versions show them as-is, so translate them up front there.
    const intl = appInstance.lookup('service:intl');
    const label = appInstance.factoryFor('helper:translate-label') ? (key) => key : (key) => intl.t(key);

    templateBuilder.registerResourceTypes([
        {
            label: label('resource.invoice'),
            value: 'Fleetbase\\Ledger\\Models\\Invoice',
            icon: 'file-invoice-dollar',
        },
        {
            label: label('resource.transaction'),
            value: 'Fleetbase\\Ledger\\Models\\Transaction',
            icon: 'money-bill-transfer',
        },
        {
            label: label('resource.account'),
            value: 'Fleetbase\\Ledger\\Models\\Account',
            icon: 'building-columns',
        },
        {
            label: label('resource.wallet'),
            value: 'Fleetbase\\Ledger\\Models\\Wallet',
            icon: 'wallet',
        },
    ]);
}

export default { initialize };
