
import {Injectable} from "@angular/core";
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import Globals = require('../shared/globals');
import {CookieService} from 'angular2-cookie/core';
import {StageModel} from '../model/stageModel';
import {Field, StringField, ResourceField, RadioField, NumberField, CheckboxField, BooleanField} from '../field';
import {Task} from '../model/task';
import { Studydetails } from '../model';


@Injectable()
export class APIService {

  constructor(private http: Http, private _cookieService:CookieService){  }



  /***
   * USER METHODS
   */
  public ValidateUser(username: string, password: string) : Observable<string>{
    let body = JSON.stringify({'Username': username, 'Password': password});

    return this.http.post(Globals.api+'login', body, this.AuthOptions())
              .map(this.extractJson)
              .catch(this.handleError);
  }

  public CreateUser(username: string, password: string) : Observable<string> {
    let body = JSON.stringify({'Username': username, 'Password': password});
    
    let url = Globals.api+'user/create';

    return this.http.post(url, body, this.AuthOptions())
      .map(this.extractJson)
      .catch(this.handleError);
  }

  /***
   * TASK METHODS
   */
  public GetTask(id: number) : Observable<StageModel>{
    let url = Globals.api + 'task/' + id;
    return this.http.get(url, { withCredentials: true })
      .map(this.exstractStageModel.bind(this))
      .catch(this.handleError);
  }
  public GetStages(studyId: number) : Observable<StageModel[]> {
    let url = Globals.api + 'stage';
    return this.http.get(url, { withCredentials: true })
      .map(this.exstractStageModels.bind(this))
      .catch(this.handleError);
  }

  /***
   * FIELD METHODS
   */
  public GetFields(studyId: number) : Observable<Field[]> {
    let url = `${Globals.api}study/${studyId}/field`
    return this.http.get(url, { withCredentials: true })
      .map(this.extractJson)
      .catch(this.handleError);
  }


  /***
   * STAGE METHODS
   */
  public SaveDatefields(stageId: number, visible: Field[], requested: Field[]) : Observable<string> {
    let body = JSON.stringify({'Visible': visible, 'Requested': requested});
    let url = `${Globals.api}stage/${stageId}/datafields`;
    let args = new RequestOptions();
    args.withCredentials = true;
    let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8'});
    args.headers = headers;    
    return this.http.post(url, body, args)
      .map(this.exstractStatusText)
      .catch(this.handleError);
  }

  public SaveStageDetails(stageId: number, name: string, description: string) : Observable<string> {
    let body = JSON.stringify({'Name': name, 'Description': description});
    let url = `${Globals.api}stage/${stageId}/details`;
    let args = new RequestOptions();
    args.withCredentials = true;
    let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8'});
    args.headers = headers;    
    return this.http.post(url, body, args)
      .map(this.exstractStatusText)
      .catch(this.handleError);
  }


  /***
   * STUDY METHODS
   */
  public startStudy(id: number) : Observable<any> {
    let url = `${Globals.api}study/${id}/start`;
    let args = new RequestOptions();
    args.withCredentials = true;
    let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8'});
    args.headers = headers; 
    return this.http.post(url, {}, args)
      .map(this.extractJson)
      .catch(this.handleError);
  }
  public newStudy() : Observable<number> {
    let url = `${Globals.api}study/new`;
    let args = new RequestOptions();
    args.withCredentials = true;
    let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8'});
    args.headers = headers; 
    return this.http.get(url, args)
        .map(this.extractJson)
        .catch(this.handleError);
  }
  public deleteStudy(id: number){
    let url = `${Globals.api}study/${id}`;
    let args = new RequestOptions();
    args.withCredentials = true;
    let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8'});
    args.headers = headers; 
    return this.http.delete(url, args)
        .map(this.exstractStatusText)
        .catch(this.handleError);
  }
  public getStudies() : Observable<Studydetails[]>{
    let url = `${Globals.api}study/`;
    let args = new RequestOptions();
    args.withCredentials = true;
    let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8'});
    args.headers = headers; 
    return this.http.get(url, args)
        .map(this.extractJson)
        .catch(this.handleError);
  }
  public saveStudyDetails(id: number, studydetails: Studydetails) : Observable<string> {
    let body = JSON.stringify({'Id': id, 'StudyDetails': studydetails});
    console.log(body);
    let url = `${Globals.api}study/${id}`;
    let args = new RequestOptions();
    args.withCredentials = true;
    let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8'});
    args.headers = headers;    
    return this.http.put(url, body, args)
      .map(this.exstractStatusText)
      .catch(this.handleError);
  }


  /*** 
   * HELPER METHODS 
  */
  private AuthOptions () : RequestOptions {
      let token = this._cookieService.get('token');
      let args = new RequestOptions();
      args.withCredentials = true;
      let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8'});
      args.headers = headers;
      return args;
  }
  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

  private extractJson(res: Response) {
    return res.json();
  }

  private exstractStatusText(res: Response){
    return res.statusText;
  }

  private buildStageModel(json: any) : StageModel{
    let fields: Field[] = [];
    let tasks: Task[] = [];
    json['Fields'].forEach(element => {
      var field = InstanceLoader.getFieldInstance<Field>(element.DataType, element);
      fields.push(field)
    });

    json['Tasks'].forEach(element => {
      tasks.push(new Task(element));
    })

    return new StageModel(+json.Id, json.Name, json.Description, fields, tasks);
  }
  private exstractStageModel(res: Response){
    return this.buildStageModel(res.json());
  }
  private exstractStageModels(res: Response){
    let json = res.json();
    let models: StageModel[] = [];
    json.forEach(element => {
      models.push(this.buildStageModel(element));
    });
    console.log(models);
    return models;
  }


}

class InstanceLoader {

    private static map = {
      '0' : StringField,
      '1' : BooleanField,      
      '2' : RadioField,
      '3' : CheckboxField,      
      '4' : NumberField,
      '5' : ResourceField,
    }

    static getFieldInstance<T>(name: string, ...args: any[]) : T {
        var instance = Object.create(this.map[name].prototype);
        instance.constructor.apply(instance, args);
        return <T> instance;
    }

}
