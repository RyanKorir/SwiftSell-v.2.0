
export class SheetsAuthExpiredError extends Error {}

export const googleSheetsService = {
  /**
   * Creates a new spreadsheet in Google Sheets and populates it with data.
   */
  exportToSheets: async (accessToken: string, title: string, headers: string[], rows: any[][]) => {
    // 1. Create the spreadsheet
    const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: title,
        },
      }),
    });

    if (!createResponse.ok) {
      if (createResponse.status === 401) {
        throw new SheetsAuthExpiredError('Your Google session for Sheets access has expired.');
      }
      throw new Error(`Failed to create spreadsheet (${createResponse.status})`);
    }

    const spreadsheet = await createResponse.json();
    const spreadsheetId = spreadsheet.spreadsheetId;

    // 2. Add headers and rows
    const updateResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=RAW`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [headers, ...rows],
      }),
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to add data to spreadsheet (${updateResponse.status})`);
    }

    return spreadsheet;
  },

  /**
   * Generates a link to the spreadsheet.
   */
  getSpreadsheetUrl: (spreadsheetId: string) => {
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  }
};
