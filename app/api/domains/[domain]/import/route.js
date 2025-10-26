import { NextResponse } from 'next/server';
import ovhService from '@/lib/ovh-service';

export async function POST(request, { params }) {
    try {
        const { domain } = await params;
        const { zoneContent, replaceAll = false } = await request.json();
        
        if (!zoneContent) {
            return NextResponse.json(
                { success: false, error: 'Zone content is required' },
                { status: 400 }
            );
        }

        const results = await ovhService.importFromBind9(domain, zoneContent, replaceAll);
        
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;
        
        return NextResponse.json({ 
            success: true, 
            results,
            summary: {
                total: results.length,
                success: successCount,
                failed: failureCount
            }
        });
    } catch (error) {
        console.error('Error importing DNS zone:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
