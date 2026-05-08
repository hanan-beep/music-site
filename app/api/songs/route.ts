export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const album = searchParams.get('album');
  
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  const url = album
    ? `https://api.airtable.com/v0/${baseId}/tblsdE3MlSxr1zY1U?filterByFormula=({שם האלבום}="${album}")`
    : `https://api.airtable.com/v0/${baseId}/tblsdE3MlSxr1zY1U`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const data = await res.json();
  return Response.json(data.records);
}