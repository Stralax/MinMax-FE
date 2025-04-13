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
  private apiUrl = 'http://localhost:5000/api/chatbot';

  // Define personas
  personas: Persona[] = [
    {
      id: 'mystara',
      name: 'Mystara',
      description: 'A mysterious fortune teller with a calm and enigmatic presence.',
      image: 'assets/images/mystara.jpg'
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
    }
  ];

  constructor(private http: HttpClient) { }

  testBackendConnection(): Observable<any> {
    // Fix the URL by removing the duplicated 'chatbot' segment
    return this.http.get<any>(`${this.apiUrl}/test`);
  }

  startFortuneSession(
    personaId: string, 
    userContext: UserContext, 
    useFunnySeeds: boolean = false
  ): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/start`, {
      persona_name: personaId,
      user_context: userContext,
      use_funny_seeds: useFunnySeeds
    });
  }

  continueFortuneSession(
    personaId: string,
    chatHistory: any[],
    userMessage: string
  ): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/continue`, {
      persona_name: personaId,
      chat_history: chatHistory,
      user_message: userMessage
    });
  }
}
