import { GoogleSpreadsheet } from 'google-spreadsheet';

const doc = new GoogleSpreadsheet(process.env.REACT_APP_SPREADSHEET_ID || '');

async function initializeSheet() {
  await doc.useServiceAccountAuth({
    client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  });
  await doc.loadInfo();
}

export async function fetchCategories(): Promise<string[]> {
  await initializeSheet();
  const sheet = doc.sheetsByIndex[2]; // Budget sheet
  const rows = await sheet.getRows();
  return rows.length > 0 ? rows.map(row => row['קטגוריה'] || row.קטגוריה) : [];
}

export async function addExpense(amount: number, description: string, category: string) {
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
}

export async function fetchBudgetData(): Promise<{ category: string; budget: number; spent: number; }[]> {
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
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export async function fetchAllExpenses(): Promise<Expense[]> {
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
}