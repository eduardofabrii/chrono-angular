export interface User {
  id?: string | number;
  name: string;
  email: string;
  password?: string;
  role: string;
  active?: boolean;
  lastLogin?: Date | string;
  deletedAt?: Date | string | null;
}
