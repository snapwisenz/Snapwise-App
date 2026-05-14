import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');
  const agency_id = searchParams.get('agency_id');
  const dateStr = searchParams.get('date');

  if (!address || !agency_id) {
    return NextResponse.json({ error: 'Address and agency_id are required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Fetch agency to get preferred_photographer_id
  const { data: agency } = await supabase
    .from('agencies')
    .select('preferred_photographer_id')
    .eq('id', agency_id)
    .single();

  // Fetch all photographers
  const { data: photographers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'photographer');

  if (!photographers || photographers.length === 0) {
    return NextResponse.json({ suggestions: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // Calculate weights for each photographer
  const suggestions = await Promise.all(photographers.map(async (photographer) => {
    let weight = 0;
    const matchedReasons = [];

    // Priority 1: Client Preference
    let isClientPreferred = agency?.preferred_photographer_id === photographer.id;
    if (isClientPreferred) {
      weight += 1000;
      matchedReasons.push('Client Preferred');
    }

    // Priority 2: Global Preferred
    if (photographer.is_global_preferred) {
      weight += 500;
      matchedReasons.push('Global Default');
    }

    // Priority 3: Territory Match
    let inTerritory = false;
    let matchedRegion = null;
    if (photographer.service_regions && Array.isArray(photographer.service_regions)) {
      const addressLower = address.toLowerCase();
      matchedRegion = photographer.service_regions.find((region: string) => 
        addressLower.includes(region.toLowerCase())
      );
      if (matchedRegion) {
        inTerritory = true;
        weight += 250;
        matchedReasons.push('In Territory');
      }
    }

    // Priority 4: Logistics (Drive time)
    let inboundDriveMinutes = 0;
    let outboundDriveMinutes = 0;
    let suggestedTime = '09:00 AM'; // default suggested time
    let isLastJob = true;
    
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    if (!dateStr) {
       targetDate.setDate(targetDate.getDate() + 1); // default to tomorrow
    }
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23,59,59,999);

    const { data: dayBookings } = await supabase
      .from('bookings')
      .select('start_time, end_time, shoot_location')
      .eq('photographer_id', photographer.id)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .order('start_time', { ascending: true });

    // For simplicity in this iteration, we append to the end of their existing day
    let prevLocation = photographer.base_address;
    let nextLocation = photographer.base_address; // End of day

    if (dayBookings && dayBookings.length > 0) {
      const lastBooking = dayBookings[dayBookings.length - 1];
      prevLocation = lastBooking.shoot_location;
      
      // Calculate suggested time (e.g., 1 hour after previous booking ends)
      const lastEndTime = new Date(lastBooking.end_time || lastBooking.start_time);
      lastEndTime.setHours(lastEndTime.getHours() + 1); // Add buffer
      suggestedTime = lastEndTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    if (apiKey) {
      try {
        // Calculate Inbound
        if (prevLocation) {
          const inboundRes = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(prevLocation)}&destinations=${encodeURIComponent(address)}&departure_time=now&key=${apiKey}`
          );
          const inboundData = await inboundRes.json();
          if (inboundData.status === 'OK' && inboundData.rows[0].elements[0].status === 'OK') {
            const duration = inboundData.rows[0].elements[0].duration_in_traffic ? inboundData.rows[0].elements[0].duration_in_traffic.value : inboundData.rows[0].elements[0].duration.value;
            inboundDriveMinutes = Math.ceil((duration / 60) / 5) * 5; // round to nearest 5m
            weight -= inboundDriveMinutes;
          }
        }

        // Calculate Outbound
        if (nextLocation) {
          const outboundRes = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(address)}&destinations=${encodeURIComponent(nextLocation)}&departure_time=now&key=${apiKey}`
          );
          const outboundData = await outboundRes.json();
          if (outboundData.status === 'OK' && outboundData.rows[0].elements[0].status === 'OK') {
            const duration = outboundData.rows[0].elements[0].duration_in_traffic ? outboundData.rows[0].elements[0].duration_in_traffic.value : outboundData.rows[0].elements[0].duration.value;
            outboundDriveMinutes = Math.ceil((duration / 60) / 5) * 5;
            weight -= outboundDriveMinutes;
          }
        }
      } catch (e) {
        console.error('Error fetching dual drive times:', e);
      }
    }

    const prevContext = (dayBookings && dayBookings.length > 0) ? 'previous shoot' : 'base';
    const nextContext = isLastJob ? 'home' : 'next shoot';
    
    let driveText = '';
    if (inboundDriveMinutes > 0 || outboundDriveMinutes > 0) {
      driveText = `${inboundDriveMinutes}m drive from ${prevContext} • ${outboundDriveMinutes}m drive ${nextContext}`;
    } else {
      driveText = `0m drive (First job of day)`;
    }

    let insight_text = driveText;

    return {
      photographer_id: photographer.id,
      name: photographer.full_name || photographer.email || 'Unnamed',
      suggested_time: suggestedTime,
      weight,
      reasons: matchedReasons,
      inboundDriveMinutes,
      outboundDriveMinutes,
      insight_text
    };
  }));

  // Sort descending by weight
  suggestions.sort((a, b) => b.weight - a.weight);

  return NextResponse.json({ suggestions });
}
