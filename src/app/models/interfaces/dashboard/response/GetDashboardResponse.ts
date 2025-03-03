export interface GetDashboardResponse {
  totalProjects: number;
  projectStatusCounts: {
    status: string;
    count: number;
  }[];
  totalActivities: number;
  totalHours: number;
  projectHoursData: {
    projectId: number;
    projectName: string;
    projectStatus: string;
    totalHours: number;
  }[];
  userHoursData: {
    userId: number;
    userName: string;
    initials: string;
    totalHours: number;
  }[];
  pendingActivitiesByUser: {
    userId: number;
    userName: string;
    initials: string;
    pendingActivities: {
      activityId: number;
      activityName: string;
      status: string;
      deadline: string;
      projectId: number;
      projectName: string;
      userId: number;
      userName: string;
      overdue: boolean;
    }[];
  }[];
}
