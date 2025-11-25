import { NextRequest } from 'next/server';

export interface DeviceInfo {
    device: string;
    os: string;
    browser: string;
}

export interface LocationInfo {
    location: string;
}

/**
 * Get client IP address from Next.js request
 * Checks multiple sources in priority order:
 * 1. x-forwarded-for (proxy/load balancer)
 * 2. x-real-ip (nginx proxy)
 * 3. CF-Connecting-IP (Cloudflare)
 * 4. True-Client-IP (Akamai/Cloudflare)
 * 5. Socket connection IP
 */
export function getClientIp(req: NextRequest): string {
    // Check x-forwarded-for header (most common for proxies)
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        const ip = forwarded.split(',')[0].trim();
        return normalizeIp(ip);
    }

    // Check x-real-ip header (nginx)
    const realIp = req.headers.get('x-real-ip');
    if (realIp) {
        return normalizeIp(realIp);
    }

    // Check Cloudflare header
    const cfIp = req.headers.get('cf-connecting-ip');
    if (cfIp) {
        return normalizeIp(cfIp);
    }

    // Check True-Client-IP (Akamai/Cloudflare Enterprise)
    const trueClientIp = req.headers.get('true-client-ip');
    if (trueClientIp) {
        return normalizeIp(trueClientIp);
    }

    // Fallback: try to get from socket (Next.js specific)
    // @ts-ignore - accessing internal property
    const socketIp = req.ip || req.socket?.remoteAddress;
    if (socketIp) {
        return normalizeIp(socketIp);
    }

    return 'unknown';
}

/**
 * Normalize IP address
 * - Remove IPv6 prefix (::ffff:)
 * - Convert IPv6 localhost (::1) to IPv4 (127.0.0.1)
 */
function normalizeIp(ip: string): string {
    let normalized = ip.trim();

    // Remove IPv6 prefix
    normalized = normalized.replace(/^::ffff:/, '');

    // Convert IPv6 localhost to IPv4
    if (normalized === '::1') {
        normalized = '127.0.0.1';
    }

    return normalized;
}

/**
 * Get device, OS, and browser from User-Agent header
 * Simple parsing without external libraries
 */
export function getDeviceInfo(req: NextRequest): DeviceInfo {
    const userAgent = req.headers.get('user-agent') || '';

    // Parse OS
    let os = 'Unknown OS';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS X')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    // Parse Browser
    let browser = 'Unknown Browser';
    if (userAgent.includes('Edg/')) browser = 'Edge';
    else if (userAgent.includes('Chrome/')) browser = 'Chrome';
    else if (userAgent.includes('Firefox/')) browser = 'Firefox';
    else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Opera') || userAgent.includes('OPR/')) browser = 'Opera';

    // Parse Device
    let device = 'Desktop';
    if (userAgent.includes('Mobile')) device = 'Mobile';
    else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) device = 'Tablet';

    return {
        device,
        os,
        browser,
    };
}

/**
 * Get location from IP address using ip-api.com (free tier)
 * Note: This is an async function that makes an API call
 */
export async function getLocationFromIp(ip: string): Promise<LocationInfo> {
    // Skip localhost and private IPs
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.') || ip.startsWith('172.17.') || ip.startsWith('172.18.') || ip.startsWith('172.19.') || ip.startsWith('172.20.') || ip.startsWith('172.21.') || ip.startsWith('172.22.') || ip.startsWith('172.23.') || ip.startsWith('172.24.') || ip.startsWith('172.25.') || ip.startsWith('172.26.') || ip.startsWith('172.27.') || ip.startsWith('172.28.') || ip.startsWith('172.29.') || ip.startsWith('172.30.') || ip.startsWith('172.31.')) {
        return { location: 'Local Network' };
    }

    try {
        // Use ip-api.com free tier (no API key required, 45 requests/minute)
        // Free tier supports HTTP only, but works reliably
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city`, {
            signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                const parts = [data.city, data.regionName, data.country].filter(Boolean);
                return { location: parts.length > 0 ? parts.join(', ') : 'Unknown Location' };
            }
        }
    } catch (error) {
        console.warn('Failed to fetch location from IP:', error);
        // Fallback: try ipapi.co (HTTPS, but requires API key for production)
        // For now, we'll just return unknown if ip-api.com fails
    }

    return { location: 'Unknown Location' };
}

/**
 * Get the real public IP address
 * If the detected IP is localhost, fetch the real public IP from an external service
 */
export async function getRealClientIp(req: NextRequest): Promise<string> {
    const detectedIp = getClientIp(req);

    // If it's a localhost IP, try to get the real public IP
    if (detectedIp === '127.0.0.1' || detectedIp === '::1' || detectedIp === 'unknown') {
        try {
            // Use a free IP detection service
            const response = await fetch('https://api.ipify.org?format=json', {
                signal: AbortSignal.timeout(3000), // 3 second timeout
            });

            if (response.ok) {
                const data = await response.json();
                return data.ip || detectedIp;
            }
        } catch (error) {
            console.warn('Failed to fetch real IP, using detected IP:', error);
        }
    }

    return detectedIp;
}
