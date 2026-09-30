export interface GetReleaseTimeResponse {
  id: string;
  activity: {
    id: string;
    name: string;
    project?: { id: string; name: string };
  };
  user: { id: string; name?: string };
  description: string;
  startDate: string;
  endDate: string;
}
