/**
 * Translate a raw value from the API (a status, environment or type such as
 * `partial_refund_pending`) into a display label.
 *
 * Looks up `ledger.<namespace>.<value>`; values without a translation fall back
 * to the humanized raw value, which is how they were displayed before.
 *
 * @param {Service} intl - The ember-intl service.
 * @param {String} value - The raw value, e.g. `paid` or `wallet_deposit`.
 * @param {String} [namespace='status'] - The translation group under `ledger.`.
 * @param {String} [fallback] - Label to use when there is no translation, e.g. one sent by the API.
 * @return {String}
 */
export default function ledgerLabel(intl, value, namespace = 'status', fallback = null) {
    if (value === null || value === undefined || value === '') {
        return value;
    }

    const raw = String(value);
    const key = `ledger.${namespace}.${raw
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_')}`;
    if (intl.exists(key)) {
        return intl.t(key);
    }

    if (fallback) {
        return fallback;
    }

    const words = raw.replace(/[_-]+/g, ' ').trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
}
