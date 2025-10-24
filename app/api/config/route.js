import { NextResponse } from 'next/server';
import ovhService from '@/lib/ovh-service';

export async function GET() {
    try {
        const config = ovhService.getConfig();
        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error('Error fetching config:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const newConfig = await request.json();
        ovhService.saveConfig(newConfig);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving config:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
