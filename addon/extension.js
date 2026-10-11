import { MenuItem, Widget, ExtensionComponent } from '@fleetbase/ember-core/contracts';

/**
 * Header menu items and widgets are registered with translation keys, which
 * ember-ui's `translate-label` translates when they render. Consoles running an
 * ember-ui without that helper render the value as-is, so translate up front.
 */
function labelResolver(app) {
    if (app.factoryFor('helper:translate-label')) {
        return (key) => key;
    }

    const intl = app.lookup('service:intl');
    return (key) => intl.t(key);
}

export default {
    setupExtension(app, universe) {
        const label = labelResolver(app);
        const menuService = universe.getService('universe/menu-service');
        const widgetService = universe.getService('universe/widget-service');

        // Register Ledger in the console header navigation
        menuService.registerHeaderMenuItem('Ledger', 'console.ledger', {
            icon: 'calculator',
            priority: 4,
            description: label('ledger.extension.description'),
            shortcuts: [
                {
                    id: 'ledger-sc-invoices',
                    title: label('ledger.extension.shortcuts.invoices.title'),
                    description: label('ledger.extension.shortcuts.invoices.description'),
                    icon: 'file-invoice-dollar',
                    route: 'console.ledger.billing.invoices',
                },
                {
                    id: 'ledger-sc-wallets',
                    title: label('ledger.extension.shortcuts.wallets.title'),
                    description: label('ledger.extension.shortcuts.wallets.description'),
                    icon: 'wallet',
                    route: 'console.ledger.payments.wallets',
                },
                {
                    id: 'ledger-sc-transactions',
                    title: label('ledger.extension.shortcuts.transactions.title'),
                    description: label('ledger.extension.shortcuts.transactions.description'),
                    icon: 'money-bill-transfer',
                    route: 'console.ledger.payments.transactions',
                },
                {
                    id: 'ledger-sc-payment-gateways',
                    title: label('ledger.extension.shortcuts.payment-gateways.title'),
                    description: label('ledger.extension.shortcuts.payment-gateways.description'),
                    icon: 'credit-card',
                    route: 'console.ledger.payments.gateways',
                },
                {
                    id: 'ledger-sc-chart-of-accounts',
                    title: label('ledger.extension.shortcuts.chart-of-accounts.title'),
                    description: label('ledger.extension.shortcuts.chart-of-accounts.description'),
                    icon: 'sitemap',
                    route: 'console.ledger.accounting.accounts',
                },
                {
                    id: 'ledger-sc-journal-entries',
                    title: label('ledger.extension.shortcuts.journal-entries.title'),
                    description: label('ledger.extension.shortcuts.journal-entries.description'),
                    icon: 'book',
                    route: 'console.ledger.accounting.journal',
                },
                {
                    id: 'ledger-sc-general-ledger',
                    title: label('ledger.extension.shortcuts.general-ledger.title'),
                    description: label('ledger.extension.shortcuts.general-ledger.description'),
                    icon: 'book-open',
                    route: 'console.ledger.accounting.general-ledger',
                },
            ],
        });

        // ── Public customer invoice view ───────────────────────────────────────
        // Registers the customer-facing invoice view to the 'engine:ledger'
        // registry so it is accessible at /ledger/invoice/<public_id> without
        // requiring the customer to be authenticated in the console.
        //
        // URL pattern: /ledger/invoice/<invoice-public_id-or-uuid>
        //
        // The customer-invoice component reads @slug from the route model and
        // fetches the invoice from the public API endpoint:
        //   GET /ledger/public/invoices/<public_id>
        //
        // wrapperClass: 'hidden' keeps this item invisible in all navigation
        // menus while still making it resolvable via the virtual route.
        menuService.registerMenuItem(
            'auth:login',
            new MenuItem({
                title: 'Invoice',
                slug: 'invoice',
                route: 'virtual',
                type: 'link',
                wrapperClass: 'hidden',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'customer-invoice'),
                onClick: (menuItem) => {
                    universe.transitionMenuItem('virtual', menuItem);
                },
            })
        );

        // ── Public GNU Taler refund handoff ──────────────────────────────────
        // URL pattern: /~/taler-refund?id=<refund-public_id-or-uuid>
        menuService.registerMenuItem(
            'auth:login',
            new MenuItem({
                title: 'Taler Refund',
                slug: 'taler-refund',
                route: 'virtual',
                type: 'link',
                wrapperClass: 'hidden',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'customer-taler-refund'),
                onClick: (menuItem) => {
                    universe.transitionMenuItem('virtual', menuItem);
                },
            })
        );

        // ── Fleet-Ops order details tab: Invoice ──────────────────────────────
        // Injects an "Invoice" tab into the Fleet-Ops order details panel.
        // The tab renders the order-invoice component which fetches and displays
        // the Ledger invoice associated with the order, including line items and
        // payment summary.
        menuService.registerMenuItem(
            'fleet-ops:component:order:details',
            new MenuItem({
                title: 'Invoice',
                route: 'operations.orders.index.details.virtual',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'order-invoice'),
                icon: 'file-invoice-dollar',
                slug: 'invoice',
            })
        );

        // ── Storefront order details tab: Invoice ────────────────────────────
        // Reuses the same order-invoice component inside the Storefront order
        // details panel so commerce orders expose their generated invoice.
        menuService.registerMenuItem(
            'storefront:component:order:details',
            new MenuItem({
                title: 'Invoice',
                route: 'orders.index.view.virtual',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'order-invoice'),
                icon: 'file-invoice-dollar',
                slug: 'invoice',
            })
        );

        // Register dashboard and widgets
        this.registerWidgets(widgetService, label);
    },

    registerWidgets(widgetService, label) {
        const widgets = [
            new Widget({
                id: 'ledger-kpi-revenue',
                name: label('ledger.extension.widgets.kpi-revenue.name'),
                description: label('ledger.extension.widgets.kpi-revenue.description'),
                icon: 'sack-dollar',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/kpi-revenue'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'KPI Tiles',
                default: true,
            }),
            new Widget({
                id: 'ledger-kpi-expenses',
                name: label('ledger.extension.widgets.kpi-expenses.name'),
                description: label('ledger.extension.widgets.kpi-expenses.description'),
                icon: 'receipt',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/kpi-expenses'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'KPI Tiles',
                default: true,
            }),
            new Widget({
                id: 'ledger-kpi-net-income',
                name: label('ledger.extension.widgets.kpi-net-income.name'),
                description: label('ledger.extension.widgets.kpi-net-income.description'),
                icon: 'chart-line',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/kpi-net-income'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'KPI Tiles',
                default: true,
            }),
            new Widget({
                id: 'ledger-kpi-outstanding-ar',
                name: label('ledger.extension.widgets.kpi-outstanding-ar.name'),
                description: label('ledger.extension.widgets.kpi-outstanding-ar.description'),
                icon: 'file-invoice-dollar',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/kpi-outstanding-ar'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'KPI Tiles',
                default: true,
            }),
            new Widget({
                id: 'ledger-kpi-overdue-ar',
                name: label('ledger.extension.widgets.kpi-overdue-ar.name'),
                description: label('ledger.extension.widgets.kpi-overdue-ar.description'),
                icon: 'clock',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/kpi-overdue-ar'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'KPI Tiles',
                default: true,
            }),
            new Widget({
                id: 'ledger-kpi-open-invoices',
                name: label('ledger.extension.widgets.kpi-open-invoices.name'),
                description: label('ledger.extension.widgets.kpi-open-invoices.description'),
                icon: 'file-circle-exclamation',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/kpi-open-invoices'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'KPI Tiles',
                default: true,
            }),
            new Widget({
                id: 'ledger-kpi-wallet-balance',
                name: label('ledger.extension.widgets.kpi-wallet-balance.name'),
                description: label('ledger.extension.widgets.kpi-wallet-balance.description'),
                icon: 'wallet',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/kpi-wallet-balance'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'KPI Tiles',
                default: true,
            }),
            new Widget({
                id: 'ledger-kpi-active-wallets',
                name: label('ledger.extension.widgets.kpi-active-wallets.name'),
                description: label('ledger.extension.widgets.kpi-active-wallets.description'),
                icon: 'wallet',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/kpi-active-wallets'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'KPI Tiles',
                default: true,
            }),

            new Widget({
                id: 'ledger-revenue-trend',
                name: label('ledger.extension.widgets.revenue-trend.name'),
                description: label('ledger.extension.widgets.revenue-trend.description'),
                icon: 'chart-line',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/revenue-trend'),
                grid_options: { w: 6, h: 9, minW: 5, minH: 8 },
                category: 'Analytics',
                default: true,
            }),
            new Widget({
                id: 'ledger-cash-flow-summary',
                name: label('ledger.extension.widgets.cash-flow-summary.name'),
                description: label('ledger.extension.widgets.cash-flow-summary.description'),
                icon: 'money-bill-transfer',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/cash-flow-summary'),
                grid_options: { w: 6, h: 9, minW: 5, minH: 8 },
                category: 'Analytics',
                default: true,
            }),
            new Widget({
                id: 'ledger-invoice-status',
                name: label('ledger.extension.widgets.invoice-status.name'),
                description: label('ledger.extension.widgets.invoice-status.description'),
                icon: 'file-invoice-dollar',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/invoice-status'),
                grid_options: { w: 4, h: 8, minW: 4, minH: 7 },
                category: 'Operations',
                default: true,
            }),
            new Widget({
                id: 'ledger-ar-aging-summary',
                name: label('ledger.extension.widgets.ar-aging-summary.name'),
                description: label('ledger.extension.widgets.ar-aging-summary.description'),
                icon: 'clock',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/ar-aging-summary'),
                grid_options: { w: 4, h: 8, minW: 4, minH: 7 },
                category: 'Operations',
                default: true,
            }),
            new Widget({
                id: 'ledger-wallet-balances',
                name: label('ledger.extension.widgets.wallet-balances.name'),
                description: label('ledger.extension.widgets.wallet-balances.description'),
                icon: 'wallet',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/wallet-balances'),
                grid_options: { w: 4, h: 8, minW: 4, minH: 7 },
                category: 'Operations',
                default: true,
            }),
            new Widget({
                id: 'ledger-activity-feed',
                name: label('ledger.extension.widgets.activity-feed.name'),
                description: label('ledger.extension.widgets.activity-feed.description'),
                icon: 'book',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/activity-feed'),
                grid_options: { w: 8, h: 10, minW: 6, minH: 8 },
                category: 'Operations',
                default: true,
            }),
            new Widget({
                id: 'ledger-report-shortcuts',
                name: label('ledger.extension.widgets.report-shortcuts.name'),
                description: label('ledger.extension.widgets.report-shortcuts.description'),
                icon: 'file-lines',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/report-shortcuts'),
                grid_options: { w: 4, h: 10, minW: 4, minH: 7 },
                category: 'Reports',
                default: true,
            }),

            new Widget({
                id: 'ledger-overview',
                name: label('ledger.extension.widgets.overview.name'),
                description: label('ledger.extension.widgets.overview.description'),
                icon: 'gauge-high',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/overview'),
                grid_options: { w: 12, h: 4, minW: 8, minH: 4 },
                options: { title: 'Financial Overview' },
                category: 'Legacy',
                default: false,
            }),
            new Widget({
                id: 'ledger-revenue-chart',
                name: label('ledger.extension.widgets.revenue-chart.name'),
                description: label('ledger.extension.widgets.revenue-chart.description'),
                icon: 'chart-line',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/revenue-chart'),
                grid_options: { w: 8, h: 6, minW: 6, minH: 6 },
                options: { title: 'Revenue Chart' },
                category: 'Legacy',
                default: false,
            }),
            new Widget({
                id: 'ledger-invoice-summary',
                name: label('ledger.extension.widgets.invoice-summary.name'),
                description: label('ledger.extension.widgets.invoice-summary.description'),
                icon: 'file-invoice-dollar',
                component: new ExtensionComponent('@fleetbase/ledger-engine', 'widget/invoice-summary'),
                grid_options: { w: 4, h: 6, minW: 3, minH: 5 },
                options: { title: 'Invoice Summary' },
                category: 'Legacy',
                default: false,
            }),
        ];

        const getWidgetById = (id = null, mutate = null) => {
            if (!id) return null;
            const widget = widgets.find((w) => w.id === id);
            if (typeof mutate === 'function') {
                mutate(widget);
            }
            return widget;
        };

        widgetService.registerDashboard('ledger');
        widgetService.registerWidgets('ledger', widgets);
        // Ledger's widgets on the shared default dashboard. `order` places them among every
        // extension's widgets (see fleet-ops' registerWidgets for the whole layout):
        //   20       Revenue, in the top KPI row beside Radar (10) and Active Orders (30)
        //   41-44    Expenses, Net Income, Outstanding AR, Overdue AR: the second KPI row
        //   150/165  Recent Financial Activity (10 rows) with Cash Flow Summary (9) under it,
        //            beside the console's Blog (160, 13 rows) and GitHub card (170, 6 rows).
        //            Cash Flow comes after the Blog so it lands under Activity, not beside it.
        // Ledger's own dashboard above keeps its full set, unordered.
        widgetService.registerWidgets('dashboard', [
            getWidgetById('ledger-kpi-revenue', (widget) => widget.setOption('order', 20)),
            getWidgetById('ledger-kpi-expenses', (widget) => widget.setOption('order', 41)),
            getWidgetById('ledger-kpi-net-income', (widget) => widget.setOption('order', 42)),
            getWidgetById('ledger-kpi-outstanding-ar', (widget) => widget.setOption('order', 43)),
            getWidgetById('ledger-kpi-overdue-ar', (widget) => widget.setOption('order', 44)),
            getWidgetById('ledger-activity-feed', (widget) => {
                widget.withGridOptions({ w: 6, minW: 6, h: 10, minH: 8 }).setOption('order', 150);
            }),
            getWidgetById('ledger-cash-flow-summary', (widget) => {
                widget.withGridOptions({ w: 6, minW: 5, h: 9, minH: 8 }).setOption('order', 165);
            }),
        ]);
    },
};
