import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ContextService } from '../shared/context.service';
import type { AnalysisMode, SourceDefinition, SourceTier } from '../shared/models';

interface SourceGroup {
  tier: SourceTier;
  label: string;
  sources: SourceDefinition[];
  allSelected: boolean;
}

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export default class Home implements OnInit {
  readonly ctx = inject(ContextService);
  readonly #fb = inject(FormBuilder);
  readonly #router = inject(Router);

  readonly analysisModes: { value: AnalysisMode; label: string; detail: string }[] = [
    {
      value: 'smart',
      label: 'Smart Organization',
      detail: 'Fast, deterministic. Dedupe, categorize, rank by recency & convergence.',
    },
    {
      value: 'ai',
      label: 'AI Deep Dive',
      detail: 'Slower. Summarize, detect contradictions, infer gaps, score risks.',
    },
    {
      value: 'both',
      label: 'Both (Smart, then AI)',
      detail: 'Show organized findings first, then layer AI analysis on top.',
    },
  ];

  readonly form = this.#fb.nonNullable.group({
    topic: ['', Validators.required],
    decision: [''],
    timeHorizonMonths: [24, Validators.required],
    analysisMode: ['smart' as AnalysisMode, Validators.required],
    uploadedFiles: [''],
  });

  readonly sources = this.ctx.sources;
  readonly selectedSources = signal<Set<string>>(new Set());
  readonly errorMessage = signal<string | null>(null);

  readonly selectedSourceCount = computed(() => this.selectedSources().size);

  readonly sourceGroups = computed<SourceGroup[]>(() => {
    const all = this.sources();
    const selected = this.selectedSources();
    const groups: { tier: SourceTier; label: string }[] = [
      { tier: 'public', label: 'Public — no login required' },
      { tier: 'mcp', label: 'Internal (MCP-ready)' },
      { tier: 'manual-export', label: 'Login-required — manual export' },
    ];
    return groups.map((g) => {
      const list = all.filter((s) => s.tier === g.tier);
      return {
        tier: g.tier,
        label: g.label,
        sources: list,
        allSelected: list.length > 0 && list.every((s) => selected.has(s.id)),
      };
    });
  });

  ngOnInit(): void {
    this.ctx.loadSources().subscribe({
      next: (res) => {
        // Default: select all public sources.
        const initial = new Set(res.sources.filter((s) => s.tier === 'public').map((s) => s.id));
        this.selectedSources.set(initial);
      },
      error: () => {
        this.errorMessage.set(
          'Could not reach the backend. Start it with: npm run server (port 4300), then refresh.',
        );
      },
    });
  }

  isSelected(id: string): boolean {
    return this.selectedSources().has(id);
  }

  toggleSource(id: string): void {
    const next = new Set(this.selectedSources());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.selectedSources.set(next);
  }

  toggleGroup(tier: SourceTier): void {
    const group = this.sourceGroups().find((g) => g.tier === tier);
    if (!group) return;
    const next = new Set(this.selectedSources());
    if (group.allSelected) {
      group.sources.forEach((s) => next.delete(s.id));
    } else {
      group.sources.forEach((s) => next.add(s.id));
    }
    this.selectedSources.set(next);
  }

  anyExportSourceSelected(): boolean {
    return this.sources().some((s) => s.requiresExport && this.selectedSources().has(s.id));
  }

  run(): void {
    if (!this.form.valid) return;
    const raw = this.form.getRawValue();
    const uploaded = raw.uploadedFiles
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    this.ctx
      .analyze({
        topic: raw.topic,
        decision: raw.decision,
        timeHorizonMonths: raw.timeHorizonMonths,
        analysisMode: raw.analysisMode,
        sources: Array.from(this.selectedSources()),
        uploadedFiles: uploaded,
      })
      .subscribe({
        next: (res) => {
          this.#router.navigate(['/context', res.analysis.id, 'dashboard']);
        },
        error: (err) => {
          this.errorMessage.set(
            `Analysis failed: ${err?.message ?? 'unknown error'}. Is the backend running on port 4300?`,
          );
        },
      });
  }
}
