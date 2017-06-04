import * as moment from 'moment';

const timeFormat = 'YYYY-MM-DD HH:mm:ssZZ';
const durationPattern = /^(?:(\d+)w)?(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/;

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

export function ParseDuration(durationString: string): number {
  if (!durationString) {
    return 0;
  }
  var [weeks, days, hours, minutes, seconds] = (durationString.match(durationPattern) || []).slice(1);
  var res = parseInt(weeks || '0', 10);
  res = res * 7 + parseInt(days || '0', 10);
  res = res * 24 + parseInt(hours || '0', 10);
  res = res * 60 + parseInt(minutes || '0', 10);
  res = res * 60 + parseInt(seconds || '0', 10);
  return res;
}

export function FormatDate(date: Date): string {
  return moment(date).format(timeFormat);
}
