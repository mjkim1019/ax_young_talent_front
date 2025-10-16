import JSZip from "jszip";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import * as XLSX from "xlsx";

export type SupportedUploadType = "txt" | "doc" | "docx" | "pdf" | "xlsx" | "image";

export interface ParsedFileResult {
  type: SupportedUploadType;
  text: string;
  warnings: string[];
  imageData?: string; // Base64 encoded image data for vision models
  structuredData?: WBSData; // Structured data for Excel/WBS files
}

export interface WBSData {
  headers: string[];
  rows: string[][];
  metadata: {
    totalRows: number;
    totalColumns: number;
    sheetName: string;
    hasHeaders: boolean;
  };
}

const EXTENSION_TYPE_MAP: Record<string, SupportedUploadType> = {
  txt: "txt",
  doc: "doc",
  docx: "docx",
  pdf: "pdf",
  xlsx: "xlsx",
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
};

GlobalWorkerOptions.workerSrc = pdfWorker;

const printableRegex = /[\p{L}\p{N}\p{P}\p{Zs}]/u;

export function detectUploadType(file: File): SupportedUploadType | null {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension && extension in EXTENSION_TYPE_MAP) {
    return EXTENSION_TYPE_MAP[extension];
  }

  const mimeType = file.type;
  if (!mimeType) {
    return null;
  }

  if (mimeType === "text/plain") {
    return "txt";
  }

  if (mimeType === "application/pdf") {
    return "pdf";
  }

  if (
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return mimeType === "application/msword" ? "doc" : "docx";
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    return "xlsx";
  }

  return null;
}

export async function parseFileToText(file: File): Promise<ParsedFileResult> {
  const type = detectUploadType(file);

  if (!type) {
    throw new Error("지원되지 않는 파일 형식입니다. .txt, .doc, .docx, .pdf, .xlsx, 이미지 파일만 업로드하세요.");
  }

  switch (type) {
    case "txt":
      return {
        type,
        text: await file.text(),
        warnings: [],
      };
    case "doc":
      return {
        type,
        ...parseLegacyDoc(await file.arrayBuffer()),
      };
    case "docx":
      return {
        type,
        text: await extractTextFromDocx(await file.arrayBuffer()),
        warnings: [],
      };
    case "pdf":
      return {
        type,
        text: await extractTextFromPdf(await file.arrayBuffer()),
        warnings: [],
      };
    case "xlsx":
      return await extractDataFromXlsx(file);
    case "image":
      return {
        type,
        text: `이미지 파일 업로드됨: ${file.name}`,
        warnings: [],
        imageData: await processImageFile(file),
      };
    default:
      throw new Error("알 수 없는 파일 형식입니다.");
  }
}

function parseLegacyDoc(buffer: ArrayBuffer): { text: string; warnings: string[] } {
  const decoders: Array<{ label: string; description: string }> = [
    { label: "utf-16le", description: "UTF-16LE" },
    { label: "utf-8", description: "UTF-8" },
    { label: "windows-1252", description: "Windows-1252" },
  ];

  for (const decoderInfo of decoders) {
    try {
      const decoder = new TextDecoder(decoderInfo.label, { fatal: false });
      const raw = decoder.decode(buffer);
      const cleaned = cleanupDocText(raw);
      if (cleaned.length > 0) {
        return {
          text: cleaned,
          warnings: decoderInfo.description === "UTF-16LE" ? [] : [
            `${decoderInfo.description}로 텍스트를 복원했습니다. 서식이 일부 깨질 수 있습니다.`,
          ],
        };
      }
    } catch (error) {
      continue;
    }
  }

  const bytes = new Uint8Array(buffer);
  let current = "";
  const segments: string[] = [];

  for (const byte of bytes) {
    if (byte === 0 || byte === 10 || byte === 13) {
      if (current.trim().length > 0) {
        segments.push(current.trim());
      }
      current = "";
      continue;
    }

    const char = String.fromCharCode(byte);
    if (printableRegex.test(char)) {
      current += char;
    } else {
      if (current.trim().length > 0) {
        segments.push(current.trim());
      }
      current = "";
    }
  }

  if (current.trim().length > 0) {
    segments.push(current.trim());
  }

  const text = segments.join("\n");

  if (text.length === 0) {
    throw new Error("DOC 파일에서 텍스트를 추출하지 못했습니다. 다른 형식으로 저장 후 다시 시도하세요.");
  }

  return {
    text,
    warnings: ["DOC 형식에서 텍스트 추출 시 일부 내용이 누락되었을 수 있습니다."],
  };
}

function cleanupDocText(raw: string): string {
  return raw
    .replace(/\u0000/g, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const documentFile = zip.file("word/document.xml");

  if (!documentFile) {
    throw new Error("DOCX 문서에서 본문을 찾을 수 없습니다.");
  }

  const documentXml = await documentFile.async("text");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(documentXml, "application/xml");
  const parserError = xmlDoc.querySelector("parsererror");

  if (parserError) {
    throw new Error("DOCX 문서를 해석하는 중 오류가 발생했습니다.");
  }

  const textContent = xmlDoc.documentElement.textContent ?? "";

  return normalizeWhitespace(textContent);
}

async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise;
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const strings = content.items
      .filter((item): item is TextItem => "str" in item)
      .map((item) => item.str.trim())
      .filter(Boolean);
    pageTexts.push(strings.join(" "));
  }

  if (pageTexts.length === 0) {
    throw new Error("PDF에서 텍스트를 추출하지 못했습니다. 스캔 이미지일 수 있습니다.");
  }

  return normalizeWhitespace(pageTexts.join("\n"));
}

async function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve(result); // Base64 데이터 URL 반환
    };

    reader.onerror = () => {
      reject(new Error(`이미지 파일을 읽는 중 오류가 발생했습니다: ${file.name}`));
    };

    reader.readAsDataURL(file);
  });
}

async function extractDataFromXlsx(file: File): Promise<ParsedFileResult> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error("XLSX 파일에서 시트를 찾을 수 없습니다.");
    }

    // Convert sheet to JSON with raw format to preserve data types
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      defval: ""
    }) as string[][];

    if (jsonData.length === 0) {
      throw new Error("XLSX 파일이 비어있습니다.");
    }

    // Detect headers (first row with content)
    const headers = jsonData[0] || [];
    const dataRows = jsonData.slice(1).filter(row =>
      row.some(cell => cell && cell.toString().trim())
    );

    // Generate structured data
    const structuredData: WBSData = {
      headers: headers.map(h => h?.toString() || ""),
      rows: dataRows.map(row =>
        headers.map((_, index) => row[index]?.toString() || "")
      ),
      metadata: {
        totalRows: dataRows.length,
        totalColumns: headers.length,
        sheetName: sheetName,
        hasHeaders: headers.some(h => h && h.toString().trim())
      }
    };

    // Generate text representation
    const textLines: string[] = [];

    // Add headers
    if (structuredData.metadata.hasHeaders) {
      textLines.push(headers.join("\t"));
    }

    // Add data rows
    dataRows.forEach(row => {
      const rowData = headers.map((_, index) => row[index]?.toString() || "");
      textLines.push(rowData.join("\t"));
    });

    const textContent = textLines.join("\n");

    // Detect if this looks like a WBS/project plan
    const isWBS = detectWBSStructure(headers, dataRows);
    const warnings: string[] = [];

    if (isWBS) {
      warnings.push("WBS/프로젝트 계획 구조가 감지되었습니다. AI가 프로젝트 관리에 특화된 처리를 제공합니다.");
    }

    return {
      type: "xlsx",
      text: textContent,
      warnings,
      structuredData
    };

  } catch (error) {
    console.error("XLSX 파싱 오류:", error);
    throw new Error(`XLSX 파일을 처리하는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

function detectWBSStructure(headers: string[], rows: string[][]): boolean {
  const headerText = headers.join(" ").toLowerCase();

  // WBS/프로젝트 계획 관련 키워드 검사
  const wbsKeywords = [
    "작업", "task", "activity", "milestone", "마일스톤",
    "시작일", "종료일", "start", "end", "date", "기간", "duration",
    "담당자", "responsible", "owner", "구분", "category", "phase",
    "진행률", "progress", "상태", "status", "비고", "remark"
  ];

  const hasWBSKeywords = wbsKeywords.some(keyword =>
    headerText.includes(keyword)
  );

  // 데이터 패턴 검사 (날짜, 기간 등)
  const hasDatePattern = rows.some(row =>
    row.some(cell => {
      const cellText = cell.toString();
      return /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(cellText) || // 날짜 패턴
             /\d+주|\d+일|\d+개월/.test(cellText); // 기간 패턴
    })
  );

  return hasWBSKeywords || hasDatePattern;
}

function normalizeWhitespace(value: string): string {
  return value
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}
