// Test Excel file processing
import { detectUploadType, parseFileToText } from './lib/fileParsers.js';
import fs from 'fs';

async function testExcelFile() {
  try {
    // Create a mock File object for testing
    const fileBuffer = fs.readFileSync('./test-files/WBS_SAMPLE_2025.xlsx');
    const file = new File([fileBuffer], 'WBS_SAMPLE_2025.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    console.log('File created:', file.name, file.type, file.size);

    const detectedType = detectUploadType(file);
    console.log('Detected type:', detectedType);

    if (detectedType) {
      const result = await parseFileToText(file);
      console.log('Parse result:', result);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testExcelFile();