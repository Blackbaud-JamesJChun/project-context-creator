import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ContextService } from '../../shared/context.service';
import type { Finding, PastDecision, RiskOrConstraint } from '../../shared/models';

@Component({
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './search.html',
  styleUrl: './../context-shell.scss',
})
export default class Search {
  readonly ctx = inject(ContextService);
  readonly #route = inject(ActivatedRoute);

  readonly query = signal('');
  readonly findings = signal<Finding[]>([]);
  readonly decisions = signal<PastDecision[]>([]);
  readonly risks = signal<RiskOrConstraint[]>([]);
  readonly searched = signal(false);

  run(): void {
    const id = this.#route.parent?.snapshot.paramMap.get('id');
    if (!id) return;
    const q = this.query().trim();
    if (!q) return;
    this.ctx.search(id, q).subscribe((res) => {
      this.findings.set(res.findings);
      this.decisions.set(res.decisions);
      this.risks.set(res.risks);
      this.searched.set(true);
    });
  }
}
