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

  constructor(private http: HttpClient) {}

  sendMessage() {

    if (!this.userMessage) return;

    this.messages.push({
      sender: "user",
      text: this.userMessage
    });

    this.http.post("http://localhost:3000/chat", {
      message: this.userMessage
    }).subscribe((res: any) => {

      this.messages.push({
        sender: "bot",
        text: res.reply
      });

    });

    this.userMessage = "";
  }
  isOpen = false;

toggleChat() {
  this.isOpen = !this.isOpen;
}
}