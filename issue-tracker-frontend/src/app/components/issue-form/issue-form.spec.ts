import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueForm } from './issue-form';

describe('IssueForm', () => {
  let component: IssueForm;
  let fixture: ComponentFixture<IssueForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssueForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
