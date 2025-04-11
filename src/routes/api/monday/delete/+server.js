import { json } from '@sveltejs/kit';
import { MONDAY_API_TOKEN } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const { itemId } = await request.json();

  const query = `
    mutation {
      delete_item (item_id: ${itemId}) {
        id
      }
    }
  `;

  const variables = {};

  const url = "https://api.monday.com/v2";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": MONDAY_API_TOKEN
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query, variables })
    });

    const response = await res.json();
    console.log(response);

    return json({ success: true, data: response });
  } catch (error) {
    console.error(error);
    return json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
}