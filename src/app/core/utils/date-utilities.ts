export class DateUtilities {
  static formatDateTime(value: string | Date | null | undefined): string {
    if (!value) {
      return '-';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return '-';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}/${month}/${day}:${hours}:${minutes}:${seconds}`;
  }

  static formatDuration(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    // Handle string inputs first (e.g. .NET TimeSpan like "00:00:17.8272535" or "00:00:17")
    if (typeof value === 'string') {
      let raw = value;

      // Trim fractional seconds part if present (e.g. "00:00:17.8272535" -> "00:00:17")
      if (raw.includes('.')) {
        raw = raw.split('.')[0];
      }

      // If it looks like HH:MM:SS, normalize and return
      if (raw.includes(':')) {
        const parts = raw.split(':');
        if (parts.length === 3) {
          const [hStr, mStr, sStr] = parts;
          const h = Number(hStr);
          const m = Number(mStr);
          const s = Number(sStr);

          if (!isNaN(h) && !isNaN(m) && !isNaN(s)) {
            const hours = String(h).padStart(2, '0');
            const minutes = String(m).padStart(2, '0');
            const seconds = String(s).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
          }
        }
      }
    }

    const totalSeconds = typeof value === 'number' ? value : Number(value);
    if (isNaN(totalSeconds)) {
      return String(value);
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');

    return `${hStr}:${mStr}:${sStr}`;
  }
}
