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

export interface TrainingSubmissionData {
  agent: string;
  itemId: string;
  tag: string | null;
  classifications: TrainingSubmissionClassificationItem[];
  additionalDetails: Record<string, any>;
}


export interface TrainingSubmissionClassificationItem {
  classificationName: string;
  classificationNew: string | null;
}


export interface TrainingSubmissionResponse {
    message: string;
    status: string;
}


export interface GetTrainingDataResult {
    status: string;
    message: string;
    data: TrainingData[];
    count: number;
    page: number;
    remaining: number;
}


export interface TrainingData {
    agentId: string;
    itemId: string;
    data_issue_flag: boolean;
    classifications : TrainingClassification[];
    bodyText: string;
    summaryText: string;
    subject: string;
    channel: string;
    date: Date;
    from: string;
    to: string;
    itemUrl: string;
    originator: string;
    providerName: string;
    providerUrl: string;
    type: string;
    typeDescription: string;
    summaryInfo: Record<string, any>;
    tagsMain: string[];
    timestamp: string;
}


export interface TrainingClassification {
    classificationName: string;
    classificationOrig: string;
    classificationNew: string | null;       // From the data service
    selectedClassification: string | null;  // From the UI
    availableClassifications: string[];
    tagsAction: string[];
    timestamp: string;
}


export interface IgnoreSubmissionData {
  agent: string;
  itemId: string;
}


export interface IgnoreSubmissionResponse {
    message: string;
    status: string;
}
