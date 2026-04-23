import { NextRequest, NextResponse } from "next/server";
import { productionSecurity } from "@/lib/security-production";
import { withApiSecurity } from "@/lib/api-security-wrapper";

async function handler(request: NextRequest) {
  try {
    const metrics = productionSecurity.getSecurityMetrics();
    const recentEvents = productionSecurity.getSecurityEvents(50);
    const blacklistedIPs = productionSecurity.getBlacklistedIPs();

    // Additional system metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    // Security status
    const securityStatus = {
      level: getSecurityLevel(metrics),
      alerts: getActiveAlerts(recentEvents),
      recommendations: getSecurityRecommendations(metrics)
    };

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        recentEvents,
        blacklistedIPs,
        systemMetrics,
        securityStatus
      }
    });

  } catch (error) {
    console.error('Security dashboard error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch security dashboard data'
    }, { status: 500 });
  }
}

function getSecurityLevel(metrics: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const { blockedRequests, attackAttempts, totalEvents } = metrics;
  
  if (attackAttempts > 50 || blockedRequests > 100) return 'CRITICAL';
  if (attackAttempts > 20 || blockedRequests > 50) return 'HIGH';
  if (attackAttempts > 5 || blockedRequests > 20) return 'MEDIUM';
  return 'LOW';
}

function getActiveAlerts(events: any[]): string[] {
  const alerts: string[] = [];
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  
  const recentEvents = events.filter(event => 
    new Date(event.timestamp).getTime() > fiveMinutesAgo
  );

  // Check for multiple failed login attempts
  const failedLogins = recentEvents.filter(e => e.eventType === 'AUTH_FAILED').length;
  if (failedLogins > 5) {
    alerts.push(`${failedLogins} failed login attempts in the last 5 minutes`);
  }

  // Check for rate limit violations
  const rateLimitViolations = recentEvents.filter(e => 
    e.eventType.includes('RATE_LIMIT')
  ).length;
  if (rateLimitViolations > 10) {
    alerts.push(`${rateLimitViolations} rate limit violations in the last 5 minutes`);
  }

  // Check for attack attempts
  const attacks = recentEvents.filter(e => 
    e.eventType.includes('ATTACK') || e.eventType.includes('SUSPICIOUS')
  ).length;
  if (attacks > 3) {
    alerts.push(`${attacks} potential attack attempts detected`);
  }

  return alerts;
}

function getSecurityRecommendations(metrics: any): string[] {
  const recommendations: string[] = [];
  
  if (metrics.attackAttempts > 10) {
    recommendations.push('Consider implementing additional IP filtering');
  }
  
  if (metrics.blockedRequests > 50) {
    recommendations.push('Review and adjust rate limiting settings');
  }
  
  if (metrics.blacklistedIPs > 20) {
    recommendations.push('Review blacklisted IPs and consider automated cleanup');
  }
  
  if (metrics.uniqueIPs > 1000) {
    recommendations.push('High traffic detected - monitor for DDoS patterns');
  }

  return recommendations;
}

export const GET = withApiSecurity(handler, {
  requireAuth: true,
  requiredRole: 'admin',
  rateLimit: true
});