export interface StoreStatus {
  isOpen: boolean;
  statusBadgeRo: string;
  statusBadgeEn: string;
  statusBadgeIt: string;
  scheduleSnippetRo: string;
  scheduleSnippetEn: string;
  scheduleSnippetIt: string;
  statusTextRo: string;
  statusTextEn: string;
  statusTextIt: string;
  subtextRo: string;
  subtextEn: string;
  subtextIt: string;
}

export function getStoreStatus(): StoreStatus {
  try {
    const now = new Date();
    // Robust date & time extraction in Europe/Bucharest timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Bucharest',
      hour12: false,
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
    });

    const parts = formatter.formatToParts(now);
    let weekdayStr = 'Mon';
    let hours = 10;
    let minutes = 0;

    for (const part of parts) {
      if (part.type === 'weekday') weekdayStr = part.value; // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
      if (part.type === 'hour') {
        const val = parseInt(part.value, 10);
        hours = val === 24 ? 0 : val;
      }
      if (part.type === 'minute') minutes = parseInt(part.value, 10);
    }

    const currentMinutes = hours * 60 + minutes;
    const openMinutes = 9 * 60 + 30; // 09:30 (570 minutes)
    const closeMinutes = 17 * 60 + 30; // 17:30 (1050 minutes)

    const isMondayToThursday = ['Mon', 'Tue', 'Wed', 'Thu'].includes(weekdayStr);
    const isFriday = weekdayStr === 'Fri';
    const isWeekday = isMondayToThursday || isFriday;
    const isWithinHours = isWeekday && currentMinutes >= openMinutes && currentMinutes < closeMinutes;

    if (isWithinHours) {
      const remainingMinutes = closeMinutes - currentMinutes;
      const hoursLeft = Math.floor(remainingMinutes / 60);
      const minsLeft = remainingMinutes % 60;

      let timeLeftRo = `${minsLeft} min`;
      if (hoursLeft > 0) {
        timeLeftRo = minsLeft > 0 ? `${hoursLeft}h ${minsLeft} min` : `${hoursLeft}h`;
      }

      let timeLeftEn = `${minsLeft} min`;
      if (hoursLeft > 0) {
        timeLeftEn = minsLeft > 0 ? `${hoursLeft}h ${minsLeft} min` : `${hoursLeft}h`;
      }

      let timeLeftIt = `${minsLeft} min`;
      if (hoursLeft > 0) {
        timeLeftIt = minsLeft > 0 ? `${hoursLeft}h ${minsLeft} min` : `${hoursLeft}h`;
      }

      return {
        isOpen: true,
        statusBadgeRo: 'Deschis acum',
        statusBadgeEn: 'Open now',
        statusBadgeIt: 'Aperto ora',
        scheduleSnippetRo: `Se închide în ${timeLeftRo}`,
        scheduleSnippetEn: `Closes in ${timeLeftEn}`,
        scheduleSnippetIt: `Chiude tra ${timeLeftIt}`,
        statusTextRo: 'Deschis acum în Craiova',
        statusTextEn: 'Open now in Craiova',
        statusTextIt: 'Aperto ora a Craiova',
        subtextRo: `Închidem la 17:30 (în ${timeLeftRo})`,
        subtextEn: `Closes at 17:30 (in ${timeLeftEn})`,
        subtextIt: `Chiude alle 17:30 (tra ${timeLeftIt})`,
      };
    } else {
      let nextOpenRo = 'Luni la 09:30';
      let nextOpenEn = 'Monday at 09:30';
      let nextOpenIt = 'Lunedì alle 09:30';

      if (isWeekday && currentMinutes < openMinutes) {
        nextOpenRo = 'Azi la 09:30';
        nextOpenEn = 'Today at 09:30';
        nextOpenIt = 'Oggi alle 09:30';
      } else if (isMondayToThursday && currentMinutes >= closeMinutes) {
        nextOpenRo = 'Mâine la 09:30';
        nextOpenEn = 'Tomorrow at 09:30';
        nextOpenIt = 'Domani alle 09:30';
      } else {
        // Friday after 17:30, Saturday, Sunday
        nextOpenRo = 'Luni la 09:30';
        nextOpenEn = 'Monday at 09:30';
        nextOpenIt = 'Lunedì alle 09:30';
      }

      return {
        isOpen: false,
        statusBadgeRo: 'Momentan închis',
        statusBadgeEn: 'Currently closed',
        statusBadgeIt: 'Attualmente chiuso',
        scheduleSnippetRo: `Deschidem ${nextOpenRo.toLowerCase()}`,
        scheduleSnippetEn: `Opens ${nextOpenEn.toLowerCase()}`,
        scheduleSnippetIt: `Apre ${nextOpenIt.toLowerCase()}`,
        statusTextRo: 'Momentan închis',
        statusTextEn: 'Currently closed',
        statusTextIt: 'Attualmente chiuso',
        subtextRo: `Deschidem ${nextOpenRo} (Str. Amaradia 29)`,
        subtextEn: `Opens ${nextOpenEn} (Amaradia St. 29)`,
        subtextIt: `Apre ${nextOpenIt} (Via Amaradia 29)`,
      };
    }
  } catch (e) {
    return {
      isOpen: false,
      statusBadgeRo: 'Program L-V',
      statusBadgeEn: 'Mon-Fri schedule',
      statusBadgeIt: 'Orario Lun-Ven',
      scheduleSnippetRo: '09:30 - 17:30',
      scheduleSnippetEn: '09:30 - 17:30',
      scheduleSnippetIt: '09:30 - 17:30',
      statusTextRo: 'Program: Luni - Vineri 09:30 - 17:30',
      statusTextEn: 'Hours: Mon - Fri 09:30 - 17:30',
      statusTextIt: 'Orario: Lun - Ven 09:30 - 17:30',
      subtextRo: 'Str. Amaradia, Nr. 29, Craiova',
      subtextEn: '29 Amaradia St., Craiova',
      subtextIt: 'Via Amaradia, N. 29, Craiova',
    };
  }
}
