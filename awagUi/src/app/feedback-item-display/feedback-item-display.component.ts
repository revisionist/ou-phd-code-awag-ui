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

import { OnInit, Component, ViewEncapsulation, Renderer2, ElementRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { switchMap, tap, of } from 'rxjs';

import { ToastrService } from "ngx-toastr";
import { faCopy, faFileCode, faLayerGroup, faTags, faInfoCircle, faSquareCheck } from "@fortawesome/free-solid-svg-icons";

import { DataService } from "../data.service";
import { UtilityService } from "../utility.service";

import { GetEvaluationDataResult } from "../models/evaluation-feedback-data.model";
import { EvaluationData } from "../models/evaluation-feedback-data.model";
import { EvaluationResult } from "../models/evaluation-feedback-data.model";
import { EvaluationPerspective } from "../models/evaluation-feedback-data.model";
import { EvaluationFeedbackData } from "../models/evaluation-feedback-data.model";
import { EvaluationFeedbackDataPartial } from "../models/evaluation-feedback-data.model";
import { EvaluationFeedbackResponse } from "../models/evaluation-feedback-data.model";
import { Persona } from "../models/evaluation-feedback-data.model";

import { environment } from '../../environments/environment';


@Component({
  selector: "app-feedback-item-display",
  templateUrl: "./feedback-item-display.component.html",
  styleUrls: ["./feedback-item-display.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class FeedbackItemDisplayComponent implements OnInit {

  // Assign class properties for imports
  faCopy = faCopy;
  faFileCode = faFileCode;
  faLayerGroup = faLayerGroup;
  faTags = faTags;
  faInfoCircle = faInfoCircle;
  faSquareCheck = faSquareCheck;

  // General class properties
  agentId!: string;
  agentToken!: string;
  evaluationData!: EvaluationData[];

  // Page navigation properties
  page: number = 1;
  count: number = 10;
  remaining!: number;

  // Not currently used! (for additional detail dialogue)
  selectedItem: any;

  // Class variables for controls/filters
  selectedMode: string = 'mode1';
  desc: boolean = false;
  tag: string | null = null;
  selectedPersona: string = '';
  lastNHours: number = -1;
  contextId: string | null = null;
  itemId: string | null = null;
  classificationName: string = '';
  evaluationLikertValMin: number = 1;
  evaluationLikertValMax: number = 5;
  excludeItemsWithFeedback: boolean = false;
  onlyIncludeWithManual: boolean = false;
  subsetPercentagesStr: string | null = null;
  subsetPercent: number | null = null;
  subsetTag: string | null = null;
  cleanUi: boolean = false;
  lastNHoursOptions = ["Any", "Last 2 hours", "Last 4 hours", "Last 12 hours", "Last day", "Last 2 days"];

  // Data to populate static controls/filters
  readonly modes = [
    { value: 'mode1', label: 'Mode 1' },
    { value: 'mode2', label: 'Mode 2' }
  ];
  readonly lastNHoursValues: { [key: string]: number } = {
    "Any": -1,
    "Last 2 hours": 2,
    "Last 4 hours": 4,
    "Last 12 hours": 12,
    "Last day": 24,
    "Last 2 days": 48
  };
  readonly likertOptions = [
    { value: 1, label: "Strongly disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Agree" },
    { value: 5, label: "Strongly agree" },
  ];

  // Variables for dynamic controls/filters
  tags: string[] = [];
  subsetTags: string[] = [];
  subsetPercentages: number[] = [];
  personas: Persona[] = [];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    public utilityService: UtilityService,
    private toastr: ToastrService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    // Not currently initialising any properties in the constructor
  }


  ngOnInit(): void {

    this.agentId = this.route.snapshot.paramMap.get("agentId") ?? "";
    this.agentToken = environment.agentToken;

    this.dataService.setAuthHeaders(this.agentId, this.agentToken);

    this.selectedMode = this.route.snapshot.queryParamMap.get("mode") || 'mode1';
    this.tag = this.route.snapshot.queryParamMap.get("tag");
    const descStr = this.route.snapshot.queryParamMap.get("desc");
    this.desc = descStr ? descStr === "true" : false;
    const cleanUiStr = this.route.snapshot.queryParamMap.get("cleanUi");
    this.cleanUi = cleanUiStr ? cleanUiStr === "true" : false;
    this.subsetTag = this.route.snapshot.queryParamMap.get("subsetTag");
    const subsetPercentagesStr = this.route.snapshot.queryParamMap.get("subsetPercent");
    
    this.subsetPercent = subsetPercentagesStr !== null ? parseInt(subsetPercentagesStr, 10) : null;
    if (this.subsetPercent && isNaN(this.subsetPercent)) {
      this.subsetPercent = null;
    }
    
    this.dataService.getPersonas().subscribe(response => {
      this.personas = response;
    });

    this.route.queryParams.subscribe(params => {
      if (params['tag'] !== undefined) {
        this.tag = params['tag'];
      }
      if (params['mode'] !== undefined) {
        this.selectedMode = params['mode'];
        this.onReloadableChange();
      }
      if (params['cleanUi'] !== undefined) {
        this.cleanUi = params['cleanUi'] === 'true';
        this.onReloadableChange();
      }
      if (params['subsetPercent'] !== undefined) {
        this.subsetPercent = params['subsetPercent'];
        this.onReloadableChange();
      }
      if (params['subsetTag'] !== undefined) {
        this.subsetTag = params['subsetTag'];
        this.onReloadableChange();
      }
      
    });
    
    //this.desc = this.route.snapshot.queryParamMap.get('desc') === 'true';
    this.loadTags();
    this.loadSubsets();
    this.loadData();
  }


  ngAfterViewInit(): void {
    console.log('Value of lastNHoursOptions after view init:', this.lastNHoursOptions);
  }


  onReloadableChange(): void {
    this.loadTags();
    this.loadSubsets();
    this.loadData();
  }


  updateURLParameters(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        mode: this.selectedMode,
        tag: this.tag,
        desc: this.desc ? 'true' : 'false',
        cleanUi: this.cleanUi ? 'true' : 'false',
        excludeItemsWithFeedback: this.excludeItemsWithFeedback ? 'true' : 'false',
        onlyIncludeWithManual: this.onlyIncludeWithManual ? 'true' : 'false',
        subsetTag: this.subsetTag,
        subsetPercent: this.subsetPercent
      },
      queryParamsHandling: 'merge'
    });
  }


  loadData() {
    console.log("Loading data...");
    this.updateURLParameters();
    this.dataService
      .getEvaluationData(
        this.tag,
        this.desc,
        this.page,
        this.count,
        this.excludeItemsWithFeedback,
        this.onlyIncludeWithManual,
        this.selectedPersona,
        this.lastNHours,
        this.contextId,
        this.itemId,
        this.classificationName,
        this.evaluationLikertValMin,
        this.evaluationLikertValMax,
        this.subsetPercent,
        this.subsetTag
        ).subscribe(
        (result: GetEvaluationDataResult) => {
          console.log("Data received:", result);
          this.evaluationData = result.data;
          this.count = result.count;
          this.page = result.page;
          this.remaining = result.remaining;
        },
        (error) => {
          console.error("Error fetching data:", error);
        }
      );
  }


  loadTags(): void {
    this.dataService.getTags('evaluation', this.lastNHours)
      .subscribe(
        tags => {
          this.tags = tags;
          console.log('Loaded tags:', tags);
        },
        error => console.error('Error fetching tags:', error)
      );
  }


  loadSubsets(): void {
    this.dataService.getSubsetTags()
      .pipe(
        tap(subsetTags => {
          console.log('Loaded subsetTags:', subsetTags);
          this.subsetTags = subsetTags;
          if (!this.subsetTag && subsetTags.length > 0) {
            this.subsetTag = subsetTags[0];
          }
        }),
        switchMap(() => {
          if (!this.subsetTag) {
            console.error('No subsetTag available for getSubsetPercentages');
            return of([]);
          }
          return this.dataService.getSubsetPercentages(this.subsetTag);
        })
      )
      .subscribe(
        percentages => {
          console.log('Percentages for the tag:', percentages);
          this.subsetPercentages = percentages;
        },
        error => console.error('Error in the process:', error)
      );
  }


  onModeChange(): void {

   this.updateURLParameters();
   this.onReloadableChange();

  }


  getPersonaText(personaId: string): string {
    const persona = this.personas.find(p => p.persona_id === personaId);
    return persona ? persona.persona_text : '';
  }


  getLikertLabel(val: number): string {
    const option = this.likertOptions.find(option => option.value === val);
    return option ? option.label : 'Unknown';
  }


  onFeedbackChange(
    item: EvaluationData,
    result: EvaluationResult,
    perspective: EvaluationPerspective,
    event: Event | null,
    alwaysReload: boolean = false
  ): void {

    console.log("onFeedbackChange", event);
    console.log("item:", item);

    let newLikertValue: number | null = null;

    if (event) {
      const selectElement = event.target as HTMLSelectElement;
      console.log("selectElement.value:", selectElement.value);
      newLikertValue = Number(selectElement.value);
    }

    const textLikertMismatch = perspective.feedback ? perspective.feedback.text_likert_mismatch ?? false : false;

    const feedbackData: EvaluationFeedbackData = {
      agent: item.agent_id,
      tags: item.tags,
      itemId: item.item_id,
      contextId: item.context.context_id,
      personaId: item.persona_id,
      perspectiveId: perspective.perspective_id,
      classificationName: result.classification_name,
      oldLikertValue: perspective.evaluation_likert_val,
      newLikertValue: newLikertValue,
      textLikertMismatch: textLikertMismatch,
      additionalDetails: {},
    };

    console.log("Built feedbackData:", feedbackData);

    this.dataService.postFeedback(feedbackData).subscribe(
      (response) => {
        this.toastr.success(response.message);
        console.log("Feedback posted successfully!", response);
      },
      (error) => {
        this.toastr.error("There was an error recording your feedback.");
        console.error("Error posting feedback:", error);
      }
    );

    if (this.excludeItemsWithFeedback || alwaysReload) {
      setTimeout(() => {
        this.loadData();
      }, 500);
    }
  }


  updateMismatch(checked: boolean, item: EvaluationData, result: EvaluationResult, perspective: EvaluationPerspective) {

    this.onTextLikertMismatchChange(item, result, perspective.perspective_id, checked);

  }


  onTextLikertMismatchChange(
    item: EvaluationData,
    result: EvaluationResult,
    perspective: EvaluationPerspective
  ): void;


  onTextLikertMismatchChange(
    item: EvaluationData,
    result: EvaluationResult,
    perspective_id: string,
    text_likert_mismatch: boolean
  ): void;


  onTextLikertMismatchChange(
      item: EvaluationData,
      result: EvaluationResult,
      perspectiveOrId: EvaluationPerspective | string,
      textLikertMismatch?: boolean  ): void {

    let partialFeedbackData: EvaluationFeedbackDataPartial;

    if (typeof perspectiveOrId === 'string' && typeof textLikertMismatch === 'boolean') {
      // Handle the overload where perspective_id and text_likert_mismatch are provided
      partialFeedbackData = {
        agent: item.agent_id,
        tags: item.tags,
        itemId: item.item_id,
        contextId: item.context.context_id,
        personaId: item.persona_id,
        perspectiveId: perspectiveOrId,
        classificationName: result.classification_name,
        textLikertMismatch: textLikertMismatch
      };
    } else if (typeof perspectiveOrId !== 'string' && textLikertMismatch === undefined) {
      // Handle the overload where a full perspective object is provided
      const perspective = perspectiveOrId as EvaluationPerspective;
      partialFeedbackData = {
        agent: item.agent_id,
        tags: item.tags,
        itemId: item.item_id,
        contextId: item.context.context_id,
        personaId: item.persona_id,
        perspectiveId: perspective.perspective_id,
        classificationName: result.classification_name,
        textLikertMismatch: perspective.feedback ? perspective.feedback.text_likert_mismatch ?? false : false
      };
    } else {
      throw new Error('Invalid arguments passed to onTextLikertMismatchChange');
    }

    console.log("Partial feedback data for textLikertMismatch:", partialFeedbackData);

    this.dataService.postPartialFeedback(partialFeedbackData).subscribe(
      (response) => {
        this.toastr.success("Partial feedback updated successfully.");
        console.log("Partial feedback update response:", response);
      },
      (error) => {
        this.toastr.error("Error updating partial feedback.");
        console.error("Error during partial feedback update:", error);
      }
    );
  }


  agreeWithEvaluation(
    item: EvaluationData,
    result: EvaluationResult,
    perspective: EvaluationPerspective
  ) {
    console.log("Agree with the evaluation clicked");
    this.onFeedbackChange(item, result, perspective, null);
    setTimeout(() => {
      this.loadData();
    }, 500);
  }


  getDefaultLikertValue(perspective: EvaluationPerspective): number {
    if (perspective.feedback && perspective.feedback.new_evaluation_likert_val !== undefined) {
      if (perspective.feedback.new_evaluation_likert_val < 0) {
        // This is the case when there is only a partial evaluation feedback
        return perspective.evaluation_likert_val;
      } else {
        return perspective.feedback.new_evaluation_likert_val;
      }
    }
    return perspective.evaluation_likert_val;
  }


  getExistingMismatchChecked(perspective: EvaluationPerspective): boolean {
    if (perspective.feedback && perspective.feedback.text_likert_mismatch !== undefined) {
      //console.log("getExistingMismatchChecked returning value from feedback: " + perspective.feedback.text_likert_mismatch);
      return perspective.feedback.text_likert_mismatch;
    }
    //console.log("getExistingMismatchChecked has NO feedback");
    return false;
  }


  getHasFeedback(perspective: EvaluationPerspective): boolean {
    if (perspective.feedback && perspective.feedback.new_evaluation_likert_val !== undefined) {
      if (perspective.feedback.new_evaluation_likert_val  > 0) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }


  nextPage() {
    if (this.remaining > 0) {
      this.page++;
      this.loadData();
    }
  }


  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.loadData();
    }
  }


  onCountChange(): void {
    this.page = 1;
    this.loadData();
  }


  showAdditionalInfo(item: any) {
    this.selectedItem = item;
  }


  private likertLookup: { [key: number]: string } = {
    1: 'Strongly Disagree',
    2: 'Disagree',
    3: 'Neutral',
    4: 'Agree',
    5: 'Strongly Agree'
  };


  copyItemResultToClipboard(item: any, result: any): void {
    const combined = this.combineItemAndResult(item, result);
    this.utilityService.copyItemToClipboard(combined);
    console.log('Combined data copied to clipboard using UtilityService.');
  }


  private combineItemAndResult(item: any, result: any): any {

    const firstPerspective = result.perspectives[0] || {};
    const feedback = firstPerspective.feedback || {};

    return {
      agent_id: item.agent_id,
      item_id: item.item_id,
      timestamp: item.timestamp,
      tags: item.tags?.join(', ') || '',
      evaluate_source_channel: item.evaluate_source_channel,
      evaluate_time: item.evaluate_time,
      evaluate_text: item.evaluate_text,
      evaluate_title: item.evaluate_title,
      persona_id: item.persona_id,
      persona_name: item.persona_name,
      context_id: item.context?.context_id,
      info_originator: item.info?.originator,
      info_item_url: item.info?.item_url,
      info_item_type_desc: item.info?.item_type_desc,
      info_item_from_personal: item.info?.item_from?.personal || null,
      info_item_to_personal: item.info?.item_to?.[0]?.personal || null,

      feedback_new_evaluation_likert_val: feedback.new_evaluation_likert_val || null,
      feedback_new_evaluation_likert_text: this.likertLookup[feedback.new_evaluation_likert_val] || 'Unknown',
      feedback_changed: feedback.old_evaluation_likert_val !== feedback.new_evaluation_likert_val,

      "result.classification_name": result.classification_name,
      "result.classification_value": result.classification_value,
      "result.classification_options": result.classification_options?.join(', ') || '',
      "result.perspective_id": firstPerspective.perspective_id,
      "result.evaluation_likert_val": firstPerspective.evaluation_likert_val,
      "result.evaluation_likert_text": firstPerspective.evaluation_likert_text,
      "result.evaluation_text": firstPerspective.evaluation_text,
      "result.evaluated_selection": firstPerspective.evaluated_selection,
      "result.mode": firstPerspective.mode
    };
  }

}
