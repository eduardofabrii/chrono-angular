export interface GetDashboardResponse {
  totalProjects: number;
  projectStatusCounts: { status: string; count: number }[];
  totalActivities: number;
  totalHours: number;
  projectHoursData: { projectId: string; projectName: string; projectStatus: string; totalHours: number }[];
  userHoursData: { userId: string; userName: string; initials: string; totalHours: number }[];
}
