import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WsWebsiteComponent } from './ws-website.component';

describe('WsWebsiteComponent', () => {
  let component: WsWebsiteComponent;
  let fixture: ComponentFixture<WsWebsiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WsWebsiteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WsWebsiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
