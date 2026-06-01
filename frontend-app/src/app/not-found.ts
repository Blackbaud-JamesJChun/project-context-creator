/* v8 ignore file */
/* istanbul ignore file */
import { Component, inject } from '@angular/core';
import { SkyShellErrorRedirectService } from '@blackbaud-internal/skyux-shell';

@Component({
  template: '',
})
export default class NotFound {
  constructor() {
    inject(SkyShellErrorRedirectService).redirect('notfound');
  }
}
