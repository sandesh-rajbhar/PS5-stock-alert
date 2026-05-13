import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('stock_status')
      .select('*')
      .order('platform', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Stock status fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch stock status' }, { status: 500 });
  }
}
