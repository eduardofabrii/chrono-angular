export interface PutActivityResponse {
  id: string;
  project: { id: string };
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  responsible: { id: string; name: string; email: string };
  createdDate: string;
}
