export interface PutReleaseTimeRequest {
  id: string;
  activity: { id: string };
  user: { id: string };
  description: string;
  startDate: string;
  endDate: string;
}
