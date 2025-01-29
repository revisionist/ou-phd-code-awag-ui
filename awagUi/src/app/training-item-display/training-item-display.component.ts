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
import { faCopy, faFileCode, faLayerGroup, faTags, faInfoCircle, faSquareCheck, faListAlt } from "@fortawesome/free-solid-svg-icons";

import { DataService } from "../data.service";
import { UtilityService } from "../utility.service";

import { GetTrainingDataResult } from "../models/training-data.model";
import { TrainingData } from "../models/training-data.model";
import { TrainingClassification } from "../models/training-data.model";
import { TrainingSubmissionData } from "../models/training-data.model";
import { TrainingSubmissionClassificationItem } from "../models/training-data.model";
import { TrainingSubmissionResponse } from "../models/training-data.model";
import { IgnoreSubmissionData } from "../models/training-data.model";
import { IgnoreSubmissionResponse } from "../models/training-data.model";

import { environment } from '../../environments/environment';


@Component({
  selector: "app-training-item-display",
  templateUrl: "./training-item-display.component.html",
  styleUrls: ["./training-item-display.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class TrainingItemDisplayComponent implements OnInit {

  // Assign class properties for imports
  faCopy = faCopy;
  faFileCode = faFileCode;
  faLayerGroup = faLayerGroup;
  faTags = faTags;
  faInfoCircle = faInfoCircle;
  faSquareCheck = faSquareCheck;
  faListAlt = faListAlt;

  // General class properties
  agentId!: string;
  agentToken!: string;
  trainingData!: TrainingData[];

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
  itemId: string | null = null;
  classificationName: string[] = [];
  type: string = '';
  onlyIncludeUntrained: boolean = true;
  subsetPercentagesStr: string | null = null;
  subsetPercent: number | null = null;
  subsetTag: string | null = null;
  cleanUi: boolean = true;
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
  classificationsDict: { [model_id: string]: string } = {};
  classificationsArray: Array<{ model_id: string, model_desc: string, checked: boolean }> = [];
  subsetTags: string[] = [];
  subsetPercentages: number[] = [];


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
    
    this.route.queryParams.subscribe(params => {
      if (params['tag'] !== undefined) {
        this.tag = params['tag'];
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
    
    this.loadTags();
    this.loadSubsets();
    this.loadClassifications();
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
        subsetTag: this.subsetTag,
        subsetPercent: this.subsetPercent
      },
      queryParamsHandling: 'merge'
    });
  }


  sortDataClassifications(classifications: TrainingClassification[]): TrainingClassification[] {
    return classifications.sort((a, b) => a.classificationName.localeCompare(b.classificationName));
  }


  loadData() {
    console.log("Loading data...");
    this.updateURLParameters();
    this.dataService
      .getTrainingData(
        this.tag,
        this.desc,
        this.page,
        this.count,
        this.onlyIncludeUntrained,
        this.lastNHours,
        this.itemId,
        this.classificationName,
        this.type,
        this.subsetPercent,
        this.subsetTag
      )
      .subscribe(
        (result: GetTrainingDataResult) => {
          console.log("Data received:", result);
          this.trainingData = result.data.map(item => {
            return {
              ...item,
                 classifications: this.sortDataClassifications(item.classifications.map(classification => {
                return {
                  ...classification,
                  selectedClassification: classification.classificationNew || classification.classificationOrig
                };
              }))
            };
          });

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
    this.dataService.getTags('classification', this.lastNHours)
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


  convertClassificationsToArray(): void {
    this.classificationsArray = Object.entries(this.classificationsDict)
      .map(([model_id, model_desc]) => ({
        model_id,
        model_desc,
        checked: true
      }))
      .sort((a, b) => a.model_id.localeCompare(b.model_id));
  }

 
  loadClassifications(): void {
  this.dataService.getModels()
    .subscribe(
      models => {
        this.classificationsArray = models.map(model => ({
          ...model,
          checked: true // Default to checked
        })).sort((a, b) => a.model_id.localeCompare(b.model_id)); // Sort by model_id

        console.log('Loaded classifications:', this.classificationsArray);
      },
      error => console.error('Error fetching classifications:', error)
    );
  }


  onClassificationChange(): void {
    
    const selectedClassifications = this.classificationsArray
                      .filter(c => c.checked)
                      .map(c => c.model_id);
    // If all checkboxes are set, don't pass a filter
    this.classificationName = selectedClassifications.length === this.classificationsArray.length ? [] : selectedClassifications;
    this.loadData();

  }


  getLongestClassificationLength(): number {
    let maxLength = 0;
    for (let item of this.trainingData) {
      for (let classification of item.classifications) {
        for (let availableClassification of classification.availableClassifications) {
          maxLength = Math.max(maxLength, availableClassification.length);
        }
      }
    }
    return maxLength;
  }


  calculateSelectBoxWidth(): string {
    const charWidth = 8;  // Average width per character in pixels
    const padding = 20;   // Additional padding in pixels
    const maxLength = this.getLongestClassificationLength();
    return `${maxLength * charWidth + padding}px`;
  }


  commitTrainingChanges(item: TrainingData) {

    const classifications = item.classifications.map(classification => ({
      classificationName: classification.classificationName,
      classificationNew: classification.selectedClassification
    }));

    const submissionData: TrainingSubmissionData = {
      agent: item.agentId,
      itemId: item.itemId,
      tag: this.tag,
      classifications: classifications,
      additionalDetails: {
          summaryInfo: item.summaryInfo
      }
    };

    var itemName = item.subject ? item.subject : (item.summaryText ? item.summaryText : item.itemId)

    //if (confirm('Are you sure you want to commit these changes for this item?')) {
        this.handleTrainingCommit(submissionData, itemName);
    //}

  }


  handleTrainingCommit(submissionData: TrainingSubmissionData, itemName: string) {

    console.log('handleTrainingCommit', submissionData);

    this.dataService.postTrainingSubmission(submissionData).subscribe(
      response => {
          var message = 'Training submitted for item:\n' + itemName;
          console.log(message, response);
          this.toastr.success(message);
          this.loadData();
      },
      error => {
          var message = 'Error submitting training for item:\n' + itemName;
          console.error(message, error);
          this.toastr.error(message);
      }
    );

  }


  ignoreItem(item: TrainingData) {

    const submissionData: IgnoreSubmissionData = {
      agent: item.agentId,
      itemId: item.itemId
    };

    var itemName = item.subject ? item.subject : (item.summaryText ? item.summaryText : item.itemId)

    if (confirm('Are you sure you want to ignore this item?')) {
        this.handleIgnoreCommit(submissionData, itemName);
    }

  }


  handleIgnoreCommit(submissionData: IgnoreSubmissionData, itemName: string) {

    console.log('handleIgnoreCommit', submissionData);

    this.dataService.postIgnoreSubmission(submissionData).subscribe(
      response => {
          var message = 'Ignoring item:\n' + itemName;
          console.log(message, response);
          this.toastr.success(message);
          this.loadData();
      },
      error => {
          var message = 'Error submitting ignore request for item:\n' + itemName;
          console.error(message, error);
          this.toastr.error(message);
      }
    );

  }


  nextPage() {
    if (this.remaining > 0) {
      this.page++;
      window.scrollTo(0, 0);
      this.loadData();
    }
  }


  previousPage() {
    if (this.page > 1) {
      this.page--;
      window.scrollTo(0, 0);
      this.loadData();
    }
  }


  onCountChange(): void {
    this.page = 1;
    window.scrollTo(0, 0);
    this.loadData();
  }

}
