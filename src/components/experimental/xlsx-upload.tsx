import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FileSpreadsheet, Save, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

interface ExcelRow {
  [key: string]: string | number | boolean | null;
}

const ExcelUploadComponent: React.FC = () => {
  const [data, setData] = useState<ExcelRow[]>([]);
  const [columns, setColumns] = useState<
    ColumnDef<ExcelRow, string | number | boolean | null>[]
  >([]);
  const [fileName, setFileName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>("");

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const binaryStr = e.target?.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Get the range of the worksheet
      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

      // Extract headers from first row
      const headers: string[] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
        const cell = worksheet[cellAddress];
        const headerValue = cell ? XLSX.utils.format_cell(cell) : "";
        headers.push(headerValue || `Column ${col + 1}`);
      }

      // Convert to JSON with proper headers
      const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
        header: headers,
        range: 1, // Skip the first row since we already extracted headers
      });

      if (jsonData.length > 0) {
        setData(jsonData);

        const columnHelper = createColumnHelper<ExcelRow>();
        const dynamicColumns = headers.map((header) =>
          columnHelper.accessor(header, {
            header: header,
            cell: (info) => {
              const value = info.getValue();
              if (value === null || value === undefined) return "";
              return value.toString();
            },
          }),
        );
        setColumns(dynamicColumns);
        setSaveStatus("");
      }
    };

    reader.readAsArrayBuffer(file);
    // reader.onload = (e: ProgressEvent<FileReader>) => {
    //   const binaryStr = e.target?.result;
    //   const workbook = XLSX.read(binaryStr, { type: "binary" });
    //   const sheetName = workbook.SheetNames[0];
    //   const worksheet = workbook.Sheets[sheetName];
    //   const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

    //   if (jsonData.length > 0) {
    //     setData(jsonData);

    //     const columnHelper = createColumnHelper<ExcelRow>();
    //     const dynamicColumns = Object.keys(jsonData[0]).map((key) =>
    //       columnHelper.accessor(key, {
    //         header: key,
    //         cell: (info) => info.getValue()?.toString() ?? "",
    //       }),
    //     );
    //     setColumns(dynamicColumns);
    //     setSaveStatus("");
    //   }
    // };

    // reader.readAsArrayBuffer(file);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  useEffect(() => {
    if (data) console.log(JSON.stringify(data, null, 2));
  }, [data]);

  const saveToFirestore = async (): Promise<void> => {
    if (data.length === 0) {
      setSaveStatus("No data to save");
      return;
    }

    setIsSaving(true);
    setSaveStatus("");

    try {
      // Simulated Firestore save
      // In a real implementation, you would:
      // 1. Initialize Firebase: const app = initializeApp(config);
      // 2. Get Firestore instance: const db = getFirestore(app);
      // 3. Save data: await addDoc(collection(db, 'excel-data'), { data, fileName, timestamp: new Date() });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSaveStatus(`✓ Successfully saved ${data.length} rows to Firestore`);
    } catch (error) {
      setSaveStatus(
        `✗ Error saving to Firestore: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FileSpreadsheet className="text-indigo-600" />
            Excel to Firestore
          </h1>

          <div className="mb-6">
            <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-indigo-400 focus:outline-none">
              <span className="flex items-center space-x-2">
                <Upload className="w-6 h-6 text-gray-600" />
                <span className="font-medium text-gray-600">
                  {fileName || "Click to upload Excel file"}
                </span>
              </span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {data.length > 0 && (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {data.length} rows × {columns.length} columns
                </p>
                <button
                  onClick={saveToFirestore}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save to Firestore"}
                </button>
              </div>

              {saveStatus && (
                <div
                  className={`mb-4 p-3 rounded-lg ${
                    saveStatus.startsWith("✓")
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {saveStatus}
                </div>
              )}

              <div className="h-screen overflow-x-auto overflow-y-scroll border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-3 w-[200px] py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {data.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Upload an Excel file to get started</p>
            </div>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            Implementation Note:
          </h3>
          <p className="text-sm text-yellow-700">
            The Firestore save functionality is currently simulated. To
            implement real Firestore integration:
          </p>
          <ol className="text-sm text-yellow-700 mt-2 ml-4 list-decimal">
            <li>
              Install Firebase:{" "}
              <code className="bg-yellow-100 px-1">npm install firebase</code>
            </li>
            <li>Initialize Firebase with your config</li>
            <li>Replace the simulated save with actual Firestore calls</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploadComponent;
