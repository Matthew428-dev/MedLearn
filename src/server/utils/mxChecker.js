import { resolveMx } from 'node:dns/promises';

export async function validateDomain(email) {
    const domain = email.substring(email.indexOf('@')+1);
    const records = await resolveMx(domain).catch(() => []);
    return records.length > 0;        // true if at least one MX host exists
}
