import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {

  userMessage = "";
  messages: any[] = [];
  isOpen = false;

  constructor(private http: HttpClient) {}

  sendMessage() {

    if (!this.userMessage) return;

    // Show user message
    this.messages.push({
      sender: "user",
      text: this.userMessage
    });

    // API call to Node backend
    this.http.post("http://localhost:30002/chat", {
      message: this.userMessage
    }).subscribe({
      next: (res: any) => {
        this.messages.push({
          sender: "bot",
          text: res.reply
        });
      },
      error: (err) => {
        console.error("Angular Error:", err);

        this.messages.push({
          sender: "bot",
          text: "Error connecting to chatbot."
        });
      }
    });

    this.userMessage = "";
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }
}
