export interface PostProjectRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  responsible: { id: string; name: string; email: string };
  priority: string;
  createdDate: string;
}
