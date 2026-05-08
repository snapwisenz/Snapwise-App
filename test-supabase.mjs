const url = 'https://mdnpbecqxttpourmopro.supabase.co/rest/v1/agencies?select=*&limit=1';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kbnBiZWNxeHR0cG91cm1vcHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MDE4MzAsImV4cCI6MjA5Mjk3NzgzMH0.hWYP2Kbligp2bo_n-fN0loXjjnxDnj7Q-MfxqGxXuiU';

async function check() {
  const res = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', text);
}
check();
