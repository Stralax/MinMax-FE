import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserContext {
  [key: string]: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export interface ChatResponse {
  status: string;
  message: string;
  chat_history?: any[];
  seed_prediction?: string;
  image_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  // Fix the API URL - it should not have 'api/chatbot/' prefixed to each endpoint
  private apiUrl = 'http://localhost:5000'; // Remove the duplicated path segment

  personas: Persona[] = [
    {
      id: 'mystara',
      name: 'Babushka Zoya',
      description: 'A sarcastic Russian fortune teller who delivers divine roastings with tough love. Expect unsolicited life advice and passive-aggressive wisdom.',
      image: 'assets/babushka.jpg'
    },
    {
      id: 'chadwick',
      name: 'Chadwick',
      description: 'A laid-back surfer bro who catches cosmic waves and translates them into fortunes.',
      image: 'assets/images/chadwick.jpg'
    },
    {
      id: 'zorp',
      name: 'Zorp',
      description: 'An alien intern analyzing human fortunes with detached scientific curiosity.',
      image: 'assets/images/zorp.jpg'
    },
    {
      id: 'wellness',
      name: 'Sage Harmony',
      description: 'A holistic wellness guide who connects your life patterns to practical health advice through coffee cup readings.',
      image: 'assets/images/wellness-oracle.jpg'
    }
  ];

  constructor(private http: HttpClient) { }

  testBackendConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/chatbot/test`);
  }

  startFortuneSession(
    personaId: string, 
    userContext: UserContext
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/chatbot/start`, {
      persona_name: personaId,
      user_context: userContext
    });
  }

  continueFortuneSession(
    personaId: string,
    chatHistory: any[],
    userMessage: string
  ): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/api/chatbot/continue`, {
      persona_name: personaId,
      chat_history: chatHistory,
      user_message: userMessage
    });
  }
}
