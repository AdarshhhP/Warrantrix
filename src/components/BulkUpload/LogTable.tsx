// import { Download, Search } from "lucide-react";
// import { Badge } from "../ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { Input } from "../ui/input";
// import { Button } from "../ui/button";
// import ResponsiveTable from "../table/ResponsiveTable";
// import { useEffect, useState } from "react";
// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";


// interface LogTableProps {
//   headers: { [key: string]: string };
//   uploadLog: any[];
//   uploadStatus: "idle" | "loading" | "success" | "error";
//   statsConfig?: {
//     label: string;
//     key: string;
//     badgeClass?: string;
//   }[],
//   EnableStatus?:boolean;
// }

// export const LogTable: React.FC<LogTableProps> = ({
//   headers,
//   uploadLog,
//   uploadStatus,
//   statsConfig = [
//     { label: "Records Added", key: "Success", badgeClass: "bg-emerald-50" },
//     { label: "Records Failed", key: "Failed", badgeClass: "bg-red-50" },
//     { label: "Records Updated", key: "Updated", badgeClass: "bg-amber-50" },
//     { label: "Total Records", key: "total" },
//   ],
//   EnableStatus = false,
// }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [stats, setStats] = useState<Record<string, number>>({});
//   const [currentFilterationQuery,setFilterationQuery] = useState<null|string>(null);

//   const filteredData = uploadLog.filter((record) =>
//     (currentFilterationQuery === null ? searchQuery : currentFilterationQuery)
//       .toLowerCase()
//       .split(" ")
//       .some((query) =>
//         Object.values(record).some((value) =>
//           String(value).toLowerCase().includes(query)
//         )
//       )
//   );

//   useEffect(() => {
//     if (!uploadLog) return;
//     const computedStats: Record<string, number> = { total: uploadLog.length };
//     statsConfig.forEach(({ key }) => {
//       if (key !== "total") {
//         computedStats[key] = uploadLog.filter((val) => val?.status === key).length;
//       }
//     });
//     setStats(computedStats);
//   }, [uploadLog, uploadStatus, statsConfig]);

//   const handleDownloadLog = async () => {
//     try {
//       if (filteredData?.length > 0) {
//         // Prepare data with headers
//         const dataWithHeaders = filteredData?.map((item: any, index: number) => ({
//           "SL.no": index + 1,
//           ...Object.keys(headers).reduce((acc, key) => ({
//             ...acc,
//             [headers[key][0].toUpperCase() + headers[key].slice(1)]: item[key],
//           }), {}),
//         }));
//         // Create a new workbook and add a worksheet
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet("Successful File Upload Log");
  
//         // Define the columns (headers) using props
//         worksheet.columns = dataWithHeaders[0] ? Object.keys(dataWithHeaders[0]).map((key) => ({
//           header: headers[key] || key,
//           key: key,
//           width: 25, // You can adjust the width as needed
//         })) : [];
//         // Add data rows to the worksheet
//         dataWithHeaders.forEach((dataRow) => {
//           worksheet.addRow(dataRow);
//         });
  
//         // Apply styles (optional)
//         worksheet.getRow(1).font = { bold: true }; // Bold header row
//         worksheet.eachRow({ includeEmpty: false }, (row) => {
//           row.height = 20; // Set row height
//         });
  
//         // Generate the Excel file buffer
//         const buffer = await workbook.xlsx.writeBuffer();
  
//         // Create a Blob and save the file
//         const blob = new Blob([buffer], {
//           type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         });
//         saveAs(blob, "Fileupload_log.xlsx");
//       } else {
//         console.warn("No data available to download.");
//       }
//     } catch (error: any) {
//       console.error("Error generating the log file:", error);
//     }
//   };

//   return (
//     <Card className="shadow-xl md:w-full w-fit">
//       <CardHeader>
//         <CardTitle>Upload Log</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-2">
//         <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
//           {statsConfig?.map(({ label, key, badgeClass }) => (
//             <div className="space-y-2" key={key}>
//               <div className={`flex items-center gap-2 cursor-pointer`} onClick={()=>{setFilterationQuery(key==="total"?null:key)}}>
//                 <Badge
//                   variant={"outline"}
//                   className={badgeClass || ""}
//                 >
//                   {stats[key] || 0}
//                 </Badge>
                
//                 <span className={`text-sm ${currentFilterationQuery === label?" underline":""}`}>{label}</span>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="flex items-center gap-2">
//           <div className="relative flex-1">
//             <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search records..."
//               className="pl-8"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//           <Button onClick={handleDownloadLog} id="downloadlog">
//             <Download className="mr-2 h-4 w-4" />
//           </Button>
//         </div>
//         <div className="rounded-lg border h-[250px] overflow-y-scroll md:h-[180px]">
//           <ResponsiveTable headers={headers} data={filteredData} offset={0} setStatus={EnableStatus}/>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };
