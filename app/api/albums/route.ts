export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get('artist');
  
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  const url = artist
    ? `https://api.airtable.com/v0/${baseId}/tblOms7aYJUPR9GlI?filterByFormula=({שם הזמר}="${artist}")`
    : `https://api.airtable.com/v0/${baseId}/tblOms7aYJUPR9GlI`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const data = await res.json();
  return Response.json(data.records);
}