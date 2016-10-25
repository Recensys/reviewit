import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router'

import { Field, StringField, BooleanField, CheckboxField, NumberField, RadioField, ResourceField, FieldComponent } from '../../field';
import { InputTextModule, ButtonModule, RadioButton } from 'primeng/primeng';
import { DataType, FieldDTO } from '../../model';
import { DatafieldeditorService } from './datafieldeditor.service'
import { MessageService } from '../../core'


@Component({
  
  selector: 'app-datafieldeditor',
  templateUrl: 'datafieldeditor.component.html',
  styleUrls: ['datafieldeditor.component.css']
})
export class DatafieldeditorComponent implements OnInit {

  fields: FieldDTO[] = [];
  newField: Field ;
  studyId: number;

  selection: FieldDTO;

  dataTypes = DataType;

  constructor(
    private api: DatafieldeditorService,
    private route: ActivatedRoute,
    private msg: MessageService
  ) { }

  ngOnInit() {
    this.route.parent.params.forEach((params: Params) => {
			let studyId = +params['id'];
      this.studyId = studyId;
      this.api.get(studyId).subscribe(
        dtos => this.fields = dtos,
        error => this.msg.addError(error)
      );
    });
  }

  addNewField(){
    let field = new FieldDTO();
    field.DataType = DataType.Boolean;
    field.Name = "new field";
    this.fields.push(field);
  }

  selectField(field: Field){
    this.newField = field;
  }

  save(){
    this.api.save(this.studyId, this.fields).subscribe(
      bool => {
        if(bool) this.msg.addInfo('fields updated')
      },
      error => this.msg.addError(error)
    );
  }

  
}

