import { NextResponse } from 'next/server';
import ovhService from '@/lib/ovh-service';

export async function POST(request) {
    try {
        const { domain, recordIds, fieldType, target, ttl } = await request.json();
        
        if (!domain || !recordIds || recordIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Domain and record IDs are required' },
                { status: 400 }
            );
        }

        const updateData = {};
        if (fieldType) updateData.fieldType = fieldType;
        if (target !== undefined) updateData.target = target;
        if (ttl) updateData.ttl = ttl;

        const results = await ovhService.bulkUpdateRecords(domain, recordIds, updateData);
        
        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error('Error bulk updating DNS records:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
