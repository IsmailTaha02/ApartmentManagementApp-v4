import { Component,ElementRef,ViewChild,AfterViewChecked,OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesTopbarComponent } from '../TopBar/messages-topbar/messages-topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MessagesTopbarComponent, NgSelectModule],
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') chatMessages!: ElementRef;

  chats: any[] = [];
  selectedChat: any = null;
  newMessage: string = '';
  userId: number = Number(localStorage.getItem('user_id'));

  newChatReceiver: number | null = null;
  newChatMessage: string = '';
  newChatType: string = 'General';
  newChatApartment: number | null = null;
  availableUsers: any[] = [];

  private shouldScroll: boolean = false;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const apartmentId = params['apartmentId'];
      const contactUserId = params['contactUserId'];

      if (apartmentId) {
        this.initiateContactWithOwner(apartmentId);
      }

      this.loadMessages();

      this.http.get<any[]>('http://localhost:5000/users').subscribe(data => {
        this.availableUsers = data.filter(u => u.id !== this.userId);
        this.filteredAvailableUsers = this.availableUsers.filter(
          u => !this.chats.some(chat => chat.id === u.id)
        );

        if (contactUserId) {
          const matchingUser = this.availableUsers.find(u => u.id === Number(contactUserId));
          if (matchingUser) {
            this.newChatReceiver = matchingUser.id;
          }
        }
      });
    });
  }

  initiateContactWithOwner(apartmentId: number): void {
    this.http.get(`http://localhost:5000/apartments/${apartmentId}`).subscribe({
      next: (apartment: any) => {
        const messageContent = `Hello, I would like to contact you regarding your apartment at ${apartment.location}, ${apartment.city}, Unit: ${apartment.unit_number}.`;
        const newMsg = {
          sender_id: this.userId,
          apartment_id: apartmentId,
          content: messageContent,
          location: apartment.location,
          city: apartment.city,
          unit_number: apartment.unit_number
        };
        this.http.post('http://localhost:5000/messages', newMsg).subscribe(() => {
          this.loadMessages();
        });
      },
      error: (err) => {
        console.error('Failed to fetch apartment details:', err);
      }
    });

    this.router.navigate([], {
      queryParams: { apartmentId: null },
      queryParamsHandling: 'merge'
    });
  }

  loadMessages(): void {
    this.http.get<any[]>(`http://localhost:5000/messages?user_id=${this.userId}`).subscribe(data => {
      const grouped = this.groupMessages(data);
      this.chats = grouped;

      if (this.chats.length > 0) {
        // auto-select the first chat or your logic here
        this.selectChat(this.chats[0]);
      }
    });
  }

  filteredAvailableUsers: any[] = [];

  groupMessages(messages: any[]): any[] {
    const map = new Map<number, any>();

    for (const msg of messages) {
      if (!msg.sender || !msg.receiver) continue;

      const otherUser = msg.sender.id === this.userId ? msg.receiver : msg.sender;
      const existing = map.get(otherUser.id);

      if (!existing) {
        map.set(otherUser.id, {
          id: otherUser.id,
          name: otherUser.full_name,
          role: otherUser.role,
          lastMessage: msg.content,
          messages: [{
            content: msg.content,
            timestamp: msg.timestamp,
            isOwn: msg.sender.id === this.userId
          }]
        });
      } else {
        existing.messages.push({
          content: msg.content,
          timestamp: msg.timestamp,
          isOwn: msg.sender.id === this.userId
        });
        existing.lastMessage = msg.content;
      }
    }

    // Sort messages inside each chat by timestamp ascending (oldest first)
    for (const chat of map.values()) {
      chat.messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }

    return Array.from(map.values());
  }

  selectChat(chat: any): void {
    this.selectedChat = chat;
    this.shouldScroll = true; // flag to scroll after view update
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  sendMessage(): void {
    if (!this.newMessage || !this.selectedChat) return;

    const newMsg = {
      sender_id: this.userId,
      receiver_id: this.selectedChat.id,
      content: this.newMessage
    };

    this.http.post('http://localhost:5000/messages', newMsg).subscribe((savedMessage: any) => {
      this.selectedChat.messages.push({
        content: savedMessage.content,
        timestamp: savedMessage.timestamp,
        isOwn: true
      });
      this.selectedChat.lastMessage = savedMessage.content;
      this.newMessage = '';
      this.shouldScroll = true; // scroll after adding new message
    });
  }

  startNewChat() {
    if (!this.newChatReceiver || !this.newChatMessage) return;

    const newMsg = {
      sender_id: this.userId,
      receiver_id: this.newChatReceiver,
      content: this.newChatMessage,
      message_type: this.newChatType,
      apartment_id: this.newChatApartment
    };

    this.http.post('http://localhost:5000/messages', newMsg).subscribe(() => {
      this.loadMessages();
      this.newMessage = '';
      this.newChatReceiver = null;
      this.newChatMessage = '';
    });
  }

  // Automatically scroll chat window to bottom after view updated
  ngAfterViewChecked() {
    if (this.shouldScroll && this.chatMessages) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  scrollToBottom(): void {
    try {
      this.chatMessages.nativeElement.scrollTop = this.chatMessages.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}
