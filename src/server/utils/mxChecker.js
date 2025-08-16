import { resolveMx, setServers } from 'node:dns/promises';

// Use public DNS servers to ensure MX lookups work in most environments
setServers(['8.8.8.8', '1.1.1.1']);

export async function validateDomain(email) {
    const atIndex = email.lastIndexOf('@');
    if (atIndex === -1) {
        return false; // not a valid email format
    }

    const domain = email.slice(atIndex + 1);
    if (!domain) {
        return false;
    }

    try {
        const records = await resolveMx(domain);
        return Array.isArray(records) && records.length > 0; // true if at least one MX host exists
    } catch {
        return false;
    }
}
