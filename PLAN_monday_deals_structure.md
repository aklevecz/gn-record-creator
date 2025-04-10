# Plan: Monday.com Deals Board Structure Visualization Page

This page will describe the structure of the Monday.com Deals Board (ID: 6253075642), showing its groups/stages and columns/fields, rather than the actual deal data.

## Steps

1.  **Create a New Route:** Create a new SvelteKit page at `/admin/monday-deals-structure`.
2.  **Fetch Column Data:** Use the existing server-side function `mondayServer.getBoardColumnInfo(DEAL_TRACKER_BOARD_ID)` in the new route's server load function (`+page.server.js`) to fetch details about each column (Title, Type, settings_str).
3.  **Utilize Existing Mappings:** Use the hardcoded mappings in `src/lib/api/monday.server.js` (specifically `dealTrackerGroupIdToTitle`) to display the human-readable names for the board's groups (stages).
4.  **Build the Page (`+page.svelte`):**
    *   Display the Board Name ("Deals Board").
    *   List the Groups/Stages using the `dealTrackerGroupIdToTitle` mapping.
    *   Create a table to display the Columns/Fields fetched in step 2. The table will show:
        *   Column Title
        *   Column Type
        *   Relevant Details (e.g., parse `settings_str` for 'status'/'dropdown' options).
5.  **Implement Server Load (`+page.server.js`):** Fetch the column data using the API function before the page loads.

## Diagram

```mermaid
graph TD
    A[User visits /admin/monday-deals-structure] --> B{+page.server.js Load Function};
    B --> C[Call mondayServer.getBoardColumnInfo(DEAL_TRACKER_BOARD_ID)];
    C --> D{Monday API};
    D --> C;
    C --> B;
    B --> E{+page.svelte};
    F[monday.server.js Mappings (Groups)] --> E;
    E --> G[Display Board Structure Page];