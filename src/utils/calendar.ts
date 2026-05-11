import { nylas } from './nylas';
import { createClient } from '@/utils/supabase/server';

export async function getUserNylasGrant(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('nylas_grant_id, email')
    .eq('id', userId)
    .single();

  if (error || !data?.nylas_grant_id) {
    return null;
  }
  return data;
}

export async function checkAvailability(dateStr: string, userId: string) {
  const userData = await getUserNylasGrant(userId);
  if (!userData) {
    return { available: true, error: 'User not connected to calendar' };
  }

  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const freeBusyResponse = await nylas.calendars.getFreeBusy({
      identifier: userData.nylas_grant_id,
      requestBody: {
        startTime: Math.floor(startOfDay.getTime() / 1000),
        endTime: Math.floor(endOfDay.getTime() / 1000),
        emails: [userData.email],
      },
    });

    return { available: true, data: freeBusyResponse.data };
  } catch (error) {
    console.error('Error checking availability:', error);
    return { available: false, error: 'Failed to fetch availability' };
  }
}

export async function syncBookingToCalendar(booking: any, action: 'create' | 'update' | 'delete') {
  // Use photographer_id or agent_id depending on who the calendar belongs to.
  // Assuming photographer for now as they are doing the work.
  const userId = booking.photographer_id; 
  if (!userId) return { success: false, error: 'No photographer assigned' };

  const userData = await getUserNylasGrant(userId);
  if (!userData) {
    return { success: false, error: 'Photographer not connected to calendar' };
  }

  const grantId = userData.nylas_grant_id;
  const supabase = await createClient();

  try {
    if (action === 'create' && booking.status === 'scheduled') {
      const event = await nylas.events.create({
        identifier: grantId,
        queryParams: { calendarId: 'primary' },
        requestBody: {
          title: booking.shoot_location || booking.address || 'Photography Booking',
          when: {
            startTime: Math.floor(new Date(booking.start_time).getTime() / 1000),
            endTime: Math.floor(new Date(booking.upload_buffer_end).getTime() / 1000),
          },
        },
      });
      
      // Save event ID back to Supabase
      await supabase
        .from('bookings')
        .update({ nylas_event_id: event.data.id })
        .eq('id', booking.id);
        
      return { success: true, eventId: event.data.id };
    } 
    
    else if (action === 'update' && booking.nylas_event_id) {
      if (booking.status === 'cancelled') {
        // Just call delete if status is cancelled
        return syncBookingToCalendar(booking, 'delete');
      }

      await nylas.events.update({
        identifier: grantId,
        eventId: booking.nylas_event_id,
        queryParams: { calendarId: 'primary' },
        requestBody: {
          title: booking.shoot_location || booking.address || 'Photography Booking',
          when: {
            startTime: Math.floor(new Date(booking.start_time).getTime() / 1000),
            endTime: Math.floor(new Date(booking.upload_buffer_end).getTime() / 1000),
          },
        },
      });
      return { success: true };
    } 
    
    else if (action === 'delete' && booking.nylas_event_id) {
      await nylas.events.destroy({
        identifier: grantId,
        eventId: booking.nylas_event_id,
        queryParams: { calendarId: 'primary' },
      });
      
      await supabase
        .from('bookings')
        .update({ nylas_event_id: null })
        .eq('id', booking.id);
        
      return { success: true };
    }

    return { success: false, error: 'Invalid action or missing event ID' };

  } catch (error) {
    console.error(`Error ${action} calendar event:`, error);
    return { success: false, error: 'API Error' };
  }
}
