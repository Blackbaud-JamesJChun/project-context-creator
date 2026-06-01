import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ContextService } from '../../shared/context.service';

@Component({
  imports: [CommonModule],
  templateUrl: './sources.html',
  styleUrl: './../context-shell.scss',
})
export default class Sources {
  readonly ctx = inject(ContextService);
  readonly scanned = computed(() => this.ctx.current()?.sourcesScanned ?? []);

  tierLabel(tier: string): string {
    switch (tier) {
      case 'public':
        return 'Public';
      case 'mcp':
        return 'MCP-ready';
      case 'manual-export':
        return 'Manual export';
      default:
        return tier;
    }
  }
}
