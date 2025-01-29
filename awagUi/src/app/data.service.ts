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

import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { GetEvaluationDataResult } from "./models/evaluation-feedback-data.model";
import { EvaluationFeedbackResponse } from "./models/evaluation-feedback-data.model";
import { EvaluationFeedbackData } from "./models/evaluation-feedback-data.model";
import { EvaluationFeedbackDataPartial } from "./models/evaluation-feedback-data.model";
import { PersonaResponse } from "./models/evaluation-feedback-data.model";
import { Persona } from "./models/evaluation-feedback-data.model";
import { GetTrainingDataResult } from "./models/training-data.model";
import { TrainingSubmissionData } from "./models/training-data.model";
import { TrainingSubmissionResponse } from "./models/training-data.model";
import { IgnoreSubmissionData } from "./models/training-data.model";
import { IgnoreSubmissionResponse } from "./models/training-data.model";
import { ModelsSimpleQueryResult } from "./models/chat.model";
import { ChatRequest } from "./models/chat.model";
import { ChatResponse } from "./models/chat.model";

import { environment } from '../environments/environment';

@Injectable({
  providedIn: "root",
})
export class DataService {

  private apiUrlData = environment.apiUrlData;
  private apiUrlML = environment.apiUrlML;

  private agentId: string | null = null;
  private authHeaders: HttpHeaders | null = null;


  constructor(private http: HttpClient) {}


  setAuthHeaders(clientId: string, clientToken: string): void {

    this.agentId = clientId
    this.authHeaders = new HttpHeaders()
      .set('x-client-id', clientId)
      .set('x-client-token', clientToken);

  }


  getAuthHeaders(): HttpHeaders {

    if (this.authHeaders != null) {
      return this.authHeaders;
    } else {
      return new HttpHeaders();
    }

  }


  getEvaluationData(
    tag: string | null,
    desc: boolean,
    page: number,
    count: number,
    excludeItemsWithFeedback: boolean = false,
    onlyIncludeWithManual: boolean = false,
    selectedPersona: string | null = null,
    lastNHours: number = -1,
    contextId: string | null = null,
    itemId: string | null = null,
    classificationName: string | null = null,
    evaluationLikertValMin: number | null = null,
    evaluationLikertValMax: number | null = null,
    subsetPercent: number | null = null,
    subsetTag: string | null = null
  ): Observable<GetEvaluationDataResult> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('count', count.toString())
      .set('desc', desc.toString());

    if (tag) {
      params = params.set('tag', tag);
    }

    if (subsetPercent) {
      if (! subsetTag) {
        subsetTag = tag
      }
      params = params.set('subsetPercent', subsetPercent);
      if (subsetTag) {
        params = params.set('subsetTag', subsetTag);
      }
    }

    if (selectedPersona) {
      params = params.set('personaId', selectedPersona);
    }

    if (contextId) {
      params = params.set('contextId', contextId);
    }

    if (itemId) {
      params = params.set('itemId', itemId);
    }

    if (lastNHours > -1) {
      params = params.set('lastNHours', lastNHours);
    }

    if (excludeItemsWithFeedback) {
      params = params.set('excludeItemsWithFeedback', 'true');
    }

    if (onlyIncludeWithManual) {
      params = params.set('onlyIncludeWithManual', 'true');
    }

    if (evaluationLikertValMin) {
      params = params.set('evaluationLikertValMin', evaluationLikertValMin.toString());
    }

    if (evaluationLikertValMax) {
      params = params.set('evaluationLikertValMax', evaluationLikertValMax.toString());
    }

    if (classificationName) {
      params = params.set('classificationName', classificationName);
    }

    console.log("getEvaluationData()", params);

    return this.http.get<GetEvaluationDataResult>(this.apiUrlData + '/eval/get-evaluation-data', { params: params, headers: this.getAuthHeaders() })
        .pipe(catchError(this.handleError));

  }


  private handleError(error: any): Observable<never> {

    console.error("An error occurred:", error);
    return throwError("Something bad happened; please try again later.");

  }


  postFeedback(data: EvaluationFeedbackData): Observable<EvaluationFeedbackResponse> {

    console.log("postFeedback:", data);
    
    let url = `${this.apiUrlData}/eval/record-evaluation-feedback`;
    console.log("url:", url);
    
    return this.http.post<EvaluationFeedbackResponse>(url, data, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
    
  }


  postPartialFeedback(data: EvaluationFeedbackDataPartial): Observable<EvaluationFeedbackResponse> {

    console.log("postPartialFeedback:", data);
    
    let url = `${this.apiUrlData}/eval/record-evaluation-feedback-partial`;
    console.log("url:", url);
    
    return this.http.post<EvaluationFeedbackResponse>(url, data, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
    
  }


  getPersonas(): Observable<Persona[]> {

    const params = {
      version: '-1'
    };
    return this.http.get<PersonaResponse>(`${this.apiUrlData}/eval/get-evaluation-persona`, { params: params, headers: this.getAuthHeaders() })
      .pipe(map(response => response.data));

  }


  getTags(type: string, lastNHours?: number): Observable<string[]> {

    let params = new HttpParams().set('type', type);

    if (lastNHours !== undefined) {
      params = params.set('lastNHours', lastNHours.toString());
    }

    return this.http.get<{ data: string[], message: string, status: string }>(
        `${this.apiUrlData}/misc/get-tags`, 
        { params: params, headers: this.getAuthHeaders() }
      )
      .pipe(
        map(response => response.data), 
        catchError(this.handleError)
      );

  }


  getSubsetTags(): Observable<string[]> {

    let params = new HttpParams();

    return this.http.get<{ data: string[], message: string, status: string }>(
        `${this.apiUrlData}/subsets/subset`, 
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map(response => response.data), 
        catchError(this.handleError)
      );

  }


  getSubsetPercentages(tag: string): Observable<number[]> {

    if (! tag) {
      return of([])
    }

    return this.http.get<{ data: number[], message: string, status: string }>(
        `${this.apiUrlData}/subsets/subset/${tag}`, 
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map(response => response.data), 
        catchError(this.handleError)
      );

  }


  getModels(): Observable<Array<{ model_id: string, model_desc: string }>> {

    let params = new HttpParams();

    // apiUrlML still needs agent param
    if (this.agentId !== null) {
      params = params.set('agent', this.agentId);
    }

    return this.http.get<Array<{ model_id: string, model_desc: string }>>(`${this.apiUrlML}/getmodels`, { params: params, headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }


  getTrainingData(
    tag: string | null,
    desc: boolean,
    page: number,
    count: number,
    onlyIncludeUntrained: boolean = false,
    lastNHours: number = -1,
    itemId: string | null = null,
    classificationName: string[] | null = null,
    type: string | null = null,
    subsetPercent: number | null = null,
    subsetTag: string | null = null
  ): Observable<GetTrainingDataResult> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('count', count.toString())
      .set('desc', desc.toString());

    if (tag) {
      params = params.set('tag', tag);
    }

    if (subsetPercent) {
      if (! subsetTag) {
        subsetTag = tag
      }
      params = params.set('subsetPercent', subsetPercent);
      if (subsetTag) {
        params = params.set('subsetTag', subsetTag);
      }
    }

    if (itemId) {
      params = params.set('itemId', itemId);
    }

    if (lastNHours > -1) {
      params = params.set('lastNHours', lastNHours);
    }

    if (onlyIncludeUntrained) {
      params = params.set('onlyIncludeUntrained', 'true');
    }

    if (classificationName) {
      params = params.set('classificationName', classificationName.toString());
    }

    if (type) {
      params = params.set('type', type);
    }

    console.log("getTrainingData()", params);

    return this.http.get<GetTrainingDataResult>(this.apiUrlData + '/class/fetch-training-items', { params: params, headers: this.getAuthHeaders() })
        .pipe(catchError(this.handleError));

  }


  postTrainingSubmission(data: TrainingSubmissionData): Observable<TrainingSubmissionResponse> {

    console.log("postTrainingSubmission:", data);
    
    let url = `${this.apiUrlData}/class/process-classification-feedback`;
    console.log("url:", url);
    
    return this.http.post<TrainingSubmissionResponse>(url, data, { headers: this.getAuthHeaders() }).pipe(
        catchError(this.handleError)
      );

  }


  postIgnoreSubmission(data: IgnoreSubmissionData): Observable<IgnoreSubmissionResponse> {

    console.log("postIgnoreSubmission:", data);
    
    let url = `${this.apiUrlData}/class/ignore-classification-item`;
    console.log("url:", url);
    
    return this.http.post<IgnoreSubmissionResponse>(url, data, { headers: this.getAuthHeaders() }).pipe(
        catchError(this.handleError)
      );

  }


  getModelsSimple(tag?: string, includeDeleted: boolean = false): Observable<ModelsSimpleQueryResult> {

    let params = new HttpParams().set('simple', 'true');

    if (tag) {
      params = params.set('tag', tag);
    }

    if (includeDeleted) {
      params = params.set('include_deleted', 'true');
    }

    let url = `${this.apiUrlData}/train/models`;

    return this.http.get<ModelsSimpleQueryResult>(url, { headers: this.getAuthHeaders(), params: params }).pipe(
      catchError((error: HttpErrorResponse) => {
        const message = "Error fetching model details";
        const customResult: ModelsSimpleQueryResult = {
          status: 'Error',
          message: message,
          models: [],
          current_time_ms: Date.now()
        };
        return of(customResult);
      })
    );
  }


  doChat(chatRequest: ChatRequest, resetConversation: boolean = false): Observable<ChatResponse> {

    let params = new HttpParams();

    if (resetConversation) {
      params = params.set('reset_conversation', 'true');
    }

    const url = `${this.apiUrlData}/chat/ask`;

    return this.http.post<ChatResponse>(url, chatRequest, { headers: this.getAuthHeaders(), params: params }).pipe(
      catchError((error: HttpErrorResponse) => {
        const message = "Error processing chat request";
        const customResponse: ChatResponse = {
          status: 'Error',
          message: message,
          chat_request: chatRequest.chat_request,
          chat_response: '',
          conversation_id: '',
          info_json: {},
          current_time_ms: Date.now()
        };
        return of(customResponse);
      })
    );
  }

}
