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

import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { ToastrService } from "ngx-toastr";


@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
  ) { }


  copyItemToClipboard(data: any): void {

    let textToCopy: string;

    if (typeof data === "string") {
      textToCopy = data;
    } else {
      textToCopy = JSON.stringify(data, null, 2);
    }

    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    this.toastr.success("Text copied to clipboard!");

  }


  formatDateForDisplay(isoDate: string | null): string {
    if (isoDate == null) {
      return "";
    }
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    };
    return date.toLocaleString("en-GB", options);
  }


  formatStringArrayAsNiceList(items: string[]): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }


  formatStringArrayAsNiceListWithSpans(items: string[] | null, spanClass?: string): string {
    if (!items || items.length === 0) return '';

    const wrapSpan = (content: string, className?: string): string => {
      return className ? `<span class="${className}">${content}</span>` : content;
    };

    if (items.length === 1) return wrapSpan(items[0], spanClass);

    const itemsExceptLast = items.slice(0, -1).map(item => wrapSpan(item, spanClass)).join(', ');
    const lastItem = wrapSpan(items[items.length - 1], spanClass);

    return `${itemsExceptLast} and ${lastItem}`;
  }


  sanitiseHtml(html: string): string {

    return this.sanitizer.sanitize(SecurityContext.HTML, html) || '';

  }


  removeLinksFromHtml(html: string): string  {

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    if (doc.querySelector('parsererror')) {
      console.warn('Failed to parse HTML string. Returning the original input.');
      return html; // Return the original string if there's a parse error
    }

    const links = doc.querySelectorAll('a');

    // Replace each <a> element with its text content
    links.forEach(link => {
      const textNode = document.createTextNode(link.textContent || '');
      link.replaceWith(textNode);
    });

    return doc.body.innerHTML;

  }


  sanitiseAndRemoveLinksFromHtml(html: string): string  {

    let sanitised = this.sanitiseHtml(html);
    return this.removeLinksFromHtml(sanitised);

  }

}