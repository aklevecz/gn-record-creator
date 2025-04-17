import mondayServerApi from '$lib/api/monday.server';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { boardId } = params;

  try {
    const boardData = await mondayServerApi.getBoardById(Number(boardId));
    if (!boardData?.data?.boards?.length) {
      throw error(404, 'Board not found');
    }

    const board = boardData.data.boards[0];

    // Define the types
    /**
     * @typedef {object} Column
     * @property {string} id
     * @property {string} title
     * @property {string} type
     */
    /**
     * @typedef {object} ColumnValue
     * @property {Column} column
     * @property {string} text
     * @property {string} value
     */
    /**
     * @typedef {object} Item
     * @property {string} id
     * @property {string} name
     * @property {ColumnValue[]} column_values
     */

    // Extract total units for each item
    const itemUnits = board.items_page.items.map((/** @type {Item} */ item) => {
      /** @type {ColumnValue | undefined} */
      const totalUnitsColumn = item.column_values.find((/** @type {ColumnValue} */ col) => col.column.title === 'Total Units');
      return parseInt(totalUnitsColumn?.text || '0', 10);
    });

    return {
      board,
      itemUnits,
    };
  } catch (e) {
    throw error(500, 'Failed to load board data');
  }
}