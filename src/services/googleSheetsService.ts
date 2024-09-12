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

export interface BudgetData {
  category: string;
  budget: number;
  spent: number;
  date: string;
}

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

export async function addExpense(amount: number, description: string, category: string): Promise<string> {
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
    }).replace(/\//g, '.'); // החלפת / ב-. לפורמט הנדרש
    const newRow = await sheet.addRow({ 
      id: Date.now().toString(), // Generate a new unique ID
      תאריך: currentDate, 
      תיאור: description, 
      סכום: amount, 
      קטגוריה: category 
    });
    return newRow.id;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchBudgetData(): Promise<BudgetData[]> {
  try {
    await initializeSheet();
    const budgetSheet = doc.sheetsByIndex[2]; // גיליון3 (Budget sheet)
    const expensesSheet = doc.sheetsByIndex[1]; // גיליון2 (Expenses sheet)

    const budgetRows = await budgetSheet.getRows();
    const expenseRows = await expensesSheet.getRows();

    if (budgetRows.length === 0) return [];

    const parseDate = (dateString: string) => {
      const [day, month, year] = dateString.split('.');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    };

    const budgetData: BudgetData[] = budgetRows.map(row => {
      const category = row['קטגוריה'] || row.קטגוריה;
      const budget = parseFloat(row['סכום'] || row.סכום) || 0;
      const budgetDate = row['תאריך'] || '';
      
      const categoryExpenses = expenseRows.filter(expRow => 
        (expRow['קטגוריה'] || expRow.קטגוריה) === category
      );

      const spent = categoryExpenses.reduce((sum, expRow) => {
        const expenseDate = parseDate(expRow['תאריך']);
        const budgetDateObj = parseDate(budgetDate);
        
        // Check if the expense date is in the same month and year as the budget date
        if (expenseDate.getMonth() === budgetDateObj.getMonth() &&
            expenseDate.getFullYear() === budgetDateObj.getFullYear()) {
          return sum + (parseFloat(expRow['סכום'] || expRow.סכום) || 0);
        }
        return sum;
      }, 0);

      return {
        category,
        budget,
        spent,
        date: budgetDate,
      };
    });

    console.log('Fetched budget data:', budgetData);
    return budgetData;
  } catch (error) {
    console.error('Error in fetchBudgetData:', error);
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
    console.log('Raw rows from Google Sheets:', rows);
    const expenses = rows.map((row) => ({
      id: row.id || row._rowNumber.toString(), // Use existing ID or row number as fallback
      date: row['תאריך'] || '',
      description: row['תיאור'] || '',
      amount: parseFloat(row['סכום'] || '0'),
      category: row['קטגוריה'] || '',
    }));
    console.log('Parsed expenses:', expenses);
    return expenses;
  } catch (error) {
    console.error('Error in fetchAllExpenses:', error);
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

export async function updateShoppingListItem(listName: string, oldProduct: string, updatedItem: ShoppingListItem) {
  try {
    await initializeSheet();
    const sheet = doc.sheetsByIndex[3]; // גיליון4
    const rows = await sheet.getRows();
    const rowToUpdate = rows.find(row => row['שם הרשימה'] === listName && row['מוצר'] === oldProduct);
    if (rowToUpdate) {
      rowToUpdate['מוצר'] = updatedItem.product;
      rowToUpdate['כמות'] = updatedItem.quantity;
      rowToUpdate['סטטוס'] = updatedItem.status;
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

export async function updateExpense(expense: Expense): Promise<void> {
  try {
    await initializeSheet();
    const sheet = doc.sheetsByIndex[1]; // Expenses sheet
    const rows = await sheet.getRows();
    const rowToUpdate = rows.find(row => row.id === expense.id);
    if (rowToUpdate) {
      rowToUpdate['תאריך'] = expense.date;
      rowToUpdate['תיאור'] = expense.description;
      rowToUpdate['סכום'] = expense.amount.toString();
      rowToUpdate['קטגוריה'] = expense.category;
      await rowToUpdate.save();
    } else {
      throw new Error('Expense not found');
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    await initializeSheet();
    const sheet = doc.sheetsByIndex[1]; // Expenses sheet
    const rows = await sheet.getRows();
    const rowToDelete = rows.find(row => row.id === id);
    if (rowToDelete) {
      await rowToDelete.delete();
    } else {
      throw new Error('Expense not found');
    }
  } catch (error) {
    return handleApiError(error);
  }
}