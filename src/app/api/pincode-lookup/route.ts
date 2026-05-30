import { NextResponse } from 'next/server';
import { z } from 'zod';

const pincodeSchema = z.object({
  pincode: z.string().length(6).regex(/^\d+$/),
});

// Simple in-memory cache to prevent repeatedly calling the postal API for the same pincode
const pincodeCache = new Map<string, string>();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');

    const result = pincodeSchema.safeParse({ pincode });
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid pincode format' }, { status: 400 });
    }

    const validPincode = result.data.pincode;

    // Check cache
    if (pincodeCache.has(validPincode)) {
      return NextResponse.json({ pincode: validPincode, areaName: pincodeCache.get(validPincode) });
    }

    // Call external API with a timeout
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const response = await fetch(`https://api.postalpincode.in/pincode/${validPincode}`, {
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`Postal API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice)) {
      const postOffices = data[0].PostOffice;
      if (postOffices.length > 0) {
        // Construct the area name using Name, District and State
        const representativeOffice = postOffices[0];
        const name = representativeOffice.Name;
        const district = representativeOffice.District;
        const state = representativeOffice.State;

        const areaParts: string[] = [];
        if (name) areaParts.push(name);
        if (district && district !== name) areaParts.push(district);
        if (state && state !== district) areaParts.push(state);

        const areaName = areaParts.join(', ');
        pincodeCache.set(validPincode, areaName);

        return NextResponse.json({ pincode: validPincode, areaName });
      }
    }

    return NextResponse.json({ pincode: validPincode, areaName: null });
  } catch (error: unknown) {
    console.error('Pincode lookup error:', error);
    return NextResponse.json({ pincode: null, areaName: null });
  }
}
