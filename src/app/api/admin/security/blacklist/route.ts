import { NextRequest, NextResponse } from "next/server";
import { productionSecurity } from "@/lib/security-production";
import { withApiSecurity, parseSecureJSON } from "@/lib/api-security-wrapper";

export const dynamic = "force-dynamic";

async function getHandler(request: NextRequest) {
  void request;
  try {
    const blacklistedIPs = productionSecurity.getBlacklistedIPs();
    
    return NextResponse.json({
      success: true,
      data: {
        blacklistedIPs,
        count: blacklistedIPs.length
      }
    });

  } catch (error) {
    console.error('Get blacklist error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch blacklisted IPs'
    }, { status: 500 });
  }
}

async function postHandler(request: NextRequest) {
  try {
    const body = await parseSecureJSON(request) as { ip?: unknown; reason?: unknown };
    const { ip, reason } = body;

    if (!ip || typeof ip !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Valid IP address is required'
      }, { status: 400 });
    }

    // Validate IP format
    if (!isValidIP(ip)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid IP address format'
      }, { status: 400 });
    }

    const blacklistReason = typeof reason === "string" && reason.trim()
      ? reason
      : 'Manually blacklisted by admin';
    productionSecurity.blacklistIP(ip, blacklistReason);

    productionSecurity.logSecurityEvent(request, 'IP_MANUALLY_BLACKLISTED', {
      ip,
      reason: blacklistReason,
      admin: "admin"
    });

    return NextResponse.json({
      success: true,
      message: `IP ${ip} has been blacklisted`,
      data: { ip, reason: blacklistReason }
    });

  } catch (error) {
    console.error('Blacklist IP error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to blacklist IP'
    }, { status: 500 });
  }
}

async function deleteHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get('ip');

    if (!ip) {
      return NextResponse.json({
        success: false,
        error: 'IP address is required'
      }, { status: 400 });
    }

    productionSecurity.unblacklistIP(ip);

    productionSecurity.logSecurityEvent(request, 'IP_MANUALLY_UNBLACKLISTED', {
      ip,
      admin: "admin"
    });

    return NextResponse.json({
      success: true,
      message: `IP ${ip} has been removed from blacklist`,
      data: { ip }
    });

  } catch (error) {
    console.error('Unblacklist IP error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove IP from blacklist'
    }, { status: 500 });
  }
}

function isValidIP(ip: string): boolean {
  // IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part);
      return num >= 0 && num <= 255;
    });
  }

  // IPv6 validation (basic)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv6Regex.test(ip);
}

export const GET = withApiSecurity(getHandler);

export const POST = withApiSecurity(postHandler);

export const DELETE = withApiSecurity(deleteHandler);
