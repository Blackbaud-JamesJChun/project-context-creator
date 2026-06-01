import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ContextService } from '../../shared/context.service';

@Component({
  imports: [CommonModule, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './../context-shell.scss',
})
export default class Dashboard {
  readonly ctx = inject(ContextService);

  readonly topFindings = computed(() => (this.ctx.current()?.findings ?? []).slice(0, 5));
  readonly otherFindings = computed(() => (this.ctx.current()?.findings ?? []).slice(5));
  readonly risks = computed(() => this.ctx.current()?.risks ?? []);
  readonly decisions = computed(() => this.ctx.current()?.decisions ?? []);
  readonly gaps = computed(() => this.ctx.current()?.gaps ?? []);
  readonly refineQ = computed(() => this.ctx.current()?.refinementQuestions ?? []);

  scoreWidth(score: number): string {
    return `${Math.round(score * 100)}%`;
  }
}
