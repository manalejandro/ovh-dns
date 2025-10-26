import { NextResponse } from 'next/server';
import ovhService from '@/lib/ovh-service';

export async function POST(request, { params }) {
    try {
        const { domain } = await params;
        const { recordIds } = await request.json();
        
        if (!recordIds || recordIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Record IDs are required' },
                { status: 400 }
            );
        }

        const results = await ovhService.bulkDeleteRecords(domain, recordIds);
        
        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error('Error bulk deleting DNS records:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
