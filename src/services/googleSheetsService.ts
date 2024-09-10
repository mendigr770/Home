import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.REACT_APP_SPREADSHEET_ID || '');

async function initializeSheet() {
  await doc.useServiceAccountAuth({
    client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  });
  await doc.loadInfo();
}

const handleApiError = (error: any) => {
  console.error('API Error:', error);
  throw new Error('Failed to perform operation');
};

export async function fetchCategories(): Promise<string[]> {
  try {
    await initializeSheet();
    const sheet = doc.sheetsByIndex[2]; // Budget sheet
    const rows = await sheet.getRows();
    return rows.length > 0 ? rows.map(row => row['קטגוריה'] || row.קטגוריה) : [];
  } catch (error) {
    return handleApiError(error);
  }
}

export async function addExpense(amount: number, description: string, category: string) {
  try {
    await initializeSheet();
    const sheet = doc.sheetsByIndex[1]; // Expenses sheet
    const currentDate = new Date().toLocaleString('he-IL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    await sheet.addRow({ תאריך: currentDate, תיאור: description, סכום: amount, קטגוריה: category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchBudgetData(): Promise<{ category: string; budget: number; spent: number; }[]> {
  try {
    await initializeSheet();
    const budgetSheet = doc.sheetsByIndex[2];
    const expensesSheet = doc.sheetsByIndex[1];

    const budgetRows = await budgetSheet.getRows();
    const expenseRows = await expensesSheet.getRows();

    if (budgetRows.length === 0) return [];

    const budgetData = budgetRows.map(row => ({
      category: row['קטגוריה'] || row.קטגוריה,
      budget: parseFloat(row['סכום'] || row.סכום) || 0,
      spent: expenseRows
        .filter(expRow => (expRow['קטגוריה'] || expRow.קטגוריה) === (row['קטגוריה'] || row.קטגוריה))
        .reduce((sum, expRow) => sum + (parseFloat(expRow['סכום'] || expRow.סכום) || 0), 0),
    }));

    return budgetData;
  } catch (error) {
    return handleApiError(error);
  }
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export async function fetchAllExpenses(): Promise<Expense[]> {
  try {
    await initializeSheet();
    const sheet = doc.sheetsByIndex[1]; // Expenses sheet
    const rows = await sheet.getRows();
    return rows.map((row, index) => ({
      id: index.toString(),
      date: row['תאריך'] || '',
      description: row['תיאור'] || '',
      amount: parseFloat(row['סכום'] || '0'),
      category: row['קטגוריה'] || '',
    }));
  } catch (error) {
    return handleApiError(error);
  }
}

export interface ShoppingListItem {
  product: string;
  quantity: number;
  listName: string;
  date: string;
  status: 'ממתין' | 'נרכש';
}

export async function fetchShoppingLists(): Promise<string[]> {
  try {
    console.log('Initializing sheet...');
    await initializeSheet();
    console.log('Sheet initialized');
    
    const sheet = doc.sheetsByIndex[3]; // גיליון4
    console.log('Fetching rows from sheet...');
    const rows = await sheet.getRows();
    console.log(`Fetched ${rows.length} rows`);
    
    const listNames = new Set(rows.map(row => row['שם הרשימה']));
    console.log(`Unique list names: ${Array.from(listNames)}`);
    
    return Array.from(listNames);
  } catch (error) {
    console.error('Error in fetchShoppingLists:', error);
    return handleApiError(error);
  }
}

export async function fetchShoppingListItems(listName: string): Promise<ShoppingListItem[]> {
  try {
    await initializeSheet();
    const sheet = doc.sheetsByIndex[3]; // גיליון4
    const rows = await sheet.getRows();
    return rows
      .filter(row => row['שם הרשימה'] === listName)
      .map(row => ({
        product: row['מוצר'],
        quantity: parseInt(row['כמות'], 10),
        listName: row['שם הרשימה'],
        date: row['תאריך'],
        status: row['סטטוס'] as 'ממתין' | 'נרכש'
      }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function addShoppingListItem(item: Omit<ShoppingListItem, 'date'>) {
  try {
    await initializeSheet();
    const sheet = doc.sheetsByIndex[3]; // גיליון4
    const currentDate = new Date().toLocaleString('he-IL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    await sheet.addRow({
      'מוצר': item.product,
      'כמות': item.quantity,
      'שם הרשימה': item.listName,
      'תאריך': currentDate,
      'סטטוס': item.status
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateShoppingListItemStatus(listName: string, product: string, newStatus: 'ממתין' | 'נרכש') {
  try {
    await initializeSheet();
    const sheet = doc.sheetsByIndex[3]; // גיליון4
    const rows = await sheet.getRows();
    const rowToUpdate = rows.find(row => row['שם הרשימה'] === listName && row['מוצר'] === product);
    if (rowToUpdate) {
      rowToUpdate['סטטוס'] = newStatus;
      await rowToUpdate.save();
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteShoppingListItem(listName: string, product: string) {
  try {
    await initializeSheet();
    const sheet = doc.sheetsByIndex[3]; // גיליון4
    const rows = await sheet.getRows();
    const rowToDelete = rows.find(row => row['שם הרשימה'] === listName && row['מוצר'] === product);
    if (rowToDelete) {
      await rowToDelete.delete();
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateShoppingListItem(listName: string, updatedItem: ShoppingListItem) {
  try {
    await initializeSheet();
    const sheet = doc.sheetsByIndex[3]; // גיליון4
    const rows = await sheet.getRows();
    const rowToUpdate = rows.find(row => row['שם הרשימה'] === listName && row['מוצר'] === updatedItem.product);
    if (rowToUpdate) {
      rowToUpdate['מוצר'] = updatedItem.product;
      rowToUpdate['כמות'] = updatedItem.quantity;
      await rowToUpdate.save();
    }
  } catch (error) {
    return handleApiError(error);
  }
}