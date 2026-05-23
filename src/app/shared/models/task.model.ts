export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;      // ISO date string YYYY-MM-DD
  assignedTo: number;   // user id
  createdAt: string;
}