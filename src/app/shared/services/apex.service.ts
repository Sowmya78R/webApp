import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ApexService {

  sessionUserEvent: EventEmitter<any> = new EventEmitter();
  private loaderEvent = new BehaviorSubject<boolean>(false);
  loaderEventValue = this.loaderEvent.asObservable();
  constructor() {

  }

  public SubMenu: any = new BehaviorSubject(1);
  showLoader(show: boolean) {
    this.loaderEvent.next(show);
  }
  sessionUserEmit(sessionUser: any) {
    this.sessionUserEvent.emit(sessionUser);
  }
  getPanelIconsToggle() {
    $(document).on('click', '.panel-heading span.clickable2', function (e) {
      const $this = $(this);
      if (!$this.hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideUp();
        $this.addClass('panel-collapsed');
        $this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
      } else {
        $this.parents('.panel').find('.panel-body').slideDown();
        $this.removeClass('panel-collapsed');
        $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
      }
    });
  }
  getDateFromMilliSec(data) {
    if (data) {
      const date = new Date(data);
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    }
  }
  getDateTimeFromMilliSec(data) {
    const date = new Date(data);
    const hours = ('0' + date.getHours()).slice(-2);
    const mins = ('0' + date.getMinutes()).slice(-2);
    return `${this.getDateFromMilliSec(data)}T${hours}:${mins}`;
  }
}
