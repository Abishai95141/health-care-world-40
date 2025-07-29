
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, CheckCircle, XCircle, X } from 'lucide-react';

interface CSVRow {
  [key: string]: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  actualValue?: string;
}

const BulkImport = () => {
  const { toast } = useToast();
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [importResults, setImportResults] = useState<{
    successful: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const requiredFields = [
    'name', 'description', 'category', 'unit', 'price', 
    'stock', 'weight_volume', 'manufacturer'
  ];

  const categories = ['Prescription', 'OTC & Wellness', 'Vitamins & Supplements', 'Medical Devices'];
  const units = ['Tablet', 'Capsule', 'Bottle', 'Syrup', 'Pack'];

  const downloadTemplate = () => {
    const headers = [
      'name', 'description', 'category', 'brand', 'unit', 'price', 'mrp',
      'weight_volume', 'manufacturer', 'requires_prescription', 'stock',
      'expiration_date', 'tags', 'is_active'
    ];

    const sampleData = [
      'Paracetamol 500mg', 'Pain relief tablet', 'OTC & Wellness', 'Generic',
      'Tablet', '5.00', '6.00', '500mg', 'Pharma Corp', 'false', '100',
      '2025-12-31', 'pain relief,fever', 'true'
    ];

    const csvContent = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_import_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Proper CSV parser that handles quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };

  const parseCSV = (text: string): { headers: string[], data: CSVRow[] } => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], data: [] };

    // Parse headers
    const headers = parseCSVLine(lines[0]).map(header => 
      header.replace(/^"|"$/g, '').trim().toLowerCase()
    );
    console.log('Parsed CSV headers:', headers);
    
    // Parse data rows
    const data = lines.slice(1).map((line, index) => {
      const values = parseCSVLine(line).map(value => 
        value.replace(/^"|"$/g, '').trim()
      );
      
      const row: CSVRow = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      row._rowIndex = (index + 2).toString();
      console.log(`Row ${index + 2} data:`, row);
      return row;
    });

    return { headers, data };
  };

  const normalizeAndValidate = (data: CSVRow[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    console.log('Starting validation for', data.length, 'rows');

    data.forEach((row, index) => {
      const rowNumber = index + 1;
      console.log(`Validating row ${rowNumber}:`, row);

      // Check required fields
      requiredFields.forEach(field => {
        const value = row[field];
        if (!value || value.trim() === '') {
          errors.push({
            row: rowNumber,
            field,
            message: `${field.replace('_', ' ')} is required`,
            actualValue: value || 'empty'
          });
        }
      });

      // Validate category
      if (row.category && !categories.includes(row.category)) {
        errors.push({
          row: rowNumber,
          field: 'category',
          message: `Category must be one of: ${categories.join(', ')}`,
          actualValue: row.category
        });
      }

      // Validate unit
      if (row.unit && !units.includes(row.unit)) {
        errors.push({
          row: rowNumber,
          field: 'unit',
          message: `Unit must be one of: ${units.join(', ')}`,
          actualValue: row.unit
        });
      }

      // Validate price
      if (row.price) {
        const price = parseFloat(row.price);
        if (isNaN(price) || price < 1) {
          errors.push({
            row: rowNumber,
            field: 'price',
            message: 'Price must be a valid number ≥ 1',
            actualValue: row.price
          });
        }
      }

      // Validate MRP
      if (row.mrp) {
        const mrp = parseFloat(row.mrp);
        const price = parseFloat(row.price);
        if (isNaN(mrp) || mrp < 0) {
          errors.push({
            row: rowNumber,
            field: 'mrp',
            message: 'MRP must be a valid number ≥ 0',
            actualValue: row.mrp
          });
        } else if (!isNaN(price) && mrp < price) {
          errors.push({
            row: rowNumber,
            field: 'mrp',
            message: 'MRP must be greater than or equal to Price',
            actualValue: `MRP: ${row.mrp}, Price: ${row.price}`
          });
        }
      }

      // Validate stock
      if (row.stock) {
        const stock = parseInt(row.stock);
        if (isNaN(stock) || stock < 0) {
          errors.push({
            row: rowNumber,
            field: 'stock',
            message: 'Stock must be a valid number ≥ 0',
            actualValue: row.stock
          });
        }
      }

      // Validate boolean fields (requires_prescription, is_active)
      ['requires_prescription', 'is_active'].forEach(field => {
        if (row[field]) {
          const normalizedValue = row[field].toLowerCase().trim();
          if (!['true', 'false'].includes(normalizedValue)) {
            errors.push({
              row: rowNumber,
              field,
              message: 'Must be true or false (any casing)',
              actualValue: row[field]
            });
          }
        }
      });

      // Validate expiration_date format if provided
      if (row.expiration_date && row.expiration_date.trim() !== '') {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(row.expiration_date)) {
          errors.push({
            row: rowNumber,
            field: 'expiration_date',
            message: 'Date must be in YYYY-MM-DD format',
            actualValue: row.expiration_date
          });
        } else {
          // Validate it's a real date
          const date = new Date(row.expiration_date);
          if (isNaN(date.getTime())) {
            errors.push({
              row: rowNumber,
              field: 'expiration_date',
              message: 'Invalid date',
              actualValue: row.expiration_date
            });
          }
        }
      }
    });

    console.log('Validation completed. Total errors:', errors.length);
    return errors;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    console.log('Uploading file:', file.name);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      console.log('Raw CSV content (first 500 chars):', text.substring(0, 500));
      
      const { headers, data } = parseCSV(text);
      
      setCsvHeaders(headers);
      setCsvData(data);
      
      const errors = normalizeAndValidate(data);
      setValidationErrors(errors);
      setImportResults(null);
    };
    reader.readAsText(file);
  };

  const clearCSVData = () => {
    console.log('Clearing CSV data');
    setCsvData([]);
    setCsvHeaders([]);
    setValidationErrors([]);
    setImportResults(null);
    setFileName('');
    // Reset file input
    const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim() + '-' + Math.random().toString(36).substr(2, 6);
  };

  const processRowForImport = (row: CSVRow) => {
    // Process tags array
    const tagsArray = row.tags ? 
      row.tags.split(',').map(tag => tag.trim()).filter(Boolean) : 
      null;
    
    const stock = parseInt(row.stock) || 0;

    return {
      name: row.name,
      slug: generateSlug(row.name),
      description: row.description,
      category: row.category,
      brand: row.brand || null,
      tags: tagsArray,
      unit: row.unit,
      price: parseFloat(row.price),
      mrp: row.mrp ? parseFloat(row.mrp) : null,
      weight_volume: row.weight_volume,
      manufacturer: row.manufacturer,
      requires_prescription: row.requires_prescription?.toLowerCase().trim() === 'true',
      stock: stock,
      expiration_date: row.expiration_date || null,
      is_active: row.is_active?.toLowerCase().trim() === 'true',
      image_urls: null
    };
  };

  const handleImport = async () => {
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Errors",
        description: "Please fix all validation errors before importing",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting import process for', csvData.length, 'rows');
    setIsImporting(true);
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      // Log import start - without staff_id since it's now nullable with default
      const { data: importLog } = await supabase
        .from('product_import_logs')
        .insert([{
          total_rows: csvData.length,
          status: 'processing',
          staff_id: null
        }])
        .select()
        .single();

      for (let i = 0; i < csvData.length; i++) {
        try {
          const row = csvData[i];
          const productData = processRowForImport(row);

          console.log(`Importing row ${i + 1}:`, productData);

          const { error } = await supabase
            .from('products')
            .insert([productData]);

          if (error) {
            throw error;
          }

          successful++;
        } catch (error: any) {
          console.error(`Error importing row ${i + 1}:`, error);
          failed++;
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      // Update import log
      if (importLog) {
        await supabase
          .from('product_import_logs')
          .update({
            successful_rows: successful,
            failed_rows: failed,
            status: failed === 0 ? 'completed' : 'completed_with_errors',
            error_message: errors.length > 0 ? errors.join('; ') : null
          })
          .eq('id', importLog.id);
      }

      setImportResults({ successful, failed, errors });

      toast({
        title: "Import Completed",
        description: `${successful} products imported successfully${failed > 0 ? `, ${failed} failed` : ''}`,
      });

    } catch (error: any) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const getFieldError = (rowIndex: number, field: string) => {
    return validationErrors.find(error => error.row === rowIndex && error.field === field);
  };

  const hasRowErrors = (rowIndex: number) => {
    return validationErrors.some(error => error.row === rowIndex);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#0B1F45]">Bulk Import Products (CSV)</h1>
      </div>

      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Instructions & Template</CardTitle>
          <p className="text-gray-600">
            Download the CSV template, fill in your product details, then upload below.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="text-[#27AE60] border-[#27AE60] hover:bg-[#27AE60] hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV Template
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Upload & Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Drag & drop your CSV file here, or click to browse</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button asChild className="cursor-pointer">
                <span>Choose File</span>
              </Button>
            </label>
            
            {/* Show uploaded file name with remove option */}
            {fileName && (
              <div className="mt-4 flex items-center justify-center space-x-2">
                <span className="text-sm text-gray-700">Uploaded: {fileName}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCSVData}
                  className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            )}
          </div>

          {/* Validation Summary */}
          {csvData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">
                    {csvData.length - validationErrors.length} valid rows
                  </span>
                </div>
                {validationErrors.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-red-600">
                      {validationErrors.length} validation errors found
                    </span>
                  </div>
                )}
              </div>

              {/* Preview Table */}
              <div className="rounded-lg border max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 10).map((row, index) => {
                      const rowNumber = index + 1;
                      const rowHasErrors = hasRowErrors(rowNumber);
                      
                      return (
                        <TableRow key={index} className={rowHasErrors ? 'bg-red-50' : ''}>
                          <TableCell className="font-medium">{rowNumber}</TableCell>
                          <TableCell>
                            <div className="max-w-32 truncate">
                              {row.name}
                              {getFieldError(rowNumber, 'name') && (
                                <div className="text-xs text-red-600 mt-1">
                                  {getFieldError(rowNumber, 'name')?.message}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-32 truncate">
                              {row.category}
                              {getFieldError(rowNumber, 'category') && (
                                <div className="text-xs text-red-600 mt-1">
                                  {getFieldError(rowNumber, 'category')?.message}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-20 truncate">
                              {row.unit}
                              {getFieldError(rowNumber, 'unit') && (
                                <div className="text-xs text-red-600 mt-1">
                                  {getFieldError(rowNumber, 'unit')?.message}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-20 truncate">
                              {row.price}
                              {getFieldError(rowNumber, 'price') && (
                                <div className="text-xs text-red-600 mt-1">
                                  {getFieldError(rowNumber, 'price')?.message}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-20 truncate">
                              {row.stock}
                              {getFieldError(rowNumber, 'stock') && (
                                <div className="text-xs text-red-600 mt-1">
                                  {getFieldError(rowNumber, 'stock')?.message}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-32 truncate">
                              {row.tags}
                              {getFieldError(rowNumber, 'tags') && (
                                <div className="text-xs text-red-600 mt-1">
                                  {getFieldError(rowNumber, 'tags')?.message}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-20 truncate">
                              {row.is_active}
                              {getFieldError(rowNumber, 'is_active') && (
                                <div className="text-xs text-red-600 mt-1">
                                  {getFieldError(rowNumber, 'is_active')?.message}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {rowHasErrors ? (
                              <XCircle className="w-4 h-4 text-red-600" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {csvData.length > 10 && (
                <p className="text-sm text-gray-600">
                  Showing first 10 rows. Total rows: {csvData.length}
                </p>
              )}
            </div>
          )}

          {/* Import Button */}
          {csvData.length > 0 && (
            <Button
              onClick={handleImport}
              disabled={validationErrors.length > 0 || isImporting}
              className="w-full bg-[#27AE60] hover:bg-[#219150]"
            >
              {isImporting ? 'Importing Products...' : 'Import Products'}
            </Button>
          )}

          {/* Import Results */}
          {importResults && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Import Results</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-green-600">✓ {importResults.successful} products imported successfully</p>
                  {importResults.failed > 0 && (
                    <p className="text-red-600">✗ {importResults.failed} rows failed</p>
                  )}
                  {importResults.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Errors:</p>
                      <ul className="list-disc list-inside text-red-600">
                        {importResults.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {importResults.errors.length > 5 && (
                          <li>... and {importResults.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkImport;
