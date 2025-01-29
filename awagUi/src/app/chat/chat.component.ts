/**
 * BSD 3-Clause Clear License
 *
 * Copyright (c) 2023-2025, David Goddard. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions, and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions, and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * NO EXPRESS OR IMPLIED LICENSES TO ANY PARTY'S PATENT RIGHTS ARE GRANTED BY
 * THIS LICENSE. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
 * CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT
 * NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER
 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

import { DataService } from "../data.service";
import { UtilityService } from "../utility.service";

import { ModelDetailsSimple } from "../models/chat.model";
import { ChatRequest } from "../models/chat.model";
import { ChatResponse } from "../models/chat.model";


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  agentId!: string;
  agentToken!: string;

  models: ModelDetailsSimple[] = [];
  messages: {sender: string, text: string}[] = [];
  newMessage: string = '';
  selectedModel: string = environment.chatDefaultModelId;
  resetConversation: boolean = false;

  isLoading: boolean = false;
  conversationId: string | null = null;

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {

    this.agentId = this.route.snapshot.paramMap.get("agentId") ?? "";
    this.agentToken = environment.agentToken;

    this.dataService.setAuthHeaders(this.agentId, this.agentToken);

    this.loadModels();
    this.subscribeToQueryParams();

  }


  loadModels(): void {

    this.dataService.getModelsSimple(undefined, false).subscribe(result => {
      // Prepend the default model option
      this.models = [{id: this.selectedModel, tag: 'Default', deleted_from_openai: false, deleted_from_objectstore: false, object: '', info: '', additional_details: {}, meta_created_ms: Date.now()}].concat(result.models);
    });

  }


  subscribeToQueryParams(): void {

    this.route.queryParams.subscribe(params => {
      if (params['model']) {
        this.selectedModel = params['model'];
      }
      this.resetConversation = params['reset'] === 'true' ? true : false;
    });

  }


  initParamsOld(): void {

    const queryParams = this.route.snapshot.queryParamMap;
    this.selectedModel = queryParams.get('model') || this.selectedModel; // Use URL param model or default
    this.resetConversation = queryParams.get('reset') === 'true';

    // Optionally, subscribe to queryParams observable if you want to react to changes in the params
  }

  onModelChange(): void {
    this.updateQueryParams();
  }

  onResetChange(): void {
    this.updateQueryParams();
  }


  sendMessage(): void {

    if (!this.newMessage.trim()) return;

    const messageToSend = this.newMessage;
    const chatRequest: ChatRequest = {
      chat_request: messageToSend,
      model: this.selectedModel,
      conversation_id: this.conversationId
    };

    this.isLoading = true;
    this.dataService.doChat(chatRequest, this.resetConversation).subscribe(response => {
      this.messages.push({ sender: 'You', text: messageToSend });
      this.messages.push({ sender: 'Chatbot', text: response.chat_response });
      this.conversationId = response.conversation_id;
      this.newMessage = '';
      this.isLoading = false;
    }, error => {
      // Handle any error
      console.error('Error sending message:', error);
      this.isLoading = false; // Ensure to stop the loading indication on error as well
    });
  }



  updateQueryParams(): void {
    // Update the URL without navigating
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { model: this.selectedModel, reset: this.resetConversation },
      queryParamsHandling: 'merge', // Merge with existing query params
    });
  }
}

