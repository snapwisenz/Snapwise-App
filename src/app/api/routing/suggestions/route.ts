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
    let driveTimeMinutes = 0;
    
    // Find the immediately preceding booking on that date
    // We'll look for the latest booking on the selected date to calculate drive time from
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    if (!dateStr) {
       targetDate.setDate(targetDate.getDate() + 1); // default to tomorrow
    }
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23,59,59,999);

    const { data: prevBookings } = await supabase
      .from('bookings')
      .select('shoot_location')
      .eq('photographer_id', photographer.id)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .order('start_time', { ascending: false })
      .limit(1);

    const previousLocation = prevBookings && prevBookings.length > 0 ? prevBookings[0].shoot_location : null;

    if (previousLocation && apiKey) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
            previousLocation
          )}&destinations=${encodeURIComponent(
            address
          )}&departure_time=now&key=${apiKey}`
        );
        const data = await response.json();
        if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
          const durationInSeconds = data.rows[0].elements[0].duration_in_traffic ? 
            data.rows[0].elements[0].duration_in_traffic.value : 
            data.rows[0].elements[0].duration.value;
          
          driveTimeMinutes = Math.ceil((durationInSeconds / 60) / 10) * 10;
          weight -= driveTimeMinutes; // deduct drive time from weight
        }
      } catch (e) {
        console.error('Error fetching drive time for suggestion:', e);
      }
    }

    if (driveTimeMinutes > 0) {
      matchedReasons.push(`+${driveTimeMinutes}m drive from prev`);
    } else {
      matchedReasons.push('First job / 0m drive');
    }

    const firstName = (photographer.full_name || photographer.email || 'The photographer').split(' ')[0];
    let insight_text = '';
    
    if (isClientPreferred) {
      insight_text = `${firstName} is the preferred photographer for this client.`;
    } else if (matchedRegion) {
      insight_text = `${firstName} covers the ${matchedRegion} region.`;
    } else if (driveTimeMinutes > 0 && driveTimeMinutes <= 45) {
      insight_text = `${firstName} is already in the area and is a ${driveTimeMinutes}-minute drive away.`;
    } else if (photographer.is_global_preferred) {
      insight_text = `${firstName} is a top-rated global default photographer.`;
    } else {
      insight_text = `${firstName} is available for this slot.`;
    }

    return {
      photographer_id: photographer.id,
      name: photographer.full_name || photographer.email || 'Unnamed',
      weight,
      reasons: matchedReasons,
      driveTimeMinutes,
      insight_text
    };
  }));

  // Sort descending by weight
  suggestions.sort((a, b) => b.weight - a.weight);

  return NextResponse.json({ suggestions });
}
