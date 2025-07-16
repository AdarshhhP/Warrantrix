// import { useState } from "react";
// import { Button } from "../../../components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../../../components/ui/dialog";
// import { FileUploadArea } from "../FileUploadArea";
// import { LogTable } from "../LogTable";
// import TemplateGenerator, { Columns } from "../TemplateGenerator";
// // import { ScrollArea } from "../../ui/scroll-area";
// import { toast } from "../../../hooks/use-toast";
// import FileUploadServiceInstance from "../../../services/FileUploadServices";
// import useHandleUnauthorized from "../../../hooks/useHandleUnauthorized";
// import { UploadRecord } from "../../../types/blkupld/UserUploadType";

// export function MapUploadPopOver() {
//   const handleUnauthorizedResponse = useHandleUnauthorized();
//   /**************** Template Generator Config ***************/

//   const columnsConfig:Columns = [
//     {
//       Name: "Competency Code",
//       columnWidth: 20,
//       isRequired: true,
//       isList: false,
//       comment: "Enter the code of the competency",
//     },
//     {
//       Name: "Skill Codes",
//       columnWidth: 40,
//       isRequired: true,
//       isList: false,
//       comment: "Enter the codes of the skill comma seperated",
//     },
//   ];
//   const [uploadLog, setUploadLog] = useState<UploadRecord[]>([]);

//   const handleUpload = () => {
//     if (!selectedFile) {
//       return;
//     }

//     try {
//       setUploadStatus("loading");
//       const formData = new FormData();
//       formData.append("PostedFile", selectedFile);
//       FileUploadServiceInstance.MapBlkUpload(formData).then((response) => {
//         handleUnauthorizedResponse(response);
//         if (response?.data?.code == 200) {
//           setUploadStatus("success");
//           const failedCompetencyList = response?.data?.failedCompetencySkillMappingList;
//           const successCompetencyList = response?.data?.successCompetencySkillMappingList;
//           const updatedCompetencyList = response?.data?.updatedSkillList;
//           if (response?.data) {
//             setUploadLog([
//               ...(failedCompetencyList || []),
//               ...(successCompetencyList || []),
//               ...(updatedCompetencyList || []),
//             ]);
//           }
//           toast({
//             type: "success",
//             title: "File Uploaded.",
//           });
//         }else if(response?.data?.code == 520){
//           toast({ type: "destructive", title: "This action could not be completed. Please try again." });
//         } else {
//           setUploadStatus("error");
//           toast({
//             type: "destructive",
//             title: response?.data?.description || "---",
//           });
//         }
//       });
//     } catch (err) {
//       setUploadStatus("error");
//       return err;
//     }
//   };

//   /**************** FileUpload Config ***************/
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [uploadStatus, setUploadStatus] = useState<
//     "idle" | "loading" | "success" | "error"
//   >("idle");
//   const handleSetSelectedFile = (file: File | null): void => {
//     setSelectedFile(file);
//   };
//   const handleSetUploadStatus = (status: "idle" | "loading" | "success" | "error"): void => {
//     setUploadStatus(status);
//   };

// /************** Log table ****************/
// const mockHeaders = {"competencyCode":"competency code","skillCode":"skill Code", "status":"status", "remark":"remarks"};
// const mockStatsConfig = [
//   { label: "Records Added", key: "Success", badgeClass: "bg-emerald-50" },
//   { label: "Records Failed", key: "Failed", badgeClass: "bg-red-50" },
//   { label: "Records Updated", key: "Updated", badgeClass: "bg-amber-50" },
//   { label: "Total Records", key: "total" },
// ];
// /**
//  * Resets all the state variables used in the bulk upload dialog
//  * to their initial values, which is an empty array for 
//  * competencyCategory and importanceLevel, an empty array for uploadLog, and
//  * "idle" for uploadStatus.
//  */
// const reset = () => {
//   setUploadLog([]);
//   setUploadStatus("idle");
// }

//   return (
//     <Dialog onOpenChange={()=>{reset()}}>
//       <DialogTrigger asChild>
//         <Button >Bulk Upload</Button>
//       </DialogTrigger>
//       <DialogContent className="w-[90vw] h-[80vh] md:w-[60vw]">
//         <DialogHeader>
//           <DialogTitle>Bulk Upload</DialogTitle>
//           <DialogDescription>
//             <div className="flex flex-col items-start md:flex-row gap-2 justify-between">
//               <p>Download the Bulk Template file, complete it with the required information, and upload it.</p>
//               <TemplateGenerator columnsConfig={columnsConfig} TemplateName={"CompetencySkillmappingTemplate"}/>
//             </div>
//           </DialogDescription>
//         </DialogHeader>
//         {/* <ScrollArea className="h-full rounded-md "> */}
//         <div className="block min-w-0 h-full overflow-y-auto">
//         <FileUploadArea
//                   setSelectedFile={handleSetSelectedFile}
//                   selectedFile={selectedFile}
//                   uploadStatus={uploadStatus}
//                   setUploadStatus={handleSetUploadStatus}
//                   triggerUpload={function (): void {
//                     handleUpload();
//                   } } 
//                   filetypes={".xlsx,.xls"}       
//                    />
//         <LogTable headers={mockHeaders} uploadLog={uploadLog} uploadStatus={"idle"} statsConfig={mockStatsConfig}/>
//         </div>
//         {/* </ScrollArea> */}
//       </DialogContent>
      
//     </Dialog>
//   );
// }
