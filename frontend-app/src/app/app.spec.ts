import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SkyShellComponent } from '@blackbaud-internal/skyux-shell';
import { provideSkyuxTesting } from '@blackbaud-internal/skyux-shell/testing';

import { App } from './app';

@Component({
  selector: 'skyux-app-shell',
  template: '<div class="shell-wrapper"><ng-content /></div>',
})
class MockShellComponent {}

@Component({
  selector: 'app-mock-shell',
  template: '<div class="hello-test">Hello</div>',
})
class AppRouteTestComponent {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideSkyuxTesting(),
        provideRouter([
          {
            component: AppRouteTestComponent,
            path: '',
          },
        ]),
      ],
    }).compileComponents();

    TestBed.overrideComponent(App, {
      remove: {
        imports: [SkyShellComponent],
      },
      add: {
        imports: [MockShellComponent],
      },
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should contain a router outlet wrapped by the app shell component', async () => {
    const fixture = TestBed.createComponent(App);
    const compiled = fixture.nativeElement as HTMLElement;

    const router = TestBed.inject(Router);
    await router.navigate(['']);
    fixture.detectChanges();

    expect(compiled.querySelector('.shell-wrapper .hello-test')?.textContent).toContain('Hello');
  });
});
