export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role?: string;
  active?: boolean;
  lastLogin?: Date | string;
  deletedAt?: Date | string | null;
}
