import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');

  if (!origin || !destination) {
    return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 });
  }

  try {
    // Call Google Maps Distance Matrix API
    // Using departure_time=now to get duration_in_traffic
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        origin
      )}&destinations=${encodeURIComponent(
        destination
      )}&departure_time=now&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json({ error: 'Failed to fetch from Google Maps', details: data }, { status: 500 });
    }

    const element = data.rows[0].elements[0];

    if (element.status !== 'OK') {
      return NextResponse.json({ error: `Route calculation failed: ${element.status}` }, { status: 400 });
    }

    // Grab the duration in traffic (or fallback to standard duration)
    const durationInSeconds = element.duration_in_traffic ? element.duration_in_traffic.value : element.duration.value;
    
    // Paige Rule: Convert to minutes and round up to the nearest 10
    const rawMinutes = durationInSeconds / 60;
    const roundedMinutes = Math.ceil(rawMinutes / 10) * 10;

    return NextResponse.json({
      success: true,
      raw_seconds: durationInSeconds,
      raw_minutes: rawMinutes,
      rounded_minutes: roundedMinutes,
      distance_text: element.distance.text,
      duration_text: element.duration_in_traffic ? element.duration_in_traffic.text : element.duration.text
    });
  } catch (error) {
    console.error('Error fetching distance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
