// import UserListActiveIcon from "../Icons/userlist/UserListActiveIcon";
// import UserListIcon from "../Icons/userlist/UserListIcon";
// import CompetencyListIcon from "../Icons/competency/CompetencyListIcon";
// import CompetencyListActiveIcon from "../Icons/competency/CompetencyListActiveIcon";
// import SkillIcon from "../Icons/skill/SkillIcon";
// import SkillActiveIcon from "../Icons/skill/SkillActiveIcon";
// import RoleMasterIcon from "../Icons/rolemaster/RoleMasterIcon";
// import RoleMasterActiveIcon from "../Icons/rolemaster/RoleMasterActiveIcon";
// import SkillMappingIcon from "../Icons/skill/SkillMappingIcon";
// import SkillMappingActiveIcon from "../Icons/skill/SkillMappingActiveIcon";
// import AppraisalIcon from "../Icons/appraisal/AppraisalIcon";
// import AppraisalActiveIcon from "../Icons/appraisal/AppraisalActiveIcon";
// import EligibilityIcon from "../Icons/EligibilityMaster/EligibilityIcon";
// import EligibilityActiveIcon from "../Icons/EligibilityMaster/EligibilityActiveIcon";
// import EntityOpen from "../Icons/Entity/EntityActiveIcon";
// import EntittyClosed from "../Icons/Entity/EntittyIcon";
// import DepartmentOpen from "../Icons/department/DepartmentActiveIcon";
// import DepartmentClosed from "../Icons/department/DepartmentIcon";
// import RoleMappingIcon from "../Icons/rolemapping/RoleMappingIcon";
// import RoleMappingActiveIcon from "../Icons/rolemapping/RoleMappingActiveIcon";
// import TrainingMasterIcon from "../Icons/Training/TrainingMasterIcon";
// import TrainingActiveIcon from "../Icons/Training/TrainingMasterActive";
// import AssessmentIcon from "../Icons/assessment/AssessmentIcon";
// import AssessmentActiveIcon from "../Icons/assessment/AssessmentActiveIcon";
// import UserRole from "../../../public/userrole.json";
// import { GraduationCapIcon } from "../Icons/Training/GraduationCapIcon";
// import TrainingProgramIcon from "../Icons/Training/TrainingProgramIcon";
// import Scheduletraining from "../Icons/scheduletraining/Scheduletraining";
// import ScheduleTrainingActiveIcon from "../Icons/scheduletraining/ScheduleTrainingActiveIcon"
// import TrainingProgramActive from "../Icons/Training/TrainingProgramActive";
// import { GraduationCapIconActive } from "../Icons/Training/GraduationCapIconActive";
// import TeamIcon from "../Icons/team/teamIcon";
// import TeamActiveIcon from "../Icons/team/teamActiveIcon";

// interface Item {
//   title: string;
//   id: string;
//   link: string;
//   icon?: JSX.Element;
//   icontwo?: JSX.Element;
//   roles: any[];
// }

// interface SidebarItem {
//   title: string;
//   id: string;
//   link: string;
//   icon: JSX.Element;
//   icontwo: JSX.Element;
//   submenus?: Item[];
//   roles: any[];
// }

// export const SidebarData: SidebarItem[] = [
//   {
//     title: "User Master",
//     id: "userlist_menu",
//     link: "/userlist",
//     icon: <UserListIcon />,
//     icontwo: <UserListActiveIcon />,
//     roles: [UserRole.HR901, UserRole.SL123],
//   },
//   {
//     title: "Role Master",
//     id: "roll_component",
//     link: "/rolemaster",
//     icon: <RoleMasterIcon />,
//     icontwo: <RoleMasterActiveIcon />,
//     roles: [UserRole.HR901, UserRole.SL123],
//   },
//   {
//     title: "Role Mapping",
//     id: "employee_component",
//     link: "/employeelist",
//     icon: <RoleMappingIcon />,
//     icontwo: <RoleMappingActiveIcon />,
//     roles: [UserRole.RM678,UserRole.HR901, UserRole.SL123],
//   },
//   {
//     title: "Competency Master",
//     id: "competencylist_menu",
//     link: "/competencylist",
//     icon: <CompetencyListIcon />,
//     icontwo: <CompetencyListActiveIcon />,
//     roles: [UserRole.HR901, UserRole.SL123],
//   },
//   {
//     title: "Skill Master",
//     id: "skillmaster_menu",
//     link: "/skillmaster",
//     icon: <SkillIcon />,
//     icontwo: <SkillActiveIcon />,
//     roles: [UserRole.HR901, UserRole.SL123],
//   },
//   {
//     title: "Competency Skill Mapping",
//     id: "skill_component",
//     link: "/competencyskillmapping",
//     icon: <SkillMappingIcon />,
//     icontwo: <SkillMappingActiveIcon />,
//     roles: [UserRole.HR901, UserRole.SL123],
//   },
//   {
//     title: "Appraisal",
//     id: "appraisalconfig_menu",
//     link: "#", // Prevent navigation on main menu click
//     icon: <AppraisalIcon />,
//     icontwo: <AppraisalActiveIcon />,
//     roles: [UserRole.HR901, UserRole.SL123],
//     submenus: [
//       {
//         title: "Appraisal Configuration",
//         id: "appraisal_menu",
//         link: "/appraisalconfiguration",
//         roles: [UserRole.HR901, UserRole.SL123],
//       },
//       {
//         title: "Appraisal Forms",
//         id: "appraisallist_menu",
//         link: "/appraisallist",
//         roles: [UserRole.HR901, UserRole.SL123],
//       },
//     ],
//   },
//   {
//     title: "Eligibility Master",
//     id: "eligibility",
//     link: "/eligibilitylist",
//     icon: <EligibilityIcon />,
//     icontwo: <EligibilityActiveIcon />,
//     roles: [UserRole.HR901, UserRole.SL123],
//   },
//   {
//     title: "Entity Master",
//     id: "entity",
//     link: "/entitylist",
//     icon: <EntityOpen />,
//     icontwo: <EntittyClosed />,
//     roles: [UserRole.HR901, UserRole.SL123],
//   },
//   {
//     title: "Department Master",
//     id: "department",
//     link: "/departmentlist",
//     icon: <DepartmentOpen />,
//     icontwo: <DepartmentClosed />,
//     roles: [UserRole.HR901, UserRole.SL123],
//   },
//   {
//     title: "Assessment",
//     id: "assessment_menu",
//     link: "/assessment",
//     icon: <AssessmentIcon />,
//     icontwo: <AssessmentActiveIcon />,
//     roles: [UserRole.EM345, UserRole.RM678],
//   },
//   {
//     title: "Training Master",
//     id: "training",
//     link: "/traininglist",
//     icon: <TrainingMasterIcon />,
//     icontwo: <TrainingActiveIcon />,
//     roles: [UserRole.RM678, UserRole.LC234, UserRole.LM567, UserRole.TR890],
//   },
//   {
//     title: "Training & Assessment",
//     id:"training_req",
//     link:"/trainingrequests",
//     icon:<GraduationCapIconActive />,
//     icontwo:<GraduationCapIcon />,
//     roles: [UserRole.RM678],
//   },
//   {
//     title:"Training Program",
//     id:"training_program",
//     link:"/listoftrainings",
//     icon:<TrainingProgramIcon  />,
//     icontwo:<TrainingProgramActive />,
//     roles: [UserRole.HR901, UserRole.LM567, UserRole.SL123],
//   },
//   {
//     title:"Schedule Training",
//     id:"schedule_training",
//     link:"/approvedtraininglist",
//     icon:<Scheduletraining/>,
//     icontwo:<ScheduleTrainingActiveIcon/>,
//     roles: [UserRole.LM567, UserRole.TR890],
//   },
//   {
//     title:"My Team",
//     id:"my_team",
//     link:"/manageremployeelist",
//     icon:<TeamIcon/>,
//     icontwo:<TeamActiveIcon/>,
//     roles: [UserRole.RM678],
//   },
//   // {
//   //   title:"Schedule Training",
//   //   id:"schedule_training",
//   //   link:"/approvedtraininglist",
//   //   icon:<TrainingProgramIcon className="black" />,
//   //   icontwo:<TrainingProgramIcon className="white"/>,
//   // },
// ];

