import { useLanguageStore } from '@/lib/store';
import messagesEn from '@/data/messages.en.json';
import messagesAr from '@/data/messages.ar.json';

export function useMessages() {
  const { language } = useLanguageStore();
  
  const messages = language === 'ar' ? messagesAr : messagesEn;
  
  return messages;
}