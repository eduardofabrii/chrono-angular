export interface ProjectReportFilter {
  selectedProjects: number[];
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface ProjectReportItem {
  name: string;
  status: string;
  hours: number;
  projectId?: number;
}
