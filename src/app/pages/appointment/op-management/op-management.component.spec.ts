import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpManagementComponent } from './op-management.component';

describe('OpManagementComponent', () => {
  let component: OpManagementComponent;
  let fixture: ComponentFixture<OpManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
