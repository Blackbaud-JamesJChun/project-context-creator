import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ContextService } from '../shared/context.service';

@Component({
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, DatePipe],
  templateUrl: './context-shell.html',
  styleUrl: './context-shell.scss',
})
export default class ContextShell implements OnInit {
  readonly ctx = inject(ContextService);
  readonly #route = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.#route.snapshot.paramMap.get('id');
    if (!id) return;
    const current = this.ctx.current();
    if (!current || current.id !== id) {
      this.ctx.loadById(id).subscribe();
    }
  }
}
