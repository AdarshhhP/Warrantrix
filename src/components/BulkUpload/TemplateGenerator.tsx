import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "../ui/button";
type ColumnConfig = {
  Name: string;
  columnWidth: number;
  isRequired: boolean;
  isList: boolean;
  comment: string;
  options?: string[];
  showErrorMessage?: boolean;
  error?: string;
  errorTitle?: string;
};
export type Columns = ColumnConfig[];
type TemplateGeneratorProps = {
  columnsConfig: Columns;
  TemplateName:string;
};

function TemplateGenerator({ columnsConfig,TemplateName }: TemplateGeneratorProps) {
  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Template");
    const hiddenSheet = workbook.addWorksheet("Data");

    // Add headers and populate the worksheet dynamically
    const headers = columnsConfig.map((col) => col.Name);
    worksheet.addRow(headers);
    //bold items in the first row column with isRequired true
    columnsConfig.forEach((col,index) => {
      if (col.isRequired) {
        worksheet.getCell(1, index+1).font = { bold: true };
      }
    });
    // worksheet.getRow(1).font = { bold: true };


    // Set column widths dynamically
    worksheet.columns = columnsConfig.map((col) => ({
      header: col.Name,
      key: col.Name,
      width: col.columnWidth,
    }));

    // Add comments for each column based on the configuration
    columnsConfig.forEach((col, index) => {
      worksheet.getColumn(index + 1).eachCell((cell) => {
        if (col.comment) {
          cell.note = {
            texts: [{ text: col.comment }],
          };
        }
      });
    });

    // Populate the hidden sheet with dropdown options
    // Iterate over the columnsConfig to populate hiddenSheet
    columnsConfig.forEach((col, index) => {
      // Check if the column has options for a dropdown
      if (col.isList && col.options && col.options.length > 0) {
        const columnIndex = index + 1; // Use the index to decide which column to write into
        const columnName = col.Name;

        // Set the values of the hidden sheet starting from the second row (skip the header)
        hiddenSheet.getColumn(columnIndex).values = [
          columnName,
          ...col.options,
        ];
      }
    });

    // Hide the data sheet
    hiddenSheet.state = "hidden";

    // Add data validation based on the configuration
    for (let i = 2; i <= 100; i++) {
      columnsConfig.forEach((col, colIndex) => {
        if (col.isList) {
          const options = col.options || [];
          worksheet.getCell(
            `${String.fromCharCode(65 + colIndex)}${i}`
          ).dataValidation = {
            type: "list",
            allowBlank: true,
            showErrorMessage: col.showErrorMessage || false,
            formulae: [
              `Data!$${String.fromCharCode(
                65 + colIndex
              )}$2:$${String.fromCharCode(65 + colIndex)}$${
                options.length + 1
              }`,
            ],
            error: col.error,
            errorTitle: col.errorTitle,
          };
        }
      });
    }

    // Generate and download the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${TemplateName}.xlsx`);
  };

  return (
    <div className="flex justify-center">
      <Button className="flex items-center gap-2 bg-teal-500 text-white hover:bg-teal-600" onClick={handleDownload} id="downloadtemp">
        Download Template
      </Button>
    </div>
  );
}
export default TemplateGenerator;
