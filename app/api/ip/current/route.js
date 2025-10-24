import { NextResponse } from 'next/server';
import ipMonitorService from '@/lib/ip-monitor-service';

export async function GET() {
    try {
        const ips = await ipMonitorService.getCurrentIPs();
        return NextResponse.json({ success: true, ips });
    } catch (error) {
        console.error('Error fetching current IPs:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST() {
    try {
        const result = await ipMonitorService.checkAndUpdateIPs();
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('Error checking IPs:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
