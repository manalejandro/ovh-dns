import { NextResponse } from 'next/server';
import ovhService from '@/lib/ovh-service';

export async function GET(request, { params }) {
    try {
        const { domain } = await params;
        
        // Get all records
        const records = await ovhService.getDNSRecords(domain);
        
        // Export to BIND9 format
        const zoneFile = ovhService.exportToBind9(domain, records);
        
        return new NextResponse(zoneFile, {
            headers: {
                'Content-Type': 'text/plain',
                'Content-Disposition': `attachment; filename="${domain}.zone"`
            }
        });
    } catch (error) {
        console.error('Error exporting DNS zone:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
