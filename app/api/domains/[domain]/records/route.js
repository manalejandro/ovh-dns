import { NextResponse } from 'next/server';
import ovhService from '@/lib/ovh-service';

export async function GET(request, { params }) {
    try {
        const { domain } = await params;
        const records = await ovhService.getDNSRecords(domain);
        return NextResponse.json({ success: true, records });
    } catch (error) {
        console.error('Error fetching DNS records:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    try {
        const { domain } = await params;
        const recordData = await request.json();
        
        const record = await ovhService.createDNSRecord(domain, recordData);
        return NextResponse.json({ success: true, record });
    } catch (error) {
        console.error('Error creating DNS record:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { domain } = await params;
        const { id, ...recordData } = await request.json();
        
        const record = await ovhService.updateDNSRecord(domain, id, recordData);
        return NextResponse.json({ success: true, record });
    } catch (error) {
        console.error('Error updating DNS record:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { domain } = await params;
        const { searchParams } = new URL(request.url);
        const recordId = searchParams.get('recordId');
        
        if (!recordId) {
            return NextResponse.json(
                { success: false, error: 'Record ID is required' },
                { status: 400 }
            );
        }
        
        await ovhService.deleteDNSRecord(domain, recordId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting DNS record:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
