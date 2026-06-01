import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import type { ContextAnalysis, ContextRequest, SourceDefinition } from './models';

const API_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class ContextService {
  readonly #http = inject(HttpClient);

  readonly current = signal<ContextAnalysis | null>(null);
  readonly sources = signal<SourceDefinition[]>([]);
  readonly loading = signal(false);

  loadSources(): Observable<{ sources: SourceDefinition[] }> {
    return this.#http
      .get<{ sources: SourceDefinition[] }>(`${API_BASE}/sources`)
      .pipe(tap((res) => this.sources.set(res.sources)));
  }

  analyze(req: ContextRequest): Observable<{ analysis: ContextAnalysis }> {
    this.loading.set(true);
    return this.#http.post<{ analysis: ContextAnalysis }>(`${API_BASE}/context/analyze`, req).pipe(
      tap({
        next: (res) => {
          this.current.set(res.analysis);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      }),
    );
  }

  loadById(id: string): Observable<{ analysis: ContextAnalysis }> {
    return this.#http
      .get<{ analysis: ContextAnalysis }>(`${API_BASE}/context/${id}`)
      .pipe(tap((res) => this.current.set(res.analysis)));
  }

  search(
    id: string,
    q: string,
  ): Observable<{
    findings: ContextAnalysis['findings'];
    decisions: ContextAnalysis['decisions'];
    risks: ContextAnalysis['risks'];
  }> {
    return this.#http.get<{
      findings: ContextAnalysis['findings'];
      decisions: ContextAnalysis['decisions'];
      risks: ContextAnalysis['risks'];
    }>(`${API_BASE}/context/${id}/search`, { params: { q } });
  }
}
