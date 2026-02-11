import type { TTask } from '../../../types';
import { API_BASE_URL } from '../constants';

/**
 * Fetches the list of tasks from the backend API
 */
export const fetchTasks = async (): Promise<TTask[]> => {
  const response = await fetch(`${API_BASE_URL}/api/tasks`);
  
  if (!response.ok) {
    throw new Error('Помилка сервера');
  }
  
  return response.json();
};
