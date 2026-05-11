'use server';

import { createClient } from '@/utils/supabase/server';
import { syncBookingToCalendar } from '@/utils/calendar';
import { revalidatePath } from 'next/cache';

export async function updateBookingStatus(bookingId: string, newStatus: 'scheduled' | 'completed' | 'cancelled') {
  const supabase = await createClient();

  // First fetch the booking details
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, error: 'Booking not found' };
  }

  // Update status in Supabase
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId);

  if (updateError) {
    return { success: false, error: 'Failed to update booking status' };
  }

  // Handle Nylas Sync
  const updatedBooking = { ...booking, status: newStatus };
  let syncResult;

  if (newStatus === 'scheduled') {
    if (booking.nylas_event_id) {
      syncResult = await syncBookingToCalendar(updatedBooking, 'update');
    } else {
      syncResult = await syncBookingToCalendar(updatedBooking, 'create');
    }
  } else if (newStatus === 'cancelled' && booking.nylas_event_id) {
    syncResult = await syncBookingToCalendar(updatedBooking, 'delete');
  }

  revalidatePath('/dashboard');
  revalidatePath(`/bookings/${bookingId}`);

  return { success: true, syncResult };
}

export async function rescheduleBooking(bookingId: string, newStartTime: string, newEndTime: string, newBufferEnd: string) {
  const supabase = await createClient();

  // Fetch the booking details
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, error: 'Booking not found' };
  }

  // Update times in Supabase
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ 
      start_time: newStartTime,
      end_time: newEndTime,
      upload_buffer_end: newBufferEnd,
    })
    .eq('id', bookingId);

  if (updateError) {
    return { success: false, error: 'Failed to update booking times' };
  }

  // Handle Nylas Sync
  const updatedBooking = { 
    ...booking, 
    start_time: newStartTime,
    end_time: newEndTime,
    upload_buffer_end: newBufferEnd,
  };

  let syncResult;
  // Only sync if it's already scheduled and has an event ID
  if (booking.status === 'scheduled' && booking.nylas_event_id) {
    syncResult = await syncBookingToCalendar(updatedBooking, 'update');
  } else if (booking.status === 'scheduled' && !booking.nylas_event_id) {
    syncResult = await syncBookingToCalendar(updatedBooking, 'create');
  }

  revalidatePath('/dashboard');
  revalidatePath(`/bookings/${bookingId}`);

  return { success: true, syncResult };
}
