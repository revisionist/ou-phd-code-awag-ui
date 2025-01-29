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

export interface EvaluationFeedbackData {
  agent: string;
  tags: string[];
  itemId: string;
  contextId: string;
  personaId: string;
  perspectiveId: string;
  classificationName: string;
  oldLikertValue: number;
  newLikertValue?: number | null;
  textLikertMismatch?: boolean | false;
  additionalDetails: Record<string, any>;
}


export interface EvaluationFeedbackDataPartial {
  agent: string;
  tags: string[];
  itemId: string;
  contextId: string;
  personaId: string;
  perspectiveId: string;
  classificationName: string;
  textLikertMismatch?: boolean | false;
}


export interface EvaluationFeedbackResponse {
    message: string;
    status: string;
}


export interface GetEvaluationDataResult {
    status: string;
    message: string;
    data: EvaluationData[];
    count: number;
    page: number;
    remaining: number;
}


export interface EvaluationData {
    agent_id: string;
    context: EvaluationContext;
    data_issue_flag: boolean;
    evaluate_source_channel: string;
    evaluate_source_originator: string;
    evaluate_source_type: string;
    evaluate_text: string;
    evaluate_time: string;
    evaluate_title: string;
    info: EvaluationInfo;
    item_id: string;
    persona_id: string;
    persona_name: string;
    persona_version: number;
    results: EvaluationResult[];
    tags: string[];
    timestamp: string;
}


export interface EvaluationContext {
    context_id: string;
    data_issue_flag?: boolean;
    evaluate_classifications?: string[];
    evaluate_perspectives?: string[];
    finish_reason?: string;
    items_in_batch?: number;
    total_tokens?: number;
}


export interface EvaluationInfo {
    item_from: EvaluationItemFrom;
    item_to: EvaluationItemTo[];
    item_type: string;
    item_type_desc: string;
    item_url: string;
    originator: string;
    provider_description: string;
    provider_name: string;
    provider_url: string;
}


export interface EvaluationItemFrom {
    address: string;
    group?: boolean;
    personal: string;
    type: string;
}


export interface EvaluationItemTo {
    address: string;
    group?: boolean;
    personal: string;
    type: string;
}


export interface EvaluationResult {
    classification_name: string;
    classification_options: string[];
    classification_value: string;
    perspectives: EvaluationPerspective[];
}


export interface EvaluationPerspective {
    perspective_id: string;
    perspective_name: string;
    perspective_text: string;
    perspective_version: number;
    evaluation_likert_text: string;
    evaluation_likert_val: number;
    evaluation_text: string;
    feedback: EvaluationPerspectiveFeedback | null;
}

export interface EvaluationPerspectiveFeedback {
    old_evaluation_likert_val: number;
    new_evaluation_likert_val: number;
    text_likert_mismatch?: boolean | false;
    feedback_timestamp: string;
}


export interface PersonaResponse {
  data: Persona[];
  message: string;
  status: string;
}


export interface Persona {
  agent_id: string;
  persona_id: string;
  persona_name: string;
  persona_text: string;
  persona_version: number;
  timestamp: string;
}
