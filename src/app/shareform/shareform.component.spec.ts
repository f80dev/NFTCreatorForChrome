import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareformComponent } from './shareform.component';

describe('ShareformComponent', () => {
  let component: ShareformComponent;
  let fixture: ComponentFixture<ShareformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
