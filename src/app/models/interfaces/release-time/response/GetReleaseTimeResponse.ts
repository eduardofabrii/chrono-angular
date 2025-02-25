export interface GetReleaseTimeResponse {
  id: string;
  activityId: { id: string };
  user: { id: string };
  description: string;
  startDate: string;
  endDate: string;
}
