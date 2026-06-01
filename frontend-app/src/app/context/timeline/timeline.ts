import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ContextService } from '../../shared/context.service';

interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  body: string;
  kind: 'decision' | 'risk' | 'finding';
  owner?: string;
  outcome?: string;
}

@Component({
  imports: [CommonModule, DatePipe],
  templateUrl: './timeline.html',
  styleUrl: './../context-shell.scss',
})
export default class Timeline {
  readonly ctx = inject(ContextService);

  readonly entries = computed<TimelineEntry[]>(() => {
    const a = this.ctx.current();
    if (!a) return [];
    const list: TimelineEntry[] = [
      ...a.decisions.map((d) => ({
        id: d.id,
        date: d.date,
        title: d.decision,
        body: d.why,
        kind: 'decision' as const,
        owner: d.owner,
        outcome: d.outcome,
      })),
      ...a.risks.map((r) => ({
        id: r.id,
        date: new Date().toISOString(),
        title: r.title,
        body: r.reason,
        kind: 'risk' as const,
      })),
    ];
    return list.sort((x, y) => y.date.localeCompare(x.date));
  });
}
