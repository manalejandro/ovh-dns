import { NextResponse } from 'next/server';
import ovhService from '@/lib/ovh-service';

export async function GET() {
    try {
        const domains = await ovhService.getAllDomains();
        return NextResponse.json({ success: true, domains });
    } catch (error) {
        console.error('Error fetching domains:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
