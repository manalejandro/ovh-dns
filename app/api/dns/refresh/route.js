import { NextResponse } from 'next/server';
import ovhService from '@/lib/ovh-service';

export async function POST(request) {
    try {
        const { domain } = await request.json();
        
        if (!domain) {
            return NextResponse.json(
                { success: false, error: 'Domain is required' },
                { status: 400 }
            );
        }

        await ovhService.refreshZone(domain);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error refreshing DNS zone:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
