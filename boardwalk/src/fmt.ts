import * as moment from 'moment';

const timeFormat = 'YYYY-MM-DD HH:mm:ssZZ';

export function FormatDuration(seconds: number): string {
  const week = 7 * 24 * 60 * 60;
  const day = 24 * 60 * 60;
  const hour = 60 * 60;
  const minute = 60;
  var res = '';
  if (seconds >= week) {
    var weeks = Math.floor(seconds / week);
    res = res + weeks.toString() + 'w';
    seconds = seconds - weeks * week;
  }
  if (seconds >= day) {
    var days = Math.floor(seconds / day);
    res = res + days.toString() + 'd';
    seconds = seconds - days * day;
  }
  if (seconds >= hour) {
    var hours = Math.floor(seconds / hour);
    res = res + hours.toString() + 'h';
    seconds = seconds - hours * hour;
  }
  if (seconds >= minute) {
    var minutes = Math.floor(seconds / minute);
    res = res + minutes.toString() + 'm';
    seconds = seconds - minutes * minute;
  }
  if (seconds > 0) {
    res = res + seconds.toString() + 's';
  }
  return res;
}

export function FormatDate(date: Date): string {
  return moment(date).format(timeFormat);
}
