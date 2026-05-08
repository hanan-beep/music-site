import { Agent } from 'https';

export async function GET() {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;

  const res = await fetch(
    `https://api.airtable.com/v0/${baseId}/${tableId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
      // @ts-ignore
      agent: new Agent({ rejectUnauthorized: false }),
    }
  );

  const data = await res.json();
  return Response.json(data.records);
}