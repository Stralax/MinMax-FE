import { Component, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatbotService, UserContext, Persona } from '../../services/chatbot.service';
import { marked } from 'marked';
import { GetInfoComponent } from '../get-info/get-info.component';
import { environment } from '../../environments/environment';

interface ChatMessage {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, GetInfoComponent],
  templateUrl: './chatbot-page.component.html',
  styleUrls: ['./chatbot-page.component.css'],
  providers: [ChatbotService]
})
export class ChatbotPageComponent implements OnInit {
  personas: Persona[] = [];
  selectedPersona: Persona | null = null;
  userContext: UserContext = {
    name: 'Ana',
    age: '22',
    career: 'Computer Science Student',
    relationship_status: 'In a Relationship',
    main_question: 'Studies',
  };
  messages: ChatMessage[] = [];
  newMessage: string = '';
  chatHistory: any[] | null = null;
  isLoading: boolean = false;
  showContextForm: boolean = true;
  error: string | null = null;
  backendStatus: 'checking' | 'online' | 'offline' = 'checking';
  imageUrl: string = 'https://placehold.co/800x400?text=Coffee+Fortune'; // Placeholder image

  availableContextFields = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'career', label: 'Career' },
    { key: 'relationship_status', label: 'Relationship Status' },
    { key: 'main_question', label: 'Main Category' },
  ];

  constructor(
    private chatbotService: ChatbotService,
    private sanitizer: DomSanitizer
  ) {}

  private myRepeatingFunction() {
    const imageUrl: string = environment.resultIMG;
  }
  

  ngOnInit() {
    this.personas = this.chatbotService.personas;

  }

  OnChange(){
    this.myRepeatingFunction();
  }

  

  checkBackendStatus() {
    this.backendStatus = 'checking';
    this.chatbotService.testBackendConnection().subscribe({
      next: () => {
        this.backendStatus = 'online';
        console.log('Backend server is online and responding.');
      },
      error: (err) => {
        this.backendStatus = 'offline';
        console.error('Backend server connection failed:', err);
        this.error = 'Cannot connect to the backend server. Please ensure the Flask server is running on port 5000.';
      }
    });
  }

  selectPersona(persona: Persona) {
    this.selectedPersona = persona;
  }

  startChat() {
    if (!this.selectedPersona) {
      this.error = 'Please select a persona first';
      return;
    }

    // Don't proceed if backend is known to be offline
    if (this.backendStatus === 'offline') {
      this.error = 'Cannot connect to the backend server. Please make sure the Flask server is running on port 5000.';
      return;
    }

    // Filter out empty fields
    const cleanContext: UserContext = {};
    for (const [key, value] of Object.entries(this.userContext)) {
      if (value && value.trim() !== '') {
        cleanContext[key] = value;
      }
    }

    this.isLoading = true;
    this.error = null;

    this.chatbotService.startFortuneSession(
      this.selectedPersona.id, 
      cleanContext
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success') {
          this.showContextForm = false;
          this.chatHistory = response.chat_history || null; // Handle undefined case
          // Set image URL if provided in the response
          if (response.image_url) {
            this.imageUrl = response.image_url;
          }
          // Add message without image URL
          this.messages.push({
            content: response.message,
            sender: 'bot',
            timestamp: new Date()
          });
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.backendStatus = 'offline';
        this.error = 'Failed to connect to the chatbot service. Please ensure the Flask server is running on port 5000.';
        console.error('Chatbot error:', err);
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedPersona || !this.chatHistory) {
      return;
    }

    const userMessage = this.newMessage.trim();
    this.messages.push({
      content: userMessage,
      sender: 'user',
      timestamp: new Date()
    });
    this.newMessage = '';
    this.isLoading = true;

    this.chatbotService.continueFortuneSession(
      this.selectedPersona.id,
      this.chatHistory,
      userMessage
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success') {
          this.chatHistory = response.chat_history || null; // Handle undefined case
          // Add message without image URL
          this.messages.push({
            content: response.message,
            sender: 'bot',
            timestamp: new Date()
          });
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Failed to get a response. Please try again.';
        console.error('Chatbot error:', err);
      }
    });
  }

  resetChat() {
    this.selectedPersona = null;
    this.userContext = {
      name: 'Anonymous Seeker',
      age: 'mysterious age',
      career: 'undisclosed profession',
      relationship_status: 'cosmic connection status',
      zodiac: 'celestial alignment',
      current_mood: 'contemplative',
      main_question: 'seeking universal wisdom',
      health_concern: 'overall wellbeing'
    };
    this.messages = [];
    this.chatHistory = null;
    this.showContextForm = true;
    this.error = null;
  }

  sanitizeAndRenderMarkdown(content: string): SafeHtml {
    if (!content) return '';
    
    // Use the synchronous version of marked
    const html = marked.parse(content, { async: false }) as string;
    
    // Sanitize the HTML to prevent XSS attacks
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}