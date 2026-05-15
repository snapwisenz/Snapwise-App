export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { nylas } from '@/utils/nylas';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const photographerId = searchParams.get('photographer_id');
  const startParam = searchParams.get('start');
  const endParam = searchParams.get('end');

  if (!photographerId || !startParam || !endParam) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const startDate = new Date(startParam);
  const endDate = new Date(endParam);
  
  const supabase = await createClient();

  // 1. Fetch Supabase Bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('photographer_id', photographerId)
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString())
    .neq('status', 'cancelled');

  let internalEvents: any[] = [];
  if (bookings) {
    internalEvents = bookings.map(b => ({
      id: b.id,
      title: b.shoot_location || 'Internal Booking',
      startTime: new Date(b.start_time).getTime(),
      endTime: new Date(b.end_time).getTime(),
      isExternal: false,
    }));
  }

  // 2. Fetch Nylas External Events
  const { data: profile } = await supabase
    .from('profiles')
    .select('nylas_grant_id, email')
    .eq('id', photographerId)
    .single();

  let externalEvents: any[] = [];
  if (profile?.nylas_grant_id) {
    try {
      const nylasEvents = await nylas.events.list({
        identifier: profile.nylas_grant_id,
        queryParams: {
          calendarId: 'primary',
          start: Math.floor(startDate.getTime() / 1000),
          end: Math.floor(endDate.getTime() / 1000),
        } as any
      });
      
      if (nylasEvents.data) {
        externalEvents = nylasEvents.data
          .filter((ne: any) => !bookings?.some(b => b.nylas_event_id === ne.id))
          .map((ne: any) => {
            let sTime = 0;
            let eTime = 0;
            if (ne.when?.startTime && ne.when?.endTime) {
              sTime = ne.when.startTime * 1000;
              eTime = ne.when.endTime * 1000;
            } else if (ne.when?.date) {
              sTime = new Date(ne.when.date).getTime();
              eTime = sTime + 86400000;
            } else if (ne.when?.start_time && ne.when?.end_time) {
               sTime = ne.when.start_time * 1000;
               eTime = ne.when.end_time * 1000;
            }
            return {
              id: ne.id,
              title: ne.title || 'Busy (External)',
              startTime: sTime,
              endTime: eTime,
              isExternal: true,
            };
          }).filter((e: any) => e.startTime > 0);
      }
    } catch (err) {
      console.error('Error fetching Nylas events:', err);
    }
  }

  const allEvents = [...internalEvents, ...externalEvents];
  
  // 3. Map events to SmartScheduleGrid format
  const mappedEvents = allEvents.map(e => {
    const eStart = new Date(e.startTime);
    const eEnd = new Date(e.endTime);
    
    const dayStart = new Date(startDate);
    dayStart.setHours(0,0,0,0);
    const eStartDay = new Date(eStart);
    eStartDay.setHours(0,0,0,0);
    
    const dayIdx = Math.round((eStartDay.getTime() - dayStart.getTime()) / 86400000);
    
    const startHour = eStart.getHours() + eStart.getMinutes() / 60;
    const endHour = eEnd.getHours() + eEnd.getMinutes() / 60;
    
    return {
      ...e,
      dayIdx,
      startHour,
      endHour
    };
  });

  return NextResponse.json({ events: mappedEvents });
}
