import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Database, Trash2, AlertCircle } from 'lucide-react';
import { ImportResult } from '@/types';
import { downloadExport, importDataFromFile, clearAllData } from '@/lib/importExportService';

export default function Settings() {
  const accounts = useAppSelector((state) => state.accounts.accounts);
  const categories = useAppSelector((state) => state.categories.categories);
  const tags = useAppSelector((state) => state.tags.tags);
  const transactions = useAppSelector((state) => state.transactions.transactions);
  const budgets = useAppSelector((state) => state.budgets.budgets);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadExport();
    } catch (error) {
      alert('Failed to export data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importDataFromFile(file);
      setImportResult(result);

      if (result.success) {
        // Reload page to refresh data from database
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to import data',
        imported: { accounts: 0, categories: 0, tags: 0, transactions: 0, budgets: 0 },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        await clearAllData();
        window.location.reload();
      } catch (error) {
        alert('Failed to clear data: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  const totalItems = accounts.length + categories.length + tags.length + transactions.length + budgets.length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your data and preferences</p>
      </div>

      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <Database className="h-4 w-4 mr-2" />
            Data Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div className="p-3 bg-muted text-center">
              <p className="text-lg font-bold">{accounts.length}</p>
              <p className="text-xs text-muted-foreground">Accounts</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-lg font-bold">{categories.length}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-lg font-bold">{tags.length}</p>
              <p className="text-xs text-muted-foreground">Tags</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-lg font-bold">{transactions.length}</p>
              <p className="text-xs text-muted-foreground">Transactions</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-lg font-bold">{budgets.length}</p>
              <p className="text-xs text-muted-foreground">Budgets</p>
            </div>
          </div>
          <div className="mt-3 text-center text-xs text-muted-foreground">
            Total: {totalItems} items stored locally
          </div>
        </CardContent>
      </Card>

      {/* Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import / Export Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="export">Export Data</Label>
            <p className="text-xs text-muted-foreground">
              Download all your data as a JSON file. You can use this file to backup your data or transfer it to another device.
            </p>
            <Button onClick={handleExport} disabled={isExporting} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="import">Import Data</Label>
            <p className="text-sm text-muted-foreground">
              Import data from a previously exported JSON file. This will replace all existing data.
            </p>
            <Input
              id="import"
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="cursor-pointer"
            />
            {isImporting && (
              <p className="text-xs text-muted-foreground mt-2">Importing data...</p>
            )}
          </div>

          {importResult && (
            <div
              className={`p-3 flex items-start space-x-2 ${
                importResult.success
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-50 text-red-800 dark:bg-destructive/20 dark:text-destructive'
              }`}
            >
              {importResult.success ? (
                <Download className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium text-sm">{importResult.message}</p>
                {importResult.success && (
                  <p className="text-xs mt-2">
                    Imported: {importResult.imported.accounts} accounts, {importResult.imported.categories} categories,{' '}
                    {importResult.imported.tags} tags, {importResult.imported.transactions} transactions,{' '}
                    {importResult.imported.budgets} budgets
                  </p>
                )}
                {importResult.errors && importResult.errors.length > 0 && (
                  <p className="text-xs mt-2">Errors: {importResult.errors.join(', ')}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Clear all data from the application. This action cannot be undone.
          </p>
          <Button
            onClick={handleClearData}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="font-medium text-sm">PiggyBank</p>
            <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              A personal finance application built with React, TypeScript, Redux, and IndexedDB.
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              All data is stored locally in your browser's IndexedDB. No data is sent to any server.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
