import type { TAutorun } from '../../../types';
import { API_BASE_URL } from '../constants';

export const fetchAutoruns = async (): Promise<TAutorun[]> => {
  const response = await fetch(`${API_BASE_URL}/api/autoruns`);
  
  if (!response.ok) {
    throw new Error('Помилка сервера при завантаженні автозавантаження');
  }
  
  return response.json();
};

export const fetchWhois = async (domain: string) => {
  const response = await fetch(`${API_BASE_URL}/api/whois?domain=${encodeURIComponent(domain)}`);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Помилка запиту');
  }
  return response.json();
};