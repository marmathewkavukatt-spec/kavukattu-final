import { NextRequest, NextResponse } from "next/server";
import { productionSecurity } from "@/lib/security-production";
import { withApiSecurity } from "@/lib/api-security-wrapper";

export const dynamic = "force-dynamic";

type SecurityEvent = {
  timestamp: string;
  ip: string;
  eventType: string;
};

async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
    const eventType = searchParams.get('eventType');
    const ip = searchParams.get('ip');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get all security events
    let events = productionSecurity.getSecurityEvents(limit);

    // Apply filters
    if (eventType) {
      events = events.filter(event => 
        event.eventType.toLowerCase().includes(eventType.toLowerCase())
      );
    }

    if (ip) {
      events = events.filter(event => event.ip === ip);
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      events = events.filter(event => 
        new Date(event.timestamp).getTime() >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate).getTime();
      events = events.filter(event => 
        new Date(event.timestamp).getTime() <= end
      );
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Generate summary statistics
    const summary = {
      totalEvents: events.length,
      eventTypes: getEventTypeCounts(events),
      topIPs: getTopIPs(events),
      timeRange: {
        start: events.length > 0 ? events[events.length - 1].timestamp : null,
        end: events.length > 0 ? events[0].timestamp : null
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        events,
        summary,
        filters: {
          limit,
          eventType,
          ip,
          startDate,
          endDate
        }
      }
    });

  } catch (error) {
    console.error('Security logs error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch security logs'
    }, { status: 500 });
  }
}

function getEventTypeCounts(events: SecurityEvent[]): Record<string, number> {
  return events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function getTopIPs(events: SecurityEvent[]): Array<{ ip: string; count: number }> {
  const ipCounts = events.reduce((acc, event) => {
    acc[event.ip] = (acc[event.ip] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(ipCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, count: count as number }));
}

export const GET = withApiSecurity(handler);
